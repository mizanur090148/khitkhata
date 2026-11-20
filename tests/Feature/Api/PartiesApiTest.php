<?php

namespace Tests\Feature\Api;

use App\Models\Factory;
use App\Models\Party;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PartiesApiTest extends TestCase
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

    public function test_can_list_parties(): void
    {
        Party::create([
            'factory_id' => $this->factory->id,
            'code' => 'abc',
            'name' => 'ABC Knit Composite',
            'type' => 'ven',
            'contact_person' => 'মোঃ কামরুল হাসান',
            'phone' => '01711889900',
            'is_active' => true,
        ]);

        $response = $this->getJson('/api/v1/portal/parties');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonFragment([
            'code' => 'abc',
            'name' => 'ABC Knit Composite',
        ]);
    }

    public function test_can_create_new_party(): void
    {
        $payload = [
            'name' => 'নবায়ন টেক্সটাইল',
            'type' => 'ven',
            'contact' => 'আসিফ মাহমুদ',
            'phone' => '01819000111',
            'addr' => 'মিরপুর, ঢাকা',
            'rate' => 15.5,
            'terms' => '১৫ দিন',
        ];

        $response = $this->postJson('/api/v1/portal/parties', $payload);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('parties', [
            'name' => 'নবায়ন টেক্সটাইল',
            'phone' => '01819000111',
        ]);
    }
}
