<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\DeliveryChallan;
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
        $factory = Factory::where('code', 'f1')->first();
        $query = DeliveryChallan::query();
        if ($request->has('party_code')) {
            $query->where('party_code', $request->query('party_code'));
        }
        if ($request->has('order_no')) {
            $query->where('order_no', $request->query('order_no'));
        }
        $challans = $query->orderByDesc('id')->get()->map(fn (DeliveryChallan $c) => [
            'no' => $c->challan_no,
            'f' => $c->factory_code,
            'v' => $c->party_code,
            'o' => $c->order_no,
            'd' => $c->date_label ?? ($c->created_at ? $c->created_at->format('d M') : '03 Oct'),
            'rolls' => $c->rolls_json ?? [],
            'veh' => $c->vehicle_no,
            'drv' => $c->driver_name ?? '—',
            'ph' => $c->driver_phone ?? '—',
            'fac' => $c->factory_sign_json,
            'ven' => $c->vendor_sign_json,
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
            'signed_by' => ['nullable', 'string'],
        ]);

        $seq = DeliveryChallan::count() + 873;
        $challanNo = 'DC-' . str_pad((string) $seq, 4, '0', STR_PAD_LEFT);

        $challan = DeliveryChallan::create([
            'challan_no' => $challanNo,
            'factory_code' => 'f1',
            'party_code' => $validated['party_code'],
            'order_no' => $validated['order_no'],
            'date_label' => '03 Oct',
            'rolls_json' => $validated['rolls'],
            'vehicle_no' => $validated['vehicle_no'],
            'driver_name' => $validated['driver_name'] ?: '—',
            'driver_phone' => '—',
            'factory_sign_json' => [
                'by' => $validated['signed_by'] ?? 'শফিকুল ইসলাম',
                'at' => '03 Oct, ' . now()->format('H:i'),
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

        return $this->success($challan, "{$challanNo} তৈরি হয়েছে", 201);
    }

        public function signChallanReceipt(Request $request, string $challanNo): JsonResponse
    {
        $validated = $request->validate([
            'received_rolls' => ['required', 'integer', 'min:0'],
            'signed_by' => ['nullable', 'string'],
        ]);

        $challan = DeliveryChallan::where('challan_no', $challanNo)->firstOrFail();
        $challan->update([
            'vendor_sign_json' => [
                'by' => $validated['signed_by'] ?? 'মো. কামরুল হাসান',
                'at' => '03 Oct, ' . now()->format('H:i'),
                'got' => $validated['received_rolls'],
            ],
        ]);

        return $this->success($challan, 'চালান রিসিভ সাইন সম্পন্ন হয়েছে');
    }
}
