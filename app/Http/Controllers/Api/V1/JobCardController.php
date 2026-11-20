<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\OrderLine;
use App\Models\SubcontractOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class JobCardController extends Controller
{
        public function saveJobCard(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_no' => ['required', 'string'],
            'machine_code' => ['required', 'string'],
            'placement_index' => ['nullable', 'integer'],
            'rolls' => ['required', 'array'],
            'remarks' => ['nullable', 'string'],
        ]);

        $order = SubcontractOrder::where('order_no', $validated['order_no'])->firstOrFail();
        $machine = $validated['machine_code'];
        $pl = (int) ($validated['placement_index'] ?? 0);

        foreach ($validated['rolls'] as $r) {
            $seq = str_pad((string)($r['jc'] ?? $r['seq'] ?? '1'), 3, '0', STR_PAD_LEFT);
            $rollNo = $machine . '/' . $seq;

            FabricRoll::updateOrCreate(
                [
                    'order_no' => $order->order_no,
                    'machine_code' => $machine,
                    'jc_seq' => $seq,
                ],
                [
                    'roll_no' => $rollNo,
                    'placement_index' => $pl,
                    'date_label' => $r['d'] ?? date('d M'),
                    'shift' => $r['shift'] ?? 'A',
                    'operator_name' => $r['op'] ?? '—',
                    'weight_kg' => (float) ($r['wt'] ?? $r['kg'] ?? 0),
                    'yarn_lot' => $r['lot'] ?? '—',
                    'faults_json' => $r['faults'] ?? $r['f'] ?? [],
                ]
            );
        }

        $allRolls = FabricRoll::where('order_no', $order->order_no)
            ->where('machine_code', $machine)
            ->orderBy('id')
            ->get()
            ->map(fn (FabricRoll $r) => [
                'no' => $r->roll_no,
                'jc' => $r->jc_seq,
                'o' => $r->order_no,
                'pl' => $r->placement_index,
                'm' => $r->machine_code,
                'd' => $r->date_label,
                'sh' => $r->shift,
                'op' => $r->operator_name,
                'kg' => (float) $r->weight_kg,
                'lot' => $r->yarn_lot,
                'f' => $r->faults_json ?? [],
                'ch' => $r->challan_no,
            ])->values()->all();

        return $this->success($allRolls, 'জব কার্ড সফলভাবে সংরক্ষিত হয়েছে');
    }
}
