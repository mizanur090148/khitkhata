<?php

namespace Tests\Feature\Api;

use App\Models\Factory;
use App\Models\Party;
use App\Models\SubcontractOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class YarnApiTest extends TestCase
{
    use RefreshDatabase;

    private Factory $factory;
    private SubcontractOrder $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->factory = Factory::create([
            'code' => 'f1',
            'name' => 'রহমান নিটিং',
        ]);

        $party = Party::create([
            'factory_id' => $this->factory->id,
            'code' => 'abc',
            'name' => 'এবিসি টেক্সটাইল',
            'party_type' => 'buyer',
            'phone' => '01711223344',
        ]);

        $this->order = SubcontractOrder::create([
            'factory_id' => $this->factory->id,
            'party_code' => 'abc',
            'order_no' => 'SC-2610-088',
            'fabric_summary' => 'Single Jersey 160 GSM',
            'total_qty_kg' => 2000,
            'rate_tk' => 28,
            'yarn_in_json' => [],
        ]);
    }

    public function test_can_receive_yarn_for_order(): void
    {
        $payload = [
            'order_no' => 'SC-2610-088',
            'count' => '30s Combed',
            'spinner' => 'আকিজ স্পিনিং',
            'lot' => 'LOT-AK-99',
            'bags' => 25,
            'kg' => 1125.5,
        ];

        $response = $this->postJson('/api/v1/portal/yarn/receive', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $order = SubcontractOrder::where('order_no', 'SC-2610-088')->first();
        $this->assertNotEmpty($order->yarn_in_json);
        $this->assertEquals('30s Combed', $order->yarn_in_json[0]['count']);
        $this->assertEquals(1125.5, $order->yarn_in_json[0]['kg']);
    }
}

