<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Factory;
use App\Models\Party;
use App\Models\SubcontractOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillController extends Controller
{
        public function getBills(Request $request): JsonResponse
    {
        $bills = Bill::orderBy('id', 'desc')->get()->map(fn (Bill $b) => [
            'no' => $b->bill_no,
            'f' => $b->factory_code,
            'date' => $b->bill_date ? $b->bill_date->format('Y-m-d') : '2026-10-01',
            'v' => $b->party_code,
            'lines' => $b->lines_json ?? [],
            'jv' => $b->jv_no,
            'recv' => $b->payments_json ?? [],
        ]);

        return $this->success($bills, 'বিল ও ভাউচার তালিকা');
    }

        public function storeBill(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'party_code' => ['required', 'string'],
            'order_ids' => ['required', 'array', 'min:1'],
        ]);

        $orders = SubcontractOrder::whereIn('order_no', $validated['order_ids'])->get();
        $lines = $orders->map(fn (SubcontractOrder $o) => [
            'o' => $o->order_no,
            'fab' => $o->fabric_summary . ' ' . $o->gsm,
            'kg' => (float) $o->delivered_kg,
            'rate' => (float) $o->rate_tk,
        ])->values()->all();

        $billSeq = Bill::count() + 1;
        $jvSeq = Bill::count() + 927;
        $billNo = 'BL-2610-' . str_pad((string) $billSeq, 3, '0', STR_PAD_LEFT);
        $jvNo = 'JV-' . str_pad((string) $jvSeq, 4, '0', STR_PAD_LEFT);

        $bill = Bill::create([
            'bill_no' => $billNo,
            'factory_code' => 'f1',
            'party_code' => $validated['party_code'],
            'bill_date' => '2026-10-03',
            'jv_no' => $jvNo,
            'lines_json' => $lines,
            'payments_json' => [],
        ]);

        return $this->success($bill, "{$billNo} তৈরি হলো · ভাউচার {$jvNo}", 201);
    }

        public function recordBillPayment(Request $request, string $billNo): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
            'mode' => ['required', 'string'],
            'ref' => ['nullable', 'string'],
            'pending' => ['nullable', 'boolean'],
        ]);

        $bill = Bill::where('bill_no', $billNo)->firstOrFail();
        $payments = $bill->payments_json ?? [];
        $rvNo = $validated['ref'] ?? ('RV-' . str_pad((string) (count($payments) + 931), 4, '0', STR_PAD_LEFT));

        $payments[] = [
            'd' => '2026-10-03',
            'amt' => (float) $validated['amount'],
            'rv' => $rvNo,
            'mode' => $validated['mode'],
            'pend' => (bool) ($validated['pending'] ?? false),
        ];

        $bill->update(['payments_json' => $payments]);

        return $this->success($bill, "{$rvNo} তৈরি হলো · লেজার আপডেট");
    }
}
