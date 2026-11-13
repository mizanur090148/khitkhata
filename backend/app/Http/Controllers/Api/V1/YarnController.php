<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\Party;
use App\Models\StoreIssueLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class YarnController extends Controller
{
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
}
