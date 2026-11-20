<?php

namespace Tests\Feature\Api;

use App\Models\Bill;
use App\Models\Factory;
use App\Models\Party;
use App\Models\SubcontractOrder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillApiTest extends TestCase
{
    use RefreshDatabase;

    private Factory $factory;
    private Party $party;
    private SubcontractOrder $order;

    protected function setUp(): void
    {
        parent::setUp();

        $this->factory = Factory::create([
            'code' => 'f1',
            'name' => 'রহমান নিটিং',
        ]);

        $this->party = Party::create([
            'factory_id' => $this->factory->id,
            'code' => 'abc',
            'name' => 'এবিসি টেক্সটাইল',
            'party_type' => 'buyer',
            'phone' => '01711223344',
        ]);

        $this->order = SubcontractOrder::create([
            'factory_id' => $this->factory->id,
            'party_code' => 'abc',
            'order_no' => 'SC-2610-099',
            'fabric_summary' => 'Single Jersey 160 GSM',
            'total_qty_kg' => 1200,
            'delivered_kg' => 1200,
            'rate_tk' => 28.5,
            'status' => 'delivered',
        ]);
    }

    public function test_can_list_bills(): void
    {
        Bill::create([
            'bill_no' => 'BL-2610-001',
            'factory_code' => 'f1',
            'party_code' => 'abc',
            'bill_date' => '2026-10-01',
            'jv_no' => 'JV-0928',
            'lines_json' => [
                [
                    'o' => 'SC-2610-099',
                    'fab' => 'Single Jersey 160 GSM',
                    'kg' => 1200,
                    'rate' => 28.5,
                ],
            ],
            'payments_json' => [],
        ]);

        $response = $this->getJson('/api/v1/portal/bills');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonFragment([
            'no' => 'BL-2610-001',
            'v' => 'abc',
        ]);
    }

    public function test_can_generate_bill(): void
    {
        $payload = [
            'party_code' => 'abc',
            'order_ids' => ['SC-2610-099'],
        ];

        $response = $this->postJson('/api/v1/portal/bills', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('bills', [
            'party_code' => 'abc',
            'factory_code' => 'f1',
        ]);
    }

    public function test_can_record_bill_payment(): void
    {
        $bill = Bill::create([
            'bill_no' => 'BL-2610-002',
            'factory_code' => 'f1',
            'party_code' => 'abc',
            'bill_date' => '2026-10-01',
            'jv_no' => 'JV-0929',
            'lines_json' => [
                [
                    'o' => 'SC-2610-099',
                    'fab' => 'Single Jersey 160 GSM',
                    'kg' => 1200,
                    'rate' => 28.5,
                ],
            ],
            'payments_json' => [],
        ]);

        $payload = [
            'amount' => 15000,
            'mode' => 'bank',
            'ref' => 'CHQ-991823',
            'pending' => false,
        ];

        $response = $this->postJson("/api/v1/portal/bills/{$bill->bill_no}/pay", $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $updatedBill = Bill::where('bill_no', 'BL-2610-002')->first();
        $this->assertNotEmpty($updatedBill->payments_json);
        $this->assertEquals(15000, $updatedBill->payments_json[0]['amt']);
        $this->assertEquals('CHQ-991823', $updatedBill->payments_json[0]['rv']);
    }
}
