<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\Party;
use App\Models\StoreIssueLog;
use App\Models\SubcontractOrder;
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

    public function requestReturn(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_no' => ['required', 'string'],
            'lot' => ['required', 'string'],
            'kg' => ['required', 'numeric', 'min:0.1'],
            'note' => ['nullable', 'string'],
        ]);

        $order = SubcontractOrder::where('order_no', $validated['order_no'])->firstOrFail();
        $requests = $order->yarn_requests_json ?? [];

        $lot = $validated['lot'];
        $requests[$lot] = [
            'lot' => $lot,
            'kg' => (float) $validated['kg'],
            'requested_at' => now()->format('d M, H:i'),
            'by' => $request->user()?->name ?? 'ভেন্ডর প্রতিনিধি',
            'status' => 'pending',
        ];

        $order->update(['yarn_requests_json' => $requests]);

        return $this->success($order, "{$order->order_no}-এর লট {$lot}-এর ফেরত রিকোয়েস্ট সংরক্ষিত হয়েছে");
    }

    public function createReturnChallan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_no' => ['required', 'string'],
            'lot' => ['required', 'string'],
            'kg' => ['required', 'numeric', 'min:0.1'],
            'date_label' => ['nullable', 'string'],
            'driver_name' => ['nullable', 'string'],
            'vehicle_no' => ['nullable', 'string'],
        ]);

        $order = SubcontractOrder::where('order_no', $validated['order_no'])->firstOrFail();
        $returns = $order->yarn_returns_json ?? [];

        $challanNo = 'YRC-' . str_pad((string) (count($returns) + 1), 3, '0', STR_PAD_LEFT);
        $dateLabel = $validated['date_label'] ?: now()->format('d M');

        $returns[] = [
            'challan_no' => $challanNo,
            'lot' => $validated['lot'],
            'kg' => (float) $validated['kg'],
            'd' => $dateLabel,
            'date' => now()->format('Y-m-d'),
            'by' => $request->user()?->name ?? 'ফ্যাক্টরি ইনচার্জ',
            'created_at' => now()->toISOString(),
        ];

        $requests = $order->yarn_requests_json ?? [];
        if (isset($requests[$validated['lot']])) {
            $requests[$validated['lot']]['status'] = 'completed';
        }

        $order->update([
            'yarn_returns_json' => $returns,
            'yarn_requests_json' => $requests,
        ]);

        return $this->success($order, "{$challanNo} সুতা ফেরত চালান সফলভাবে তৈরি হয়েছে");
    }
}
