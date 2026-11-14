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

    public function test_server_side_validation_fails_for_invalid_pagination_parameters(): void
    {
        // 1. Invalid negative page
        $response1 = $this->getJson('/api/v1/portal/orders?page=-5');
        $response1->assertStatus(422);
        $response1->assertJsonValidationErrors(['page']);

        // 2. per_page greater than 100
        $response2 = $this->getJson('/api/v1/portal/orders?per_page=500');
        $response2->assertStatus(422);
        $response2->assertJsonValidationErrors(['per_page']);

        // 3. invalid sort column
        $response3 = $this->getJson('/api/v1/portal/orders?sort_by=non_existent_column');
        $response3->assertStatus(422);
        $response3->assertJsonValidationErrors(['sort_by']);

        // 4. invalid sort direction
        $response4 = $this->getJson('/api/v1/portal/orders?sort_dir=sideways');
        $response4->assertStatus(422);
        $response4->assertJsonValidationErrors(['sort_dir']);
    }

    public function test_server_side_pagination_returns_paginated_results_and_metadata(): void
    {
        $party = Party::create([
            'factory_id' => $this->factory->id,
            'code' => 'abc',
            'name' => 'ABC Knit Composite',
            'type' => 'ven',
        ]);

        for ($i = 1; $i <= 25; $i++) {
            $num = str_pad((string) $i, 3, '0', STR_PAD_LEFT);
            SubcontractOrder::create([
                'factory_id' => $this->factory->id,
                'party_id' => $party->id,
                'party_code' => 'abc',
                'order_no' => "ORD-BATCH-{$num}",
                'buyer' => ($i % 2 === 0) ? 'H&M' : 'Zara',
                'fabric_summary' => 'Single Jersey',
                'total_qty_kg' => 1000 * $i,
                'done_kg' => 100 * $i,
                'status' => ($i <= 10) ? 'running' : 'completed',
            ]);
        }

        // Test page 2 with 10 per page
        $response = $this->getJson('/api/v1/portal/orders?page=2&per_page=10&paginate=1');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonStructure([
            'data' => [
                'items',
                'pagination' => [
                    'current_page',
                    'per_page',
                    'total',
                    'last_page',
                    'from',
                    'to',
                ],
            ],
        ]);

        $data = $response->json('data');
        $this->assertEquals(2, $data['pagination']['current_page']);
        $this->assertEquals(10, $data['pagination']['per_page']);
        $this->assertEquals(25, $data['pagination']['total']);
        $this->assertEquals(3, $data['pagination']['last_page']);
        $this->assertCount(10, $data['items']);
    }

    public function test_server_side_search_and_filter(): void
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
            'order_no' => 'ORD-SEARCH-ALPHA',
            'buyer' => 'UniqueBuyerName',
            'fabric_summary' => 'French Terry 240 GSM',
            'total_qty_kg' => 5000,
            'status' => 'running',
        ]);

        SubcontractOrder::create([
            'factory_id' => $this->factory->id,
            'party_id' => $party->id,
            'party_code' => 'abc',
            'order_no' => 'ORD-SEARCH-BETA',
            'buyer' => 'AnotherBuyer',
            'fabric_summary' => 'Pique 210 GSM',
            'total_qty_kg' => 3000,
            'status' => 'completed',
        ]);

        // Search for UniqueBuyerName
        $response = $this->getJson('/api/v1/portal/orders?search=UniqueBuyerName&paginate=1');
        $response->assertStatus(200);
        $items = $response->json('data.items');
        $this->assertCount(1, $items);
        $this->assertEquals('ORD-SEARCH-ALPHA', $items[0]['id']);

        // Filter by completed status
        $responseStatus = $this->getJson('/api/v1/portal/orders?status=completed&paginate=1');
        $responseStatus->assertStatus(200);
        $itemsStatus = $responseStatus->json('data.items');
        $this->assertCount(1, $itemsStatus);
        $this->assertEquals('ORD-SEARCH-BETA', $itemsStatus[0]['id']);
    }
}
