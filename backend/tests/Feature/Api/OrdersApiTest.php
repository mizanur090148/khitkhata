<?php

namespace Tests\Feature\Api;

use App\Models\Factory;
use App\Models\Party;
use App\Models\SubcontractOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrdersApiTest extends TestCase
{
    use RefreshDatabase;

    private Factory $factory;

    protected function setUp(): void
    {
        parent::setUp();
        $this->factory = Factory::create([
            'code' => 'f1',
            'name' => 'রহমান নিটিং ইন্ডাস্ট্রিজ',
        ]);
    }

    public function test_can_get_orders_list(): void
    {
        $party = Party::create([
            'factory_id' => $this->factory->id,
            'code' => 'abc',
            'name' => 'ABC Knit Composite',
            'type' => 'ven',
        ]);

        SubcontractOrder::create([
            'factory_id' => $this->factory->id,
            'party_id' => $party->id,
            'party_code' => 'abc',
            'order_no' => 'ORD-26-0891',
            'buyer' => 'H&M',
            'fabric_summary' => 'Single Jersey 160 GSM',
            'total_qty_kg' => 12000,
            'done_kg' => 7420,
            'status' => 'run',
        ]);

        $response = $this->getJson('/api/v1/portal/orders');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonFragment([
            'id' => 'ORD-26-0891',
            'buyer' => 'H&M',
        ]);
    }

    public function test_can_create_order_via_api(): void
    {
        Party::create([
            'factory_id' => $this->factory->id,
            'code' => 'xyz',
            'name' => 'XYZ Fashion Ltd',
            'type' => 'ven',
        ]);

        $payload = [
            'id' => 'ORD-26-9999',
            'vendor_name' => 'XYZ Fashion Ltd',
            'buyer' => 'Zara',
            'fabric' => '1x1 Rib 220 GSM',
            'qty' => 6000,
            'rate_tk' => 16.0,
            'lines' => [
                [
                    'kt' => 'c',
                    'fab' => '1x1 Rib',
                    'dia' => '32" × 18G',
                    'qty' => 6000,
                    'unit' => 'kg',
                ],
            ],
        ];

        $response = $this->postJson('/api/v1/portal/orders', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('subcontract_orders', [
            'order_no' => 'ORD-26-9999',
            'buyer' => 'Zara',
        ]);
    }

    public function test_can_delete_order(): void
    {
        $order = SubcontractOrder::create([
            'factory_id' => $this->factory->id,
            'party_code' => 'abc',
            'order_no' => 'ORD-DEL-01',
            'fabric_summary' => 'Single Jersey 160 GSM',
            'total_qty_kg' => 1000,
            'done_kg' => 0,
            'status' => 'draft',
        ]);

        $response = $this->deleteJson('/api/v1/portal/orders/ORD-DEL-01');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertSoftDeleted('subcontract_orders', [
            'order_no' => 'ORD-DEL-01',
        ]);
    }
}
