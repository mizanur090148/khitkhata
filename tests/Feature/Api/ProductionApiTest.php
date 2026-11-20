<?php

namespace Tests\Feature\Api;

use App\Models\Factory;
use App\Models\FactoryMachine;
use App\Models\Production;
use App\Models\SubcontractOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductionApiTest extends TestCase
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

    public function test_can_record_shift_production(): void
    {
        $order = SubcontractOrder::create([
            'factory_id' => $this->factory->id,
            'party_code' => 'abc',
            'order_no' => 'SC-2610-014',
            'fabric_summary' => 'Single Jersey 160 GSM',
            'total_qty_kg' => 5000,
            'done_kg' => 0,
            'status' => 'run',
        ]);

        FactoryMachine::create([
            'factory_id' => $this->factory->id,
            'code' => 'M-03',
            'knit_type' => 'c',
            'status' => 'run:SC-2610-014',
            'current_order_no' => 'SC-2610-014',
        ]);

        $payload = [
            'order_no' => 'SC-2610-014',
            'shift' => 'A',
            'date_label' => '03 Oct',
            'rows' => [
                [
                    'placement_index' => 0,
                    'machine_code' => 'M-03',
                    'operator_name' => 'মোঃ জসিম উদ্দিন',
                    'qty_kg' => 186.5,
                    'rolls_count' => 8,
                    'yarn_lot' => 'LOT-26A',
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/portal/production/shift', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('productions', [
            'machine_code' => 'M-03',
            'order_no' => 'SC-2610-014',
            'operator_name' => 'মোঃ জসিম উদ্দিন',
            'rolls_count' => 8,
        ]);
    }

    public function test_can_record_single_production_entry(): void
    {
        $order = SubcontractOrder::create([
            'factory_id' => $this->factory->id,
            'party_code' => 'abc',
            'order_no' => 'SC-2610-014',
            'fabric_summary' => 'Single Jersey 160 GSM',
            'total_qty_kg' => 5000,
            'done_kg' => 0,
            'status' => 'run',
        ]);

        $payload = [
            'order_no' => 'SC-2610-014',
            'placement_index' => 0,
            'machine_code' => 'M-04',
            'shift' => 'B',
            'operator_name' => 'মোঃ সোহেল রানা',
            'qty_kg' => 191.0,
            'rolls_count' => 8,
            'yarn_lot' => 'LOT-26B',
        ];

        $response = $this->postJson('/api/v1/portal/production', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('productions', [
            'machine_code' => 'M-04',
            'operator_name' => 'মোঃ সোহেল রানা',
            'qty_kg' => 191.0,
        ]);
    }
}
