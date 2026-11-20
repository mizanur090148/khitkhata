<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\FactoryExpense;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExpenseController extends Controller
{
        public function getExpenses(Request $request): JsonResponse
    {
        $expenses = FactoryExpense::orderByDesc('expense_date')->get()->map(fn ($e) => [
            'id' => $e->id,
            'cat' => $e->category,
            'title' => $e->title,
            'amt' => (float) $e->amount_tk,
            'method' => $e->payment_method,
            'ref' => $e->reference_no,
            'date' => $e->expense_date ? $e->expense_date->format('Y-m-d') : date('Y-m-d'),
            'by' => $e->created_by,
            'notes' => $e->notes,
        ]);
        return $this->success($expenses, 'খরচের হিসাব তালিকা');
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
}
