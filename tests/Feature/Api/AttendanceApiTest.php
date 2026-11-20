<?php

namespace Tests\Feature\Api;

use App\Models\Employee;
use App\Models\Factory;
use App\Models\FactoryAttendance;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceApiTest extends TestCase
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

    public function test_can_list_operators(): void
    {
        Employee::create([
            'factory_id' => $this->factory->id,
            'name' => 'মোঃ জসিম উদ্দিন',
            'employee_type' => 'operator',
            'designation' => 'সিনিয়র অপারেটর',
            'status' => 'active',
            'salary_type' => 'daily',
            'basic_salary' => 650,
        ]);

        $response = $this->getJson('/api/v1/portal/operators');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonFragment([
            'name' => 'মোঃ জসিম উদ্দিন',
            'employee_type' => 'operator',
        ]);
    }

    public function test_can_list_employees(): void
    {
        Employee::create([
            'factory_id' => $this->factory->id,
            'name' => 'শফিকুল ইসলাম',
            'employee_type' => 'staff',
            'designation' => 'ফ্লোর ইনচার্জ',
            'status' => 'active',
            'salary_type' => 'monthly',
            'basic_salary' => 25000,
        ]);

        $response = $this->getJson('/api/v1/portal/employees');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonFragment([
            'name' => 'শফিকুল ইসলাম',
            'designation' => 'ফ্লোর ইনচার্জ',
        ]);
    }

    public function test_can_record_attendance_punch(): void
    {
        $payload = [
            'worker_name' => 'মোঃ কাওসার হোসেন',
            'role_type' => 'operator',
            'shift' => 'A',
            'status' => 'present',
            'attendance_date' => '2026-10-03',
            'in_time' => '08:00 AM',
            'out_time' => '05:00 PM',
            'overtime_hours' => 2.0,
            'daily_wage_tk' => 600,
            'note' => 'ভালো কাজ করেছে',
        ];

        $response = $this->postJson('/api/v1/portal/attendance/punch', $payload);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('factory_attendances', [
            'factory_id' => $this->factory->id,
            'worker_name' => 'মোঃ কাওসার হোসেন',
            'shift' => 'A',
            'status' => 'present',
        ]);

        $att = FactoryAttendance::where('worker_name', 'মোঃ কাওসার হোসেন')->first();
        $this->assertNotNull($att);
        $this->assertEquals('2026-10-03', $att->attendance_date->format('Y-m-d'));
    }

    public function test_can_list_attendance_records(): void
    {
        FactoryAttendance::create([
            'factory_id' => $this->factory->id,
            'worker_name' => 'মোঃ কাওসার হোসেন',
            'role_type' => 'operator',
            'attendance_date' => '2026-10-03',
            'shift' => 'A',
            'status' => 'present',
            'daily_wage_tk' => 600,
        ]);

        $response = $this->getJson('/api/v1/portal/attendance');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonFragment([
            'worker_name' => 'মোঃ কাওসার হোসেন',
            'status' => 'present',
        ]);
    }
}
