<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\FabricRoll;
use App\Models\Factory;
use App\Models\FactoryMachine;
use App\Models\Operator;
use App\Models\OrderLine;
use App\Models\Production;
use App\Models\SubcontractOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductionController extends Controller
{
        public function storeProductionEntry(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_no' => ['required', 'string'],
            'placement_index' => ['required', 'integer', 'min:0'],
            'machine_code' => ['required', 'string'],
            'shift' => ['required', 'string'],
            'operator_name' => ['nullable', 'string'],
            'employee_id' => ['nullable', 'integer'],
            'user_id' => ['nullable', 'integer'],
            'qty_kg' => ['required', 'numeric', 'min:0.1'],
            'rolls_count' => ['nullable', 'integer', 'min:0'],
            'roll_weights' => ['nullable', 'array'],
            'yarn_lot' => ['nullable', 'string'],
            'fault_code' => ['nullable', 'string'],
            'fault_desc' => ['nullable', 'string'],
        ]);

        $order = SubcontractOrder::with('lines')->where('order_no', $validated['order_no'])->firstOrFail();
        $userId = auth()->id() ?? auth('sanctum')->id() ?? $request->user()?->id ?? ($validated['user_id'] ?? null);

        return DB::transaction(function () use ($validated, $order, $userId) {
            $kg = (float) $validated['qty_kg'];
            $rollWeights = $validated['roll_weights'] ?? [];
            $rollsCount = !empty($rollWeights) ? count($rollWeights) : (int) ($validated['rolls_count'] ?? 1);

            $order->increment('done_kg', $kg);
            $order->increment('today_prod_kg', $kg);

            $line = $order->lines->values()->get($validated['placement_index']);
            if ($line) {
                $line->increment('done_qty', $kg);
            }

            $opName = $validated['operator_name'] ?: '—';
            $employeeId = $validated['employee_id'] ?? null;
            if (!$employeeId && $opName !== '—') {
                $employeeId = Employee::where('name', $opName)->value('id');
            }

            $log = Production::create([
                'subcontract_order_id' => $order->id,
                'user_id' => $userId,
                'employee_id' => $employeeId,
                'order_no' => $order->order_no,
                'placement_index' => $validated['placement_index'],
                'date_label' => '03 Oct',
                'shift' => $validated['shift'],
                'machine_code' => $validated['machine_code'],
                'operator_name' => $opName,
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

        public function storeShiftProduction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_no' => ['required', 'string'],
            'date' => ['nullable', 'string'],
            'date_label' => ['nullable', 'string'],
            'shift' => ['required', 'string'],
            'user_id' => ['nullable', 'integer'],
            'rows' => ['required', 'array'],
        ]);

        $order = SubcontractOrder::with(['lines', 'party'])->where('order_no', $validated['order_no'])->firstOrFail();
        $dateLabel = $validated['date_label'] ?? (!empty($validated['date']) ? date('d M', strtotime($validated['date'])) : date('d M'));
        $shift = $validated['shift'];
        $userId = auth()->id() ?? auth('sanctum')->id() ?? $request->user()?->id ?? ($validated['user_id'] ?? null);

        return DB::transaction(function () use ($validated, $order, $dateLabel, $shift, $userId) {
            $createdRolls = [];
            $totalShiftKg = 0;

            foreach ($validated['rows'] as $r) {
                $pl = (int) ($r['placement_index'] ?? 0);
                $machine = $r['machine_code'] ?? 'M-01';
                $isFlat = !empty($r['flat']);
                $kg = (float) ($r['qty_kg'] ?? 0);
                $rollsCount = (int) ($r['rolls_count'] ?? 0);
                $op = !empty($r['operator_name']) ? $r['operator_name'] : '—';
                $employeeId = $r['employee_id'] ?? null;
                if (!$employeeId && $op !== '—') {
                    $employeeId = Employee::where('name', $op)->value('id');
                }
                $yarnLot = !empty($r['yarn_lot']) ? $r['yarn_lot'] : '—';
                $rollsData = $r['rolls'] ?? [];
                $issue = $r['issue'] ?? '';
                $issueDesc = $r['issue_desc'] ?? '';

                if ($kg <= 0 && empty($rollsData)) {
                    continue;
                }

                $totalShiftKg += $kg;

                // Update line done_qty
                $line = $order->lines->values()->get($pl);
                if ($line) {
                    $line->increment('done_qty', $kg);
                }

                // Create Production
                $faultSummary = '';
                if ($isFlat && $issue) {
                    $faultSummary = $issue . ($issueDesc ? ': ' . $issueDesc : '');
                } elseif (!empty($rollsData)) {
                    $faultParts = [];
                    foreach ($rollsData as $rd) {
                        if (!empty($rd['faults'])) {
                            $fList = [];
                            foreach ($rd['faults'] as $k => $v) {
                                $fList[] = "{$k} ×{$v}";
                            }
                            $faultParts[] = ($rd['jc'] ?? 'R') . ': ' . implode(', ', $fList);
                        }
                    }
                    $faultSummary = implode(' · ', $faultParts);
                }

                Production::create([
                    'subcontract_order_id' => $order->id,
                    'user_id' => $userId,
                    'employee_id' => $employeeId,
                    'order_no' => $order->order_no,
                    'placement_index' => $pl,
                    'date_label' => $dateLabel,
                    'shift' => $shift,
                    'machine_code' => $machine,
                    'operator_name' => $op,
                    'qty_kg' => $kg,
                    'rolls_count' => !empty($rollsData) ? count($rollsData) : $rollsCount,
                    'yarn_lot' => $yarnLot,
                    'fault_code' => $faultSummary ?: null,
                ]);

                // Flat knit issue -> QcInspection
                if ($isFlat && $issue) {
                    $qcCount = QcInspection::count() + 101;
                    QcInspection::create([
                        'qc_no' => 'QC-' . str_pad((string) $qcCount, 4, '0', STR_PAD_LEFT),
                        'order_no' => $order->order_no,
                        'placement_index' => $pl,
                        'placement_name' => $line?->placement ?? 'Flat Knit',
                        'date_label' => $dateLabel,
                        'roll_no' => '—',
                        'machine_code' => $machine,
                        'weight_kg' => 0,
                        'issue_description' => ($issue === 'other' ? 'অন্যান্য' : $issue) . ($issueDesc ? " — {$issueDesc}" : ''),
                        'source' => 'floor',
                        'factory_sign_json' => ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
                        'vendor_sign_json' => ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
                    ]);
                }

                // If regular rolls
                if (!empty($rollsData)) {
                    foreach ($rollsData as $rd) {
                        $seq = str_pad((string) ($rd['jc'] ?? '1'), 3, '0', STR_PAD_LEFT);
                        $rollNo = $machine . '/' . $seq;
                        $rKg = (float) ($rd['kg'] ?? 0);
                        $rOp = !empty($rd['op']) ? $rd['op'] : $op;
                        $faults = $rd['faults'] ?? [];

                        $rollModel = FabricRoll::updateOrCreate(
                            [
                                'order_no' => $order->order_no,
                                'machine_code' => $machine,
                                'jc_seq' => $seq,
                            ],
                            [
                                'roll_no' => $rollNo,
                                'placement_index' => $pl,
                                'date_label' => $dateLabel,
                                'shift' => $shift,
                                'operator_name' => $rOp,
                                'weight_kg' => $rKg,
                                'yarn_lot' => $yarnLot,
                                'faults_json' => $faults,
                            ]
                        );

                        $createdRolls[] = [
                            'no' => $rollModel->roll_no,
                            'jc' => $rollModel->jc_seq,
                            'o' => $rollModel->order_no,
                            'pl' => $rollModel->placement_index,
                            'm' => $rollModel->machine_code,
                            'd' => $rollModel->date_label,
                            'sh' => $rollModel->shift,
                            'op' => $rollModel->operator_name,
                            'kg' => (float) $rollModel->weight_kg,
                            'lot' => $rollModel->yarn_lot,
                            'f' => $rollModel->faults_json ?? [],
                            'place' => $line?->placement ?? 'Body',
                            'fab' => $line?->fabrication ?? 'Single Jersey',
                            'buyer' => $order->buyer,
                            'party' => $order->party?->name ?? $order->party_code,
                        ];

                        if (!empty($faults)) {
                            $qcCount = QcInspection::count() + 101;
                            $faultStr = [];
                            foreach ($faults as $fk => $fv) {
                                $faultStr[] = "{$fk} ×{$fv}";
                            }
                            QcInspection::create([
                                'qc_no' => 'QC-' . str_pad((string) $qcCount, 4, '0', STR_PAD_LEFT),
                                'order_no' => $order->order_no,
                                'placement_index' => $pl,
                                'placement_name' => $line?->placement ?? 'Body',
                                'date_label' => $dateLabel,
                                'roll_no' => $rollNo,
                                'machine_code' => $machine,
                                'weight_kg' => $rKg,
                                'issue_description' => implode(', ', $faultStr),
                                'source' => 'floor',
                                'factory_sign_json' => ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
                                'vendor_sign_json' => ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
                            ]);
                        }
                    }
                }
            }

            if ($totalShiftKg > 0) {
                $order->increment('done_kg', $totalShiftKg);
                $order->increment('today_prod_kg', $totalShiftKg);
            }

            // Fresh productions
            $freshLogs = Production::orderByDesc('id')->take(20)->get()->map(fn (Production $p) => [
                'id' => $p->id,
                'user_id' => $p->user_id,
                'employee_id' => $p->employee_id,
                'd' => $p->date_label,
                'sh' => $p->shift,
                'm' => $p->machine_code,
                'o' => $p->order_no,
                'pl' => $p->placement_index,
                'op' => $p->operator_name,
                'kg' => (float) $p->qty_kg,
                'rolls' => $p->rolls_count,
                'lot' => $p->yarn_lot,
                'fault' => $p->fault_code,
            ])->values()->all();

            return $this->success([
                'new_rolls' => $createdRolls,
                'logs' => $freshLogs,
                'done_kg' => (float) $order->fresh()->done_kg,
            ], 'প্রোডাকশন সেভ হয়েছে · রোল ও জব কার্ড আপডেট হয়েছে', 201);
        });
    }
}
