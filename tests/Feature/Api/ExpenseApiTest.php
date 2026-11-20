<?php

namespace Tests\Feature\Api;

use App\Models\Factory;
use App\Models\FactoryExpense;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpenseApiTest extends TestCase
{
    use RefreshDatabase;

    private Factory $factory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->factory = Factory::create([
            'code' => 'f1',
            'name' => 'রহমান নিটিং',
        ]);
    }

    public function test_can_list_expenses(): void
    {
        FactoryExpense::create([
            'factory_id' => $this->factory->id,
            'category' => 'spare_parts',
            'title' => 'সুই ও সিঙ্কার ক্রয়',
            'amount_tk' => 4500,
            'payment_method' => 'cash',
            'reference_no' => 'EX-202610-01',
            'expense_date' => '2026-10-03',
            'created_by' => 'ম্যানেজার',
        ]);

        $response = $this->getJson('/api/v1/portal/accounts/expenses');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonFragment([
            'title' => 'সুই ও সিঙ্কার ক্রয়',
            'amt' => 4500,
            'method' => 'cash',
        ]);
    }

    public function test_can_create_expense(): void
    {
        $payload = [
            'category' => 'utility',
            'title' => 'জেনারেটর ডিজেল ক্রয় ৫০ লিটার',
            'amount_tk' => 5500,
            'payment_method' => 'cash',
            'reference_no' => 'EX-202610-02',
            'expense_date' => '2026-10-03',
            'created_by' => 'হিসাবরক্ষক',
            'notes' => 'জরুরি পাওয়ার ব্যাকআপ',
        ];

        $response = $this->postJson('/api/v1/portal/accounts/expenses', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('factory_expenses', [
            'factory_id' => $this->factory->id,
            'title' => 'জেনারেটর ডিজেল ক্রয় ৫০ লিটার',
            'amount_tk' => 5500,
            'payment_method' => 'cash',
        ]);
    }
}

