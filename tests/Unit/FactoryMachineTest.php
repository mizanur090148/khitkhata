<?php

namespace Tests\Unit;

use App\Models\Factory;
use App\Models\FactoryMachine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FactoryMachineTest extends TestCase
{
    use RefreshDatabase;

    public function test_factory_machine_can_be_created_with_specifications(): void
    {
        $factory = Factory::create([
            'code' => 'f1',
            'name' => 'রহমান নিটিং ইন্ডাস্ট্রিজ',
            'area' => 'গাজীপুর',
        ]);

        $machine = FactoryMachine::create([
            'factory_id' => $factory->id,
            'code' => 'M-05',
            'knit_type' => 'c',
            'dia' => 32,
            'gauge' => 24,
            'spec_label' => '32" × 24G',
            'brand' => 'Pailung (Taiwan)',
            'status' => 'idle',
            'current_order_no' => null,
            'broadcast_free' => true,
            'daily_capacity_kg' => 210,
        ]);

        $this->assertDatabaseHas('factory_machines', [
            'code' => 'M-05',
            'dia' => 32,
            'gauge' => 24,
            'broadcast_free' => 1,
        ]);

        $this->assertEquals($factory->id, $machine->factory->id);
        $this->assertEquals('c', $machine->knit_type);
    }

    public function test_flat_collar_machine_specification(): void
    {
        $factory = Factory::create([
            'code' => 'f1',
            'name' => 'রহমান নিটিং ইন্ডাস্ট্রিজ',
        ]);

        $machine = FactoryMachine::create([
            'factory_id' => $factory->id,
            'code' => 'F-01',
            'knit_type' => 'f',
            'gauge' => 14,
            'spec_label' => 'Flat Collar 14G',
            'brand' => 'Kauo Heng',
            'status' => 'run:SC-2610-015',
            'current_order_no' => 'SC-2610-015',
            'daily_capacity_kg' => 150,
        ]);

        $this->assertEquals('f', $machine->knit_type);
        $this->assertEquals('Flat Collar 14G', $machine->spec_label);
    }
}

