<?php

namespace Tests\Feature\Api;

use App\Models\Factory;
use App\Models\FactoryMachine;
use App\Models\SubcontractOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FactoryDashboardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_factory_dashboard_endpoint_returns_matrix_and_kpis(): void
    {
        $factory = Factory::create([
            'code' => 'f1',
            'name' => 'রহমান নিটিং ইন্ডাস্ট্রিজ',
            'area' => 'কোনাবাড়ী, গাজীপুর',
            'total_machines' => 24,
            'plan_code' => 'g',
        ]);

        for ($i = 1; $i <= 24; $i++) {
            $code = 'M-' . str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            FactoryMachine::create([
                'factory_id' => $factory->id,
                'code' => $code,
                'knit_type' => 'c',
                'dia' => 30,
                'gauge' => 24,
                'spec_label' => '30" × 24G',
                'brand' => 'Pailung (Taiwan)',
                'status' => $i <= 18 ? 'run:SC-2610-014' : ($i <= 20 ? 'wait' : ($i === 21 ? 'down' : 'idle')),
                'current_order_no' => $i <= 18 ? 'SC-2610-014' : null,
                'broadcast_free' => $i >= 22,
                'daily_capacity_kg' => 190,
            ]);
        }

        $response = $this->getJson('/api/v1/portal/dashboard');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'factory' => [
                    'id',
                    'code',
                    'name',
                    'area',
                    'total_machines',
                    'plan_code',
                ],
                'kpis' => [
                    'today_production_kg',
                    'today_production_machines_count',
                    'running_orders_count',
                    'running_orders_total_kg',
                    'running_orders_knit_kg',
                    'running_orders_deliv_kg',
                    'total_machines',
                    'running_machines_count',
                    'idle_machines_count',
                    'free_machines_count',
                    'down_machines_count',
                    'broadcast_free_count',
                    'receivable_bills_amount',
                    'receivable_parties_count',
                    'today_expense_amount',
                    'today_expense_count',
                    'open_qc_issues_count',
                ],
                'machines',
                'alerts',
                'running_orders',
                'marketplace_rfqs',
                'sync_time',
                'date_label',
            ],
        ]);

        $data = $response->json('data');
        $this->assertCount(24, $data['machines']);
        $this->assertEquals(24, $data['kpis']['total_machines']);
        $this->assertEquals(18, $data['kpis']['running_machines_count']);
    }
}
