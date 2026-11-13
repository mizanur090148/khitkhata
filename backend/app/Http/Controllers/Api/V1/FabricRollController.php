<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FabricRoll;
use App\Models\Factory;
use App\Models\SubcontractOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FabricRollController extends Controller
{
        public function getRolls(Request $request): JsonResponse
    {
        $query = FabricRoll::query();
        if ($request->has('order_no')) {
            $query->where('order_no', $request->query('order_no'));
        }
        if ($request->has('machine_code')) {
            $query->where('machine_code', $request->query('machine_code'));
        }
        $rolls = $query->orderBy('id')->get()->map(fn (FabricRoll $r) => [
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

        return $this->success($rolls, 'রোল তালিকা লোড হয়েছে');
    }
}
