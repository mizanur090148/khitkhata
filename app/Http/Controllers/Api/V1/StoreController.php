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
            'date_label' => ['nullable', 'string'],
        ]);

        $item = StoreItem::where('item_code', $validated['item_code'])->firstOrFail();

        if ($validated['type'] === 'rfq') {
            $item->update(['rfq_sent' => true]);
            return $this->success($item, 'কোটেশন অনুরোধ পাঠানো হয়েছে');
        }

        $now = now();
        $dateLabel = $validated['date_label'] ?? $now->format('d M');
        $issuedBy = $validated['issued_by'] ?: ($request->user()?->name ?: 'স্টোর ইনচার্জ');
        $qty = (int) ($validated['qty'] ?? 1);

        if ($validated['type'] === 'out') {
            if ($qty > $item->stock_qty) {
                return $this->error("স্টকে আছে মাত্র {$item->stock_qty} {$item->unit}", 422);
            }
            $item->decrement('stock_qty', $qty);
            StoreIssueLog::create([
                'item_code' => $item->item_code,
                'date_label' => $dateLabel,
                'machine_code' => $validated['machine_code'] ?? 'সব মেশিন',
                'qty' => $qty,
                'issued_by' => $issuedBy,
            ]);
        } else {
            $item->increment('stock_qty', $qty);
            if (!empty($validated['price'])) {
                $item->update(['unit_price' => (float) $validated['price']]);
            }
        }

        return $this->success($item->fresh(), 'স্টোর স্টক আপডেট হয়েছে');
    }

    public function storeNewItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'category' => ['required', 'string', 'max:80'],
            'unit' => ['required', 'string', 'max:30'],
            'stock_qty' => ['required', 'integer', 'min:0'],
            'min_qty' => ['required', 'integer', 'min:0'],
            'unit_price' => ['required', 'numeric', 'min:0'],
            'item_code' => ['nullable', 'string', 'max:30', 'unique:store_items,item_code'],
        ]);

        $itemCode = $validated['item_code'] ?? null;
        if (!$itemCode) {
            $catPrefix = match ($validated['category']) {
                'নিডল ও সিংকার' => 'n',
                'নিটিং অয়েল' => 'o',
                'স্পেয়ার পার্টস' => 'p',
                'ইলেকট্রিক গুডস' => 'e',
                default => 's',
            };
            $count = StoreItem::where('item_code', 'LIKE', "{$catPrefix}%")->count() + 1;
            $itemCode = $catPrefix . $count;
            while (StoreItem::where('item_code', $itemCode)->exists()) {
                $count++;
                $itemCode = $catPrefix . $count;
            }
        }

        $item = StoreItem::create([
            'item_code' => $itemCode,
            'name' => $validated['name'],
            'category' => $validated['category'],
            'unit' => $validated['unit'],
            'stock_qty' => (int) $validated['stock_qty'],
            'min_qty' => (int) $validated['min_qty'],
            'unit_price' => (float) $validated['unit_price'],
            'rfq_sent' => false,
        ]);

        return $this->success($item, "নতুন আইটেম {$item->name} ({$item->item_code}) সফলভাবে যোগ হয়েছে", 201);
    }

    public function getStoreData(Request $request): JsonResponse
    {
        $items = StoreItem::orderBy('id')->get()->map(fn (StoreItem $s) => [
            'id' => $s->item_code,
            'item_code' => $s->item_code,
            'name' => $s->name,
            'cat' => $s->category,
            'category' => $s->category,
            'unit' => $s->unit,
            'stock' => (int) $s->stock_qty,
            'stock_qty' => (int) $s->stock_qty,
            'min' => (int) $s->min_qty,
            'min_qty' => (int) $s->min_qty,
            'price' => (float) $s->unit_price,
            'unit_price' => (float) $s->unit_price,
            'rfq' => (bool) $s->rfq_sent,
        ])->values()->all();

        $logs = StoreIssueLog::orderByDesc('id')->take(50)->get()->map(fn (StoreIssueLog $l) => [
            'd' => $l->date_label ?? ($l->created_at ? $l->created_at->format('d M') : now()->format('d M')),
            'date_label' => $l->date_label ?? ($l->created_at ? $l->created_at->format('d M') : now()->format('d M')),
            'id' => $l->item_code,
            'item_code' => $l->item_code,
            'm' => $l->machine_code,
            'machine_code' => $l->machine_code,
            'q' => (int) $l->qty,
            'qty' => (int) $l->qty,
            'by' => $l->issued_by,
            'issued_by' => $l->issued_by,
            'created_at' => $l->created_at?->toISOString(),
        ])->values()->all();

        return $this->success([
            'items' => $items,
            'logs' => $logs,
        ], 'স্টোর ডেটা লোড হয়েছে');
    }
}
