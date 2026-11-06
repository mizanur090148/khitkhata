<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\DeliveryChallan;
use App\Models\FabricRoll;
use App\Models\Factory;
use App\Models\FactoryAttendance;
use App\Models\FactoryExpense;
use App\Models\FactoryMachine;
use App\Models\FreeMachineRequest;
use App\Models\OrderLine;
use App\Models\Partner;
use App\Models\Party;
use App\Models\ProductionLog;
use App\Models\QcInspection;
use App\Models\StoreIssueLog;
use App\Models\StoreItem;
use App\Models\SubcontractOrder;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FactoryPortalController extends Controller
{
    public function storeOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => ['required', 'string', 'max:40'],
            'vendor_name' => ['required', 'string', 'max:150'],
            'buyer' => ['required', 'string', 'max:150'],
            'qty' => ['required', 'numeric', 'min:0'],
            'order_date' => ['nullable', 'string'],
            'yarn_received_date' => ['nullable', 'string'],
            'delivery_due' => ['nullable', 'string'],
            'lines' => ['required', 'array', 'min:1'],
        ]);

        if (SubcontractOrder::where('order_no', $validated['id'])->exists()) {
            return $this->error("{$validated['id']} নামে আগেই একটা অর্ডার আছে।", 422);
        }

        $factory = Factory::where('code', 'f1')->firstOrFail();

        return DB::transaction(function () use ($validated, $factory) {
            $party = Party::where('factory_id', $factory->id)
                ->whereRaw('LOWER(name) = ?', [strtolower($validated['vendor_name'])])
                ->first();

            if (!$party) {
                $party = Party::create([
                    'factory_id' => $factory->id,
                    'code' => 'p' . time(),
                    'name' => $validated['vendor_name'],
                    'type' => 'ven',
                    'address' => '—',
                    'contact_person' => '—',
                    'phone' => '—',
                    'default_rate_tk' => 14,
                    'payment_terms' => 'বিলের ৩০ দিনের মধ্যে',
                    'opening_balance' => 0,
                    'added_date' => now()->toDateString(),
                    'is_active' => true,
                ]);
            }

            $lines = $validated['lines'];
            $allMachines = collect($lines)->pluck('machines')->flatten()->unique()->values()->all();
            $yarnIn = [];
            foreach ($lines as $line) {
                foreach ($line['yarns'] ?? [] as $y) {
                    $yarnIn[] = [
                        'count' => $y['count'] ?? '—',
                        'spinner' => $y['brand'] ?? '—',
                        'lot' => $y['lot'] ?? 'অপেক্ষমাণ',
                        'bags' => 0,
                        'kg' => 0,
                    ];
                }
            }

            $l0 = $lines[0];
            $status = (!empty($allMachines) && !empty($validated['yarn_received_date'])) ? 'run' : 'wait';

            $order = SubcontractOrder::create([
                'order_no' => $validated['id'],
                'factory_id' => $factory->id,
                'party_code' => $party->code,
                'buyer' => $validated['buyer'],
                'fabric_summary' => collect($lines)->pluck('fab')->implode(' + '),
                'gsm' => $l0['ggsm'] ?? '—',
                'finish_gsm' => $l0['fgsm'] ?? null,
                'stitch_length' => $l0['sl'] ?? null,
                'grey_dia' => $l0['gdia'] ?? null,
                'dia_gauge' => $l0['dia'] ?? '30" × 24G',
                'color' => collect($lines)->pluck('color')->filter()->unique()->implode(', ') ?: '—',
                'yarn_summary' => $l0['yarns'][0]['count'] ?? '—',
                'total_qty_kg' => (float) $validated['qty'],
                'done_kg' => 0,
                'delivered_kg' => 0,
                'daily_rate_kg' => 300,
                'rate_tk' => (float) $party->default_rate_tk ?: 14,
                'status' => $status,
                'start_label' => $status === 'run' ? date('d M', strtotime($validated['yarn_received_date'])) : '—',
                'order_date' => $validated['order_date'] ?? now()->toDateString(),
                'delivery_due_date' => $validated['delivery_due'] ?: null,
                'machines_json' => $allMachines,
                'challans_json' => [],
                'yarn_in_json' => $yarnIn,
                'week_prod_json' => [0, 0, 0, 0, 0, 0, 0],
            ]);

            foreach ($lines as $idx => $l) {
                OrderLine::create([
                    'subcontract_order_id' => $order->id,
                    'line_index' => $idx,
                    'knit_type' => $l['kt'] ?? 'c',
                    'is_yarn_dyed' => (bool) ($l['yd'] ?? false),
                    'unit' => ($l['kt'] ?? 'c') === 'f' ? 'pcs' : 'kg',
                    'placement' => $l['place'],
                    'fabrication' => $l['fab'],
                    'color' => $l['color'] ?? '—',
                    'qty' => (float) ($l['qty'] ?? 0),
                    'done_qty' => 0,
                    'delivered_qty' => 0,
                    'grey_gsm' => $l['ggsm'] ?? null,
                    'finish_gsm' => $l['fgsm'] ?? null,
                    'stitch_length' => $l['sl'] ?? null,
                    'grey_dia' => $l['gdia'] ?? null,
                    'dia_gauge' => $l['dia'] ?? null,
                    'flat_size' => $l['size'] ?? null,
                    'piece_weight_gm' => $l['pcw'] ?? null,
                    'flat_design' => $l['fdes'] ?? null,
                    'machines_json' => $l['machines'] ?? [],
                    'yarns_json' => $l['yarns'] ?? [],
                ]);
            }

            if (!empty($allMachines)) {
                FactoryMachine::where('factory_id', $factory->id)
                    ->whereIn('code', $allMachines)
                    ->update([
                        'status' => 'run:' . $order->order_no,
                        'current_order_no' => $order->order_no,
                    ]);
            }

            return $this->success($order->load('lines'), "{$order->order_no} সেভ হয়েছে", 201);
        });
    }

    public function toggleOrderMachine(Request $request, string $orderNo): JsonResponse
    {
        $validated = $request->validate([
            'machine_code' => ['required', 'string'],
        ]);

        $order = SubcontractOrder::where('order_no', $orderNo)->firstOrFail();
        $machines = $order->machines_json ?? [];
        $mCode = $validated['machine_code'];

        if (in_array($mCode, $machines, true)) {
            $machines = array_values(array_diff($machines, [$mCode]));
            FactoryMachine::where('factory_id', $order->factory_id)
                ->where('code', $mCode)
                ->update(['status' => 'idle', 'current_order_no' => null]);
        } else {
            $machines[] = $mCode;
            FactoryMachine::where('factory_id', $order->factory_id)
                ->where('code', $mCode)
                ->update(['status' => 'run:' . $orderNo, 'current_order_no' => $orderNo]);
        }

        $order->update(['machines_json' => $machines]);

        return $this->success(['machines' => $machines], 'মেশিন বরাদ্দ আপডেট হয়েছে');
    }

    public function storeProductionEntry(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_no' => ['required', 'string'],
            'placement_index' => ['required', 'integer', 'min:0'],
            'machine_code' => ['required', 'string'],
            'shift' => ['required', 'string'],
            'operator_name' => ['nullable', 'string'],
            'qty_kg' => ['required', 'numeric', 'min:0.1'],
            'rolls_count' => ['nullable', 'integer', 'min:0'],
            'roll_weights' => ['nullable', 'array'],
            'yarn_lot' => ['nullable', 'string'],
            'fault_code' => ['nullable', 'string'],
            'fault_desc' => ['nullable', 'string'],
        ]);

        $order = SubcontractOrder::with('lines')->where('order_no', $validated['order_no'])->firstOrFail();

        return DB::transaction(function () use ($validated, $order) {
            $kg = (float) $validated['qty_kg'];
            $rollWeights = $validated['roll_weights'] ?? [];
            $rollsCount = !empty($rollWeights) ? count($rollWeights) : (int) ($validated['rolls_count'] ?? 1);

            $order->increment('done_kg', $kg);
            $order->increment('today_prod_kg', $kg);

            $line = $order->lines->values()->get($validated['placement_index']);
            if ($line) {
                $line->increment('done_qty', $kg);
            }

            $log = ProductionLog::create([
                'subcontract_order_id' => $order->id,
                'order_no' => $order->order_no,
                'placement_index' => $validated['placement_index'],
                'date_label' => '03 Oct',
                'shift' => $validated['shift'],
                'machine_code' => $validated['machine_code'],
                'operator_name' => $validated['operator_name'] ?: '—',
                'qty_kg' => $kg,
                'rolls_count' => $rollsCount,
                'yarn_lot' => $validated['yarn_lot'] ?: '—',
                'fault_code' => $validated['fault_code'] ?? '',
            ]);

            $existingCount = FabricRoll::where('order_no', $order->order_no)
                ->where('machine_code', $validated['machine_code'])
                ->count();

            $weightsToCreate = !empty($rollWeights)
                ? $rollWeights
                : ($rollsCount > 0 ? array_fill(0, $rollsCount, round($kg / $rollsCount, 1)) : []);

            $lastRollNo = null;
            foreach ($weightsToCreate as $idx => $w) {
                $seq = str_pad((string) ($existingCount + $idx + 1), 3, '0', STR_PAD_LEFT);
                $rollNo = $validated['machine_code'] . '/' . $seq;
                $lastRollNo = $rollNo;
                $faults = [];
                if (!empty($validated['fault_code']) && $idx === count($weightsToCreate) - 1) {
                    $faults[$validated['fault_code']] = 1;
                }

                FabricRoll::create([
                    'roll_no' => $rollNo,
                    'jc_seq' => $seq,
                    'order_no' => $order->order_no,
                    'placement_index' => $validated['placement_index'],
                    'machine_code' => $validated['machine_code'],
                    'date_label' => '03 Oct',
                    'shift' => $validated['shift'],
                    'operator_name' => $validated['operator_name'] ?: '—',
                    'weight_kg' => (float) $w,
                    'yarn_lot' => $validated['yarn_lot'] ?: '—',
                    'faults_json' => $faults,
                ]);
            }

            if (!empty($validated['fault_code'])) {
                $qcCount = QcInspection::count() + 105;
                QcInspection::create([
                    'qc_no' => 'QC-' . str_pad((string) $qcCount, 4, '0', STR_PAD_LEFT),
                    'order_no' => $order->order_no,
                    'placement_index' => $validated['placement_index'],
                    'placement_name' => $line?->placement ?? 'Body',
                    'date_label' => '03 Oct',
                    'roll_no' => $lastRollNo ?? ($validated['machine_code'] . '/001'),
                    'machine_code' => $validated['machine_code'],
                    'weight_kg' => !empty($weightsToCreate) ? (float) end($weightsToCreate) : 22,
                    'issue_description' => $validated['fault_code'] . (!empty($validated['fault_desc']) ? ' — ' . $validated['fault_desc'] : ''),
                    'source' => 'floor',
                    'factory_sign_json' => ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
                    'vendor_sign_json' => ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
                ]);
            }

            return $this->success($log, 'প্রোডাকশন এন্ট্রি ও জব কার্ড আপডেট হয়েছে', 201);
        });
    }

    public function storeQcInspection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_no' => ['required', 'string'],
            'placement_index' => ['required', 'integer', 'min:0'],
            'roll_no' => ['required', 'string'],
            'machine_code' => ['nullable', 'string'],
            'weight_kg' => ['nullable', 'numeric'],
            'issue' => ['required', 'string'],
            'verdict' => ['required', 'string', 'in:ok,bad'],
            'note' => ['nullable', 'string'],
            'side' => ['required', 'string', 'in:fac,ven'],
            'signed_by' => ['required', 'string'],
        ]);

        $qcCount = QcInspection::count() + 105;
        $qcNo = 'QC-' . str_pad((string) $qcCount, 4, '0', STR_PAD_LEFT);
        $blank = ['v' => null, 'by' => '', 'at' => '', 'note' => ''];
        $signed = [
            'v' => $validated['verdict'],
            'by' => $validated['signed_by'],
            'at' => '03 Oct, ' . now()->format('H:i'),
            'note' => $validated['note'] ?? '',
        ];

        $qc = QcInspection::create([
            'qc_no' => $qcNo,
            'order_no' => $validated['order_no'],
            'placement_index' => $validated['placement_index'],
            'date_label' => '03 Oct',
            'roll_no' => $validated['roll_no'],
            'machine_code' => $validated['machine_code'] ?? '—',
            'weight_kg' => (float) ($validated['weight_kg'] ?? 22),
            'issue_description' => $validated['issue'],
            'source' => $validated['side'],
            'factory_sign_json' => $validated['side'] === 'fac' ? $signed : $blank,
            'vendor_sign_json' => $validated['side'] === 'ven' ? $signed : $blank,
            'action_taken' => '',
        ]);

        return $this->success($qc, "{$qcNo} জমা হয়েছে", 201);
    }

    public function signQcInspection(Request $request, string $qcNo): JsonResponse
    {
        $validated = $request->validate([
            'side' => ['required', 'string', 'in:fac,ven'],
            'verdict' => ['required', 'string', 'in:ok,bad'],
            'signed_by' => ['required', 'string'],
            'note' => ['nullable', 'string'],
            'action_taken' => ['nullable', 'string'],
        ]);

        $qc = QcInspection::where('qc_no', $qcNo)->firstOrFail();
        $signData = [
            'v' => $validated['verdict'],
            'by' => $validated['signed_by'],
            'at' => '03 Oct, ' . now()->format('H:i'),
            'note' => $validated['note'] ?? '',
        ];

        if ($validated['side'] === 'fac') {
            $qc->factory_sign_json = $signData;
        } else {
            $qc->vendor_sign_json = $signData;
        }

        if (isset($validated['action_taken'])) {
            $qc->action_taken = $validated['action_taken'];
        }

        $qc->save();

        return $this->success($qc, 'QC সাইন সংরক্ষিত হয়েছে');
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

    public function receiveYarn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_no' => ['required', 'string'],
            'count' => ['required', 'string'],
            'spinner' => ['nullable', 'string'],
            'lot' => ['nullable', 'string'],
            'bags' => ['nullable', 'integer'],
            'kg' => ['required', 'numeric', 'min:0.1'],
        ]);

        $order = SubcontractOrder::where('order_no', $validated['order_no'])->firstOrFail();
        $yarnIn = $order->yarn_in_json ?? [];
        $yarnIn[] = [
            'count' => $validated['count'],
            'spinner' => $validated['spinner'] ?: '—',
            'lot' => $validated['lot'] ?: '—',
            'bags' => (int) ($validated['bags'] ?? 0),
            'kg' => (float) $validated['kg'],
        ];
        $order->update(['yarn_in_json' => $yarnIn]);

        return $this->success($order, "{$order->order_no}-এ সুতা যোগ হয়েছে");
    }

    public function storeStockMovement(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'item_code' => ['required', 'string'],
            'type' => ['required', 'string', 'in:in,out,rfq'],
            'qty' => ['nullable', 'integer', 'min:1'],
            'price' => ['nullable', 'numeric'],
            'machine_code' => ['nullable', 'string'],
            'issued_by' => ['nullable', 'string'],
        ]);

        $item = StoreItem::where('item_code', $validated['item_code'])->firstOrFail();

        if ($validated['type'] === 'rfq') {
            $item->update(['rfq_sent' => true]);
            return $this->success($item, 'কোটেশন অনুরোধ পাঠানো হয়েছে');
        }

        $qty = (int) ($validated['qty'] ?? 1);
        if ($validated['type'] === 'out') {
            if ($qty > $item->stock_qty) {
                return $this->error("স্টকে আছে মাত্র {$item->stock_qty} {$item->unit}", 422);
            }
            $item->decrement('stock_qty', $qty);
            StoreIssueLog::create([
                'item_code' => $item->item_code,
                'date_label' => '03 Oct',
                'machine_code' => $validated['machine_code'] ?? 'সব মেশিন',
                'qty' => $qty,
                'issued_by' => $validated['issued_by'] ?? 'শফিকুল',
            ]);
        } else {
            $item->increment('stock_qty', $qty);
            if (!empty($validated['price'])) {
                $item->update(['unit_price' => (float) $validated['price']]);
            }
        }

        return $this->success($item->fresh(), 'স্টোর স্টক আপডেট হয়েছে');
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

        if (Party::where('factory_id', $factory->id)->whereRaw('LOWER(name) = ?', [strtolower($validated['name'])])->exists()) {
            return $this->error("\"{$validated['name']}\" নামে আগেই একটা পার্টি আছে।", 422);
        }

        $party = Party::create([
            'factory_id' => $factory->id,
            'code' => 'p' . time(),
            'name' => $validated['name'],
            'type' => $validated['type'],
            'address' => $validated['addr'] ?: '—',
            'contact_person' => $validated['contact'] ?: '—',
            'phone' => $validated['phone'] ?: '—',
            'email' => $validated['email'] ?? '',
            'bin_tin' => $validated['bin'] ?? '',
            'default_rate_tk' => (float) ($validated['rate'] ?? 0),
            'payment_terms' => $validated['terms'] ?? 'বিলের ৩০ দিনের মধ্যে',
            'opening_balance' => (float) ($validated['open'] ?? 0),
            'added_date' => '2026-10-03',
            'is_active' => true,
        ]);

        return $this->success($party, "{$party->name} যোগ হলো · লেজার খোলা হয়েছে", 201);
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

    public function storeExpense(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'max:40'],
            'title' => ['required', 'string', 'max:180'],
            'amount_tk' => ['required', 'numeric', 'min:1'],
            'payment_method' => ['required', 'string', 'in:cash,bank,bkash'],
            'reference_no' => ['nullable', 'string', 'max:40'],
            'expense_date' => ['nullable', 'date'],
            'created_by' => ['nullable', 'string', 'max:60'],
            'notes' => ['nullable', 'string'],
        ]);

        $factory = Factory::where('code', 'f1')->firstOrFail();

        $expense = FactoryExpense::create([
            'factory_id' => $factory->id,
            'category' => $validated['category'],
            'title' => $validated['title'],
            'amount_tk' => (float) $validated['amount_tk'],
            'payment_method' => $validated['payment_method'],
            'reference_no' => $validated['reference_no'] ?? ('EX-' . time()),
            'expense_date' => $validated['expense_date'] ?? now()->toDateString(),
            'created_by' => $validated['created_by'] ?? 'ম্যানেজার',
            'notes' => $validated['notes'] ?? null,
        ]);

        return $this->success($expense, "খরচ '{$expense->title}' (৳{$expense->amount_tk}) সফলভাবে সংরক্ষিত হয়েছে।", 201);
    }

    public function storeAttendance(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'worker_name' => ['required', 'string', 'max:100'],
            'role_type' => ['required', 'string', 'max:40'],
            'shift' => ['required', 'string', 'max:10'],
            'status' => ['required', 'string', 'in:present,absent,late,leave,overtime'],
            'attendance_date' => ['nullable', 'date'],
            'in_time' => ['nullable', 'string'],
            'out_time' => ['nullable', 'string'],
            'overtime_hours' => ['nullable', 'numeric'],
            'daily_wage_tk' => ['nullable', 'numeric'],
            'note' => ['nullable', 'string'],
        ]);

        $factory = Factory::where('code', 'f1')->firstOrFail();
        $date = $validated['attendance_date'] ?? now()->toDateString();

        $att = FactoryAttendance::updateOrCreate(
            [
                'factory_id' => $factory->id,
                'worker_name' => $validated['worker_name'],
                'attendance_date' => $date,
                'shift' => $validated['shift'],
            ],
            [
                'role_type' => $validated['role_type'],
                'status' => $validated['status'],
                'in_time' => $validated['in_time'] ?? ($validated['status'] === 'present' ? '08:00 AM' : null),
                'out_time' => $validated['out_time'] ?? ($validated['status'] === 'present' ? '05:00 PM' : null),
                'overtime_hours' => (float) ($validated['overtime_hours'] ?? 0),
                'daily_wage_tk' => (float) ($validated['daily_wage_tk'] ?? 550),
                'note' => $validated['note'] ?? null,
            ]
        );

        return $this->success($att, "{$att->worker_name} এর হাজিরা আপডেট হয়েছে।");
    }

    public function storeUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'email' => ['nullable', 'email', 'max:150'],
            'designation' => ['required', 'string', 'max:80'],
            'role' => ['required', 'string', 'in:fac,ven,sup,par'],
            'can_message' => ['nullable', 'boolean'],
        ]);

        $factory = Factory::where('code', 'f1')->firstOrFail();

        $user = User::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'password' => bcrypt('demo1234'),
            'role' => $validated['role'],
            'designation' => $validated['designation'],
            'organization_name' => $factory->name,
            'factory_id' => $factory->id,
            'is_owner' => false,
            'is_vendor_rep' => false,
            'can_message' => (bool) ($validated['can_message'] ?? true),
            'is_active' => true,
            'last_login_label' => 'নতুন যোগকৃত',
        ]);

        return $this->success($user, "{$user->name} টিম মেম্বার হিসেবে যুক্ত হয়েছেন।", 201);
    }

    public function toggleUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->is_active = !$user->is_active;
        $user->save();

        return $this->success($user, "{$user->name} এর অ্যাক্টিভেশন স্ট্যাটাস আপডেট হয়েছে।");
    }

    public function requestPayout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount_tk' => ['required', 'numeric', 'min:500'],
            'payout_method' => ['required', 'string', 'in:bkash,nagad,rocket,bank'],
            'account_number' => ['required', 'string', 'max:30'],
        ]);

        $partner = Partner::first();
        if (!$partner) {
            $partner = Partner::create([
                'partner_code' => 'KNIT-P27',
                'total_referrals' => 8,
                'active_factories_count' => 6,
                'total_commission_tk' => 45000,
                'withdrawn_commission_tk' => 15000,
                'balance_commission_tk' => 30000,
                'payout_method' => $validated['payout_method'],
                'payout_number' => $validated['account_number'],
            ]);
        }

        $amt = (float) $validated['amount_tk'];
        if ($amt > $partner->balance_commission_tk) {
            return $this->error("উত্তোলনযোগ্য ব্যালেন্স মাত্র ৳{$partner->balance_commission_tk}", 422);
        }

        $partner->withdrawn_commission_tk += $amt;
        $partner->balance_commission_tk -= $amt;
        $partner->payout_method = $validated['payout_method'];
        $partner->payout_number = $validated['account_number'];
        $partner->save();

        return $this->success($partner, "৳{$amt} উত্তোলনের অনুরোধ সফলভাবে গ্রহণ করা হয়েছে।");
    }

    public function updateFactoryProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:180'],
            'area' => ['nullable', 'string', 'max:120'],
            'address' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'total_machines' => ['nullable', 'integer', 'min:1'],
        ]);

        $factory = Factory::where('code', 'f1')->firstOrFail();
        $factory->update($validated);

        return $this->success($factory, 'ফ্যাক্টরি প্রোফাইল ও সেটিংস সংরক্ষিত হয়েছে।');
    }
}

