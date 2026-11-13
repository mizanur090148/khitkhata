<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FabricRoll;
use App\Models\Factory;
use App\Models\QcInspection;
use App\Models\SubcontractOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QcController extends Controller
{
        public function getQcInspections(Request $request): JsonResponse
    {
        $factory = $this->resolveFactory($request);
        $factoryOrderNos = SubcontractOrder::where('factory_id', $factory->id)->pluck('order_no');

        $query = QcInspection::whereIn('order_no', $factoryOrderNos);
        if ($request->has('order_no')) {
            $query->where('order_no', $request->query('order_no'));
        }
        $qcs = $query->orderBy('id', 'desc')->get()->map(fn ($q) => [
            'id' => $q->qc_no,
            'o' => $q->order_no,
            'pl' => (int) $q->placement_index,
            'd' => $q->date_label ?? ($q->created_at ? $q->created_at->format('d M') : '03 Oct'),
            'roll' => $q->roll_no,
            'm' => $q->machine_code ?? '—',
            'kg' => (float) $q->weight_kg,
            'issue' => $q->issue_description,
            'src' => $q->source ?? 'fac',
            'fac' => $q->factory_sign_json ?? ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
            'ven' => $q->vendor_sign_json ?? ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
            'act' => $q->action_taken ?? '',
        ])->values()->all();

        return $this->success($qcs, 'QC তালিকা লোড হয়েছে');
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

        $maxId = QcInspection::max('id') ?? 100;
        $candidateNum = $maxId + 1;
        do {
            $qcNo = 'QC-' . str_pad((string) $candidateNum, 4, '0', STR_PAD_LEFT);
            $candidateNum++;
        } while (QcInspection::where('qc_no', $qcNo)->exists());

        $blank = ['v' => null, 'by' => '', 'at' => '', 'note' => ''];
        $nowStamp = now()->format('d M, H:i');
        $signed = [
            'v' => $validated['verdict'],
            'by' => $validated['signed_by'],
            'at' => $nowStamp,
            'note' => $validated['note'] ?? '',
        ];

        $order = SubcontractOrder::where('order_no', $validated['order_no'])->first();
        $line = $order?->lines()->where('line_index', $validated['placement_index'])->first();

        $qc = QcInspection::create([
            'qc_no' => $qcNo,
            'order_no' => $validated['order_no'],
            'placement_index' => $validated['placement_index'],
            'placement_name' => $line?->placement ?? 'Body',
            'date_label' => now()->format('d M'),
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
            'at' => now()->format('d M, H:i'),
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

        public function updateQcAction(Request $request, string $qcNo): JsonResponse
    {
        $validated = $request->validate([
            'action_taken' => ['nullable', 'string'],
        ]);

        $qc = QcInspection::where('qc_no', $qcNo)->firstOrFail();
        $qc->action_taken = $validated['action_taken'] ?? '';
        $qc->save();

        return $this->success($qc, 'সিদ্ধান্ত সংরক্ষিত হয়েছে');
    }
}
