<?php

namespace Tests\Unit;

use App\Models\Factory;
use App\Models\Production;
use App\Models\SubcontractOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductionTest extends TestCase
{
    use RefreshDatabase;

    public function test_production_log_stores_shift_machine_and_quantity(): void
    {
        $factory = Factory::create([
            'code' => 'f1',
            'name' => 'রহমান নিটিং',
        ]);

        $order = SubcontractOrder::create([
            'factory_id' => $factory->id,
            'party_code' => 'abc',
            'order_no' => 'SC-2610-014',
            'fabric_summary' => 'Single Jersey 160 GSM',
            'total_qty_kg' => 5000,
            'done_kg' => 1000,
            'status' => 'run',
        ]);

        $prod = Production::create([
            'subcontract_order_id' => $order->id,
            'date_label' => '03 Oct',
            'shift' => 'A',
            'machine_code' => 'M-03',
            'order_no' => 'SC-2610-014',
            'placement_index' => 0,
            'operator_name' => 'মোঃ জসিম উদ্দিন',
            'qty_kg' => 186.5,
            'rolls_count' => 8,
            'yarn_lot' => 'LOT-26A',
        ]);

        $this->assertDatabaseHas('productions', [
            'machine_code' => 'M-03',
            'order_no' => 'SC-2610-014',
            'shift' => 'A',
            'operator_name' => 'মোঃ জসিম উদ্দিন',
            'rolls_count' => 8,
        ]);

        $this->assertEquals(186.5, $prod->qty_kg);
    }
}
