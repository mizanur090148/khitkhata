<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DeliveryChallan;
use App\Models\FabricRoll;
use App\Models\Factory;
use App\Models\Party;
use App\Models\SubcontractOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ChallanController extends Controller
{
    public function getChallans(Request $request): JsonResponse
    {
        $query = DeliveryChallan::query();
        if ($request->has('party_code')) {
            $query->where('party_code', $request->query('party_code'));
        }
        if ($request->has('order_no')) {
            $query->where('order_no', $request->query('order_no'));
        }
        $challans = $query->orderByDesc('id')->get()->map(fn (DeliveryChallan $c) => [
            'no' => $c->challan_no,
            'challan_no' => $c->challan_no,
            'f' => $c->factory_code,
            'v' => $c->party_code,
            'party_code' => $c->party_code,
            'o' => $c->order_no,
            'order_no' => $c->order_no,
            'd' => $c->date_label ?? ($c->created_at ? $c->created_at->format('d M') : now()->format('d M')),
            'rolls' => $c->rolls_json ?? [],
            'veh' => $c->vehicle_no,
            'vehicle_no' => $c->vehicle_no,
            'drv' => $c->driver_name ?? '—',
            'driver_name' => $c->driver_name ?? '—',
            'ph' => $c->driver_phone ?? '—',
            'driver_phone' => $c->driver_phone ?? '—',
            'fac' => $c->factory_sign_json,
            'ven' => $c->vendor_sign_json,
            'created_at' => $c->created_at?->toISOString(),
        ])->values()->all();

        return $this->success($challans, 'চালান তালিকা লোড হয়েছে');
    }

    public function storeChallan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'party_code' => ['required', 'string'],
            'order_no' => ['required', 'string'],
            'rolls' => ['required', 'array', 'min:1'],
            'vehicle_no' => ['required', 'string'],
            'driver_name' => ['nullable', 'string'],
            'driver_phone' => ['nullable', 'string'],
            'signed_by' => ['nullable', 'string'],
            'date_label' => ['nullable', 'string'],
        ]);

        $allChallanNos = DeliveryChallan::pluck('challan_no');
        $maxSeq = 872;
        foreach ($allChallanNos as $cNo) {
            if (preg_match('/(?:DC-)?(\d+)/', (string) $cNo, $matches)) {
                $num = (int) $matches[1];
                if ($num > $maxSeq) {
                    $maxSeq = $num;
                }
            }
        }
        $nextSeq = $maxSeq + 1;
        $challanNo = 'DC-' . str_pad((string) $nextSeq, 4, '0', STR_PAD_LEFT);

        $now = now();
        $dateLabel = $validated['date_label'] ?? $now->format('d M');
        $signedBy = $validated['signed_by'] ?: 'ফ্যাক্টরি ইনচার্জ';

        $challan = DeliveryChallan::create([
            'challan_no' => $challanNo,
            'factory_code' => 'f1',
            'party_code' => $validated['party_code'],
            'order_no' => $validated['order_no'],
            'date_label' => $dateLabel,
            'rolls_json' => $validated['rolls'],
            'vehicle_no' => $validated['vehicle_no'],
            'driver_name' => $validated['driver_name'] ?: '—',
            'driver_phone' => $validated['driver_phone'] ?? '—',
            'factory_sign_json' => [
                'by' => $signedBy,
                'at' => $now->format('d M, H:i'),
            ],
            'vendor_sign_json' => null,
        ]);

        FabricRoll::where('order_no', $validated['order_no'])
            ->whereIn('roll_no', $validated['rolls'])
            ->update(['challan_no' => $challanNo]);

        $order = SubcontractOrder::where('order_no', $validated['order_no'])->first();
        if ($order) {
            $challans = $order->challans_json ?? [];
            if (!in_array($challanNo, $challans, true)) {
                $challans[] = $challanNo;
                $order->update(['challans_json' => $challans]);
            }
        }

        return $this->success([
            'no' => $challan->challan_no,
            'challan_no' => $challan->challan_no,
            'f' => $challan->factory_code,
            'v' => $challan->party_code,
            'party_code' => $challan->party_code,
            'o' => $challan->order_no,
            'order_no' => $challan->order_no,
            'd' => $challan->date_label,
            'rolls' => $challan->rolls_json,
            'veh' => $challan->vehicle_no,
            'vehicle_no' => $challan->vehicle_no,
            'drv' => $challan->driver_name,
            'driver_name' => $challan->driver_name,
            'ph' => $challan->driver_phone,
            'driver_phone' => $challan->driver_phone,
            'fac' => $challan->factory_sign_json,
            'ven' => $challan->vendor_sign_json,
            'created_at' => $challan->created_at?->toISOString(),
        ], "{$challanNo} তৈরি হয়েছে", 201);
    }

    public function signChallanReceipt(Request $request, string $challanNo): JsonResponse
    {
        $validated = $request->validate([
            'received_rolls' => ['required', 'integer', 'min:0'],
            'signed_by' => ['nullable', 'string'],
        ]);

        $challan = DeliveryChallan::where('challan_no', $challanNo)->firstOrFail();
        $signedBy = $validated['signed_by'] ?: 'ভেন্ডর প্রতিনিধি';

        $challan->update([
            'vendor_sign_json' => [
                'by' => $signedBy,
                'at' => now()->format('d M, H:i'),
                'got' => $validated['received_rolls'],
            ],
        ]);

        return $this->success([
            'no' => $challan->challan_no,
            'challan_no' => $challan->challan_no,
            'f' => $challan->factory_code,
            'v' => $challan->party_code,
            'party_code' => $challan->party_code,
            'o' => $challan->order_no,
            'order_no' => $challan->order_no,
            'd' => $challan->date_label,
            'rolls' => $challan->rolls_json,
            'veh' => $challan->vehicle_no,
            'vehicle_no' => $challan->vehicle_no,
            'drv' => $challan->driver_name,
            'driver_name' => $challan->driver_name,
            'ph' => $challan->driver_phone,
            'driver_phone' => $challan->driver_phone,
            'fac' => $challan->factory_sign_json,
            'ven' => $challan->vendor_sign_json,
            'created_at' => $challan->created_at?->toISOString(),
        ], 'চালান রিসিভ সাইন সম্পন্ন হয়েছে');
    }
}
