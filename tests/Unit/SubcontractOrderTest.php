<?php

namespace Tests\Unit;

use App\Models\Factory;
use App\Models\OrderLine;
use App\Models\Party;
use App\Models\QcInspection;
use App\Models\SubcontractOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubcontractOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_can_have_lines_and_qc_inspections(): void
    {
        $factory = Factory::create([
            'code' => 'f1',
            'name' => 'রহমান নিটিং',
        ]);

        $party = Party::create([
            'factory_id' => $factory->id,
            'code' => 'xyz',
            'name' => 'XYZ Fashion Ltd',
            'type' => 'ven',
        ]);

        $order = SubcontractOrder::create([
            'factory_id' => $factory->id,
            'party_id' => $party->id,
            'party_code' => 'xyz',
            'order_no' => 'SC-2610-099',
            'buyer' => 'H&M',
            'fabric_summary' => 'Single Jersey 160 GSM',
            'total_qty_kg' => 10000,
            'done_kg' => 4500,
            'delivered_kg' => 2000,
            'rate_tk' => 14.5,
            'status' => 'run',
            'machines_json' => ['M-01', 'M-02'],
        ]);

        $line = OrderLine::create([
            'subcontract_order_id' => $order->id,
            'placement' => 'Body',
            'fabrication' => 'Single Jersey',
            'dia_gauge' => '30" × 24G',
            'qty' => 10000,
            'done_qty' => 4500,
            'delivered_qty' => 2000,
            'unit' => 'kg',
        ]);

        $qc = QcInspection::create([
            'qc_no' => 'QC-2610-099',
            'order_no' => 'SC-2610-099',
            'placement_index' => 0,
            'placement_name' => 'Body',
            'date_label' => '03 Oct',
            'roll_no' => 'R-01',
            'machine_code' => 'M-01',
            'weight_kg' => 22.5,
            'issue_description' => 'Needle mark',
            'source' => 'fac',
            'factory_sign_json' => ['v' => 'ok', 'by' => 'রুবেল', 'at' => '10:00', 'note' => 'পাস'],
        ]);

        $this->assertCount(1, $order->lines);
        $this->assertEquals('Body', $order->lines->first()->placement);
        $this->assertEquals(['M-01', 'M-02'], $order->machines_json);

        $this->assertCount(1, $order->qcInspections);
        $this->assertEquals('R-01', $order->qcInspections->first()->roll_no);
        $this->assertEquals('SC-2610-099', $qc->order->order_no);
    }
}
