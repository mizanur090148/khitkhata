<?php

namespace Tests\Feature\Api;

use App\Models\DeliveryChallan;
use App\Models\Factory;
use App\Models\Party;
use App\Models\SubcontractOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ChallanApiTest extends TestCase
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

    public function test_can_list_challans(): void
    {
        DeliveryChallan::create([
            'challan_no' => 'CH-2610-001',
            'factory_code' => 'f1',
            'party_code' => 'abc',
            'order_no' => 'ORD-26-0891',
            'date_label' => '03 Oct',
            'vehicle_no' => 'ঢাকা মেট্রো-ট ১১-২২৩৩',
            'driver_name' => 'মোঃ রফিক',
            'driver_phone' => '01711334455',
            'rolls_json' => ['M-03/001', 'M-03/002'],
            'factory_sign_json' => ['by' => 'মোঃ রফিক', 'at' => '03 Oct, 10:00'],
        ]);

        $response = $this->getJson('/api/v1/portal/challans');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonFragment([
            'no' => 'CH-2610-001',
            'veh' => 'ঢাকা মেট্রো-ট ১১-২২৩৩',
        ]);
    }

    public function test_can_create_delivery_challan(): void
    {
        SubcontractOrder::create([
            'factory_id' => $this->factory->id,
            'party_code' => 'abc',
            'order_no' => 'ORD-26-0891',
            'fabric_summary' => 'Single Jersey 160 GSM',
            'total_qty_kg' => 5000,
            'done_kg' => 1000,
            'status' => 'run',
        ]);

        $payload = [
            'party_code' => 'abc',
            'order_no' => 'ORD-26-0891',
            'rolls' => ['M-03/001', 'M-03/002', 'M-03/003'],
            'vehicle_no' => 'ঢাকা মেট্রো-ড ১২-৩৪৫৬',
            'driver_name' => 'আনোয়ার হোসেন',
            'signed_by' => 'শফিকুল ইসলাম',
        ];

        $response = $this->postJson('/api/v1/portal/challans', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('delivery_challans', [
            'party_code' => 'abc',
            'order_no' => 'ORD-26-0891',
            'vehicle_no' => 'ঢাকা মেট্রো-ড ১২-৩৪৫৬',
        ]);
    }
}
