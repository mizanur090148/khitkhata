<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\FactoryMachine;
use App\Models\OrderLine;
use App\Models\Party;
use App\Models\QcInspection;
use App\Models\SubcontractOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
        public function getOrders(): JsonResponse
    {
        $factory = Factory::where('code', 'f1')->firstOrFail();
        $orders = SubcontractOrder::with(['lines', 'qcInspections', 'party'])
            ->where('factory_id', $factory->id)
            ->orderBy('id', 'desc')
            ->get()
            ->map(function (SubcontractOrder $o) {
                $lines = $o->lines->map(fn ($l) => [
                    'id' => $l->line_index,
                    'line_index' => $l->line_index,
                    'kt' => $l->knit_type,
                    'yd' => (bool) $l->is_yarn_dyed,
                    'unit' => $l->unit,
                    'place' => $l->placement,
                    'fab' => $l->fabrication,
                    'color' => $l->color ?? '—',
                    'qty' => (float) $l->qty,
                    'done' => (float) $l->done_qty,
                    'dl' => (float) $l->delivered_qty,
                    'ggsm' => $l->grey_gsm,
                    'fgsm' => $l->finish_gsm,
                    'sl' => $l->stitch_length,
                    'gdia' => $l->grey_dia,
                    'dia' => $l->dia_gauge,
                    'size' => $l->flat_size,
                    'pcw' => $l->piece_weight_gm,
                    'fdes' => $l->flat_design,
                    'machines' => $l->machines_json ?? [],
                    'yarns' => $l->yarns_json ?? [],
                ])->values()->all();

                $qc = $o->qcInspections->map(fn ($q) => [
                    'id' => $q->qc_no,
                    'd' => $q->date_label ?? ($q->created_at ? $q->created_at->format('d M') : '03 Oct'),
                    'roll' => $q->roll_no,
                    'm' => $q->machine_code ?? '—',
                    'pl' => (int) $q->placement_index,
                    'kg' => (float) $q->weight_kg,
                    'issue' => $q->issue_description,
                    'src' => $q->source ?? 'fac',
                    'fac' => $q->factory_sign_json ?? ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
                    'ven' => $q->vendor_sign_json ?? ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
                    'act' => $q->action_taken ?? '',
                ])->values()->all();

                return [
                    'id' => $o->order_no,
                    'po' => $o->order_no,
                    'party' => $o->party?->name ?? $o->party_code,
                    'party_id' => $o->party_id,
                    'party_code' => $o->party_code,
                    'v' => $o->party_code,
                    'buyer' => $o->buyer,
                    'fabric' => $o->fabric_summary,
                    'gsm' => $o->gsm,
                    'finishGsm' => $o->finish_gsm,
                    'stitch' => $o->stitch_length,
                    'greyDia' => $o->grey_dia,
                    'dia' => $o->dia_gauge,
                    'color' => $o->color,
                    'yarn' => $o->yarn_summary,
                    'qty' => (float) $o->total_qty_kg,
                    'done' => (float) $o->done_kg,
                    'machines' => $o->machines_json ?? [],
                    'rate' => (float) $o->daily_rate_kg,
                    'start' => $o->start_label,
                    'status' => $o->status,
                    'rateTk' => (float) $o->rate_tk,
                    'orderDate' => $o->order_date ? $o->order_date->format('Y-m-d') : null,
                    'delivDate' => $o->delivery_due_date ? $o->delivery_due_date->format('Y-m-d') : null,
                    'completeDate' => $o->complete_date ? $o->complete_date->format('Y-m-d') : null,
                    'delivered' => (float) $o->delivered_kg,
                    'challans' => $o->challans_json ?? [],
                    'yarnIn' => $o->yarn_in_json ?? [],
                    'lines' => $lines,
                    'qc' => $qc,
                ];
            });

        return $this->success($orders, 'অর্ডার তালিকা লোড হয়েছে');
    }

        public function storeOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => ['required', 'string', 'max:40'],
            'party_id' => ['nullable', 'numeric'],
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
            $party = null;
            if (!empty($validated['party_id'])) {
                $party = Party::where('factory_id', $factory->id)->find($validated['party_id']);
            }
            if (!$party) {
                $party = Party::where('factory_id', $factory->id)
                    ->where(function ($q) use ($validated) {
                        $q->where('code', $validated['vendor_name'])
                            ->orWhereRaw('LOWER(name) = ?', [strtolower(trim($validated['vendor_name']))]);
                    })
                    ->first();
            }

            if (!$party) {
                $party = Party::create([
                    'factory_id' => $factory->id,
                    'code' => 'p' . time() . rand(10, 99),
                    'name' => trim($validated['vendor_name']),
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
                'party_id' => $party->id,
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
                'start_label' => $status === 'run' ? date('d M', strtotime($validated['yarn_received_date'] ?? 'now')) : '—',
                'order_date' => $validated['order_date'] ?? now()->toDateString(),
                'delivery_due_date' => ($validated['delivery_due'] ?? null) ?: null,
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
                    'placement' => $l['place'] ?? $l['placement'] ?? 'Body',
                    'fabrication' => $l['fab'] ?? $l['fabrication'] ?? 'Single Jersey',
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

        public function deleteOrder(string $orderNo): JsonResponse
    {
        $factory = Factory::where('code', 'f1')->firstOrFail();
        $order = SubcontractOrder::where('factory_id', $factory->id)
            ->where(function ($q) use ($orderNo) {
                $q->where('order_no', $orderNo)->orWhere('id', $orderNo);
            })->firstOrFail();

        $order->delete(); // Soft delete
        return $this->success(null, "অর্ডার {$orderNo} মুছে ফেলা হয়েছে");
    }

        public function clearOrders(): JsonResponse
    {
        $factory = Factory::where('code', 'f1')->firstOrFail();
        SubcontractOrder::where('factory_id', $factory->id)->delete(); // Soft delete all
        return $this->success(null, 'সব অর্ডার মুছে ফেলা হয়েছে');
    }
}
