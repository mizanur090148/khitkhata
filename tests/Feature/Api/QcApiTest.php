<?php

namespace Tests\Feature\Api;

use App\Models\Factory;
use App\Models\QcInspection;
use App\Models\SubcontractOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QcApiTest extends TestCase
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

    public function test_can_list_qc_inspections(): void
    {
        SubcontractOrder::create([
            'factory_id' => $this->factory->id,
            'party_code' => 'abc',
            'order_no' => 'ORD-26-0891',
            'fabric_summary' => 'Single Jersey',
            'total_qty_kg' => 12000,
            'done_kg' => 0,
            'status' => 'run',
        ]);

        QcInspection::create([
            'qc_no' => 'QC-2610-001',
            'order_no' => 'ORD-26-0891',
            'placement_index' => 0,
            'placement_name' => 'Body',
            'date_label' => '03 Oct',
            'roll_no' => 'M-03/001',
            'machine_code' => 'M-03',
            'weight_kg' => 24.0,
            'issue_description' => 'Hole / Needle Mark',
            'source' => 'fac',
            'factory_sign_json' => ['v' => 'ok', 'by' => 'রুবেল', 'at' => '10:00', 'note' => 'পাস'],
            'vendor_sign_json' => ['v' => 'ok', 'by' => 'কামরুল', 'at' => '11:00', 'note' => 'অনুমোদিত'],
        ]);

        $response = $this->getJson('/api/v1/portal/qc');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonFragment([
            'id' => 'QC-2610-001',
            'roll' => 'M-03/001',
        ]);
    }

    public function test_can_store_qc_inspection(): void
    {
        $payload = [
            'order_no' => 'ORD-26-0891',
            'placement_index' => 0,
            'roll_no' => 'M-04/005',
            'machine_code' => 'M-04',
            'weight_kg' => 22.0,
            'issue' => 'Patta (Barre)',
            'verdict' => 'bad',
            'side' => 'fac',
            'signed_by' => 'রুবেল মিয়া',
            'note' => 'লট মিক্স সন্দেহ',
        ];

        $response = $this->postJson('/api/v1/portal/qc', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('qc_inspections', [
            'order_no' => 'ORD-26-0891',
            'roll_no' => 'M-04/005',
            'issue_description' => 'Patta (Barre)',
        ]);
    }

    public function test_can_sign_qc_inspection(): void
    {
        $qc = QcInspection::create([
            'qc_no' => 'QC-2610-999',
            'order_no' => 'ORD-26-0891',
            'placement_index' => 0,
            'date_label' => '03 Oct',
            'roll_no' => 'M-07/003',
            'weight_kg' => 20.0,
            'issue_description' => 'Lycra out',
            'source' => 'fac',
            'factory_sign_json' => ['v' => 'bad', 'by' => 'রুবেল', 'at' => '10:00', 'note' => 'বাতিল'],
            'vendor_sign_json' => ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
        ]);

        $response = $this->postJson('/api/v1/portal/qc/QC-2610-999/sign', [
            'side' => 'ven',
            'verdict' => 'bad',
            'signed_by' => 'কামরুল হাসান',
            'note' => 'রিনিট করতে হবে',
            'action_taken' => 'রিনিট হবে',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $qc->refresh();
        $this->assertEquals('bad', $qc->vendor_sign_json['v']);
        $this->assertEquals('কামরুল হাসান', $qc->vendor_sign_json['by']);
        $this->assertEquals('রিনিট হবে', $qc->action_taken);
    }
}
