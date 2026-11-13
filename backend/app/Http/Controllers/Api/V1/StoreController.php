<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\StoreIssueLog;
use App\Models\StoreItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StoreController extends Controller
{
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

        public function getStoreData(Request $request): JsonResponse
    {
        $items = StoreItem::orderBy('id')->get()->map(fn (StoreItem $s) => [
            'id' => $s->item_code,
            'name' => $s->name,
            'cat' => $s->category,
            'unit' => $s->unit,
            'stock' => (int) $s->stock_qty,
            'min' => (int) $s->min_qty,
            'price' => (float) $s->unit_price,
            'rfq' => (bool) $s->rfq_sent,
        ])->values()->all();

        $logs = StoreIssueLog::orderByDesc('id')->take(30)->get()->map(fn (StoreIssueLog $l) => [
            'd' => $l->date_label ?? ($l->created_at ? $l->created_at->format('d M') : '03 Oct'),
            'id' => $l->item_code,
            'm' => $l->machine_code,
            'q' => (int) $l->qty,
            'by' => $l->issued_by,
        ])->values()->all();

        return $this->success([
            'items' => $items,
            'logs' => $logs,
        ], 'স্টোর ডেটা লোড হয়েছে');
    }
}
