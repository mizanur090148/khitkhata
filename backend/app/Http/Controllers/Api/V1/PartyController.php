<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\DeliveryChallan;
use App\Models\Factory;
use App\Models\Party;
use App\Models\SubcontractOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PartyController extends Controller
{
        public function getParties(): JsonResponse
    {
        $factory = Factory::where('code', 'f1')->firstOrFail();
        $parties = Party::where('factory_id', $factory->id)->orderBy('id', 'desc')->get();

        $ordersCount = SubcontractOrder::where('factory_id', $factory->id)
            ->selectRaw('party_code, count(*) as cnt')
            ->groupBy('party_code')
            ->pluck('cnt', 'party_code');

        $bills = Bill::where('factory_code', $factory->code)->get();

        $data = $parties->map(function (Party $p) use ($ordersCount, $bills) {
            $partyBills = $bills->where('party_code', $p->code);
            $totalBilled = $partyBills->sum(function ($b) {
                $lines = is_array($b->lines_json) ? $b->lines_json : json_decode($b->lines_json ?? '[]', true);
                $amt = 0;
                foreach ($lines as $l) {
                    $amt += ((float)($l['kg'] ?? 0)) * ((float)($l['rate'] ?? 0));
                }
                return $amt;
            });
            $totalReceived = $partyBills->sum(function ($b) {
                $recv = is_array($b->payments_json) ? $b->payments_json : json_decode($b->payments_json ?? '[]', true);
                $amt = 0;
                foreach ($recv as $r) {
                    $amt += (float)($r['amt'] ?? 0);
                }
                return $amt;
            });

            $due = (float)$p->opening_balance + ($totalBilled - $totalReceived);

            return [
                'id' => $p->id,
                'code' => $p->code,
                'name' => $p->name,
                'type' => $p->type,
                'addr' => $p->address ?? '—',
                'contact' => $p->contact_person ?? '—',
                'phone' => $p->phone ?? '—',
                'email' => $p->email ?? '',
                'bin' => $p->bin_tin ?? '',
                'rate' => (float)$p->default_rate_tk,
                'terms' => $p->payment_terms ?? 'বিলের ৩০ দিনের মধ্যে',
                'open' => (float)$p->opening_balance,
                'added' => $p->added_date ? $p->added_date->format('Y-m-d') : date('Y-m-d'),
                'on' => (bool)$p->is_active,
                'orders_count' => (int)($ordersCount[$p->code] ?? 0),
                'due' => $due,
            ];
        });

        return $this->success($data, 'পার্টি তালিকা লোড হয়েছে');
    }

        public function toggleParty(int|string $id): JsonResponse
    {
        $factory = Factory::where('code', 'f1')->firstOrFail();
        $party = Party::where('factory_id', $factory->id)
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('code', $id);
            })->firstOrFail();

        $party->is_active = !$party->is_active;
        $party->save();

        $statusMsg = $party->is_active ? "{$party->name} আবার সক্রিয়" : "{$party->name} বন্ধ করা হলো — পুরোনো হিসাব থাকবে";
        return $this->success([
            'id' => $party->id,
            'code' => $party->code,
            'is_active' => (bool)$party->is_active,
            'on' => (bool)$party->is_active,
        ], $statusMsg);
    }

        public function deleteParty(int|string $id): JsonResponse
    {
        $factory = Factory::where('code', 'f1')->firstOrFail();
        $party = Party::where('factory_id', $factory->id)
            ->where(function ($q) use ($id) {
                $q->where('id', $id)->orWhere('code', $id);
            })->firstOrFail();

        $partyName = $party->name;
        $party->delete();

        return $this->success(null, "\"{$partyName}\" পার্টি মুছে ফেলা হয়েছে");
    }

        public function storeParty(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', 'string', 'in:ven,sup'],
            'addr' => ['nullable', 'string'],
            'contact' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],
            'email' => ['nullable', 'string'],
            'bin' => ['nullable', 'string'],
            'rate' => ['nullable', 'numeric'],
            'terms' => ['nullable', 'string'],
            'open' => ['nullable', 'numeric'],
        ]);

        $factory = Factory::where('code', 'f1')->firstOrFail();

        if (Party::where('factory_id', $factory->id)->whereRaw('LOWER(name) = ?', [strtolower(trim($validated['name']))])->exists()) {
            return $this->error("\"{$validated['name']}\" নামে আগেই একটা পার্টি আছে।", 422);
        }

        $code = 'p' . time() . rand(10, 99);

        $party = Party::create([
            'factory_id' => $factory->id,
            'code' => $code,
            'name' => trim($validated['name']),
            'type' => $validated['type'],
            'address' => $validated['addr'] ?: '—',
            'contact_person' => $validated['contact'] ?: '—',
            'phone' => $validated['phone'] ?: '—',
            'email' => $validated['email'] ?? '',
            'bin_tin' => $validated['bin'] ?? '',
            'default_rate_tk' => (float) ($validated['rate'] ?? 0),
            'payment_terms' => $validated['terms'] ?? 'বিলের ৩০ দিনের মধ্যে',
            'opening_balance' => (float) ($validated['open'] ?? 0),
            'added_date' => now()->toDateString(),
            'is_active' => true,
        ]);

        $partyData = [
            'id' => $party->id,
            'code' => $party->code,
            'name' => $party->name,
            'type' => $party->type,
            'addr' => $party->address ?? '—',
            'contact' => $party->contact_person ?? '—',
            'phone' => $party->phone ?? '—',
            'email' => $party->email ?? '',
            'bin' => $party->bin_tin ?? '',
            'rate' => (float)$party->default_rate_tk,
            'terms' => $party->payment_terms,
            'open' => (float)$party->opening_balance,
            'added' => $party->added_date ? $party->added_date->format('Y-m-d') : date('Y-m-d'),
            'on' => (bool)$party->is_active,
            'orders_count' => 0,
            'due' => (float)$party->opening_balance,
        ];

        return $this->success($partyData, "{$party->name} যোগ হলো · লেজার খোলা হয়েছে", 201);
    }
}
