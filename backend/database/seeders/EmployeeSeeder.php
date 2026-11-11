<?php

namespace Database\Seeders;

use App\Models\Employee;
use App\Models\Factory;
use Illuminate\Database\Seeder;

class EmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $factory = Factory::where('code', 'f1')->first() ?? Factory::first();
        $factoryId = $factory?->id;

        $employees = [
            [
                'factory_id' => $factoryId,
                'employee_type' => 'operator',
                'id_no' => 'OP-101',
                'name' => 'জসিম',
                'mobile' => '01712-345601',
                'address' => 'ফতুল্লা, নারায়ণগঞ্জ',
                'designation' => 'সিনিয়র অপারেটর',
                'shift' => 'A',
                'machine_assigned' => 'M-01',
                'daily_wage' => 750.00,
                'status' => 'active',
            ],
            [
                'factory_id' => $factoryId,
                'employee_type' => 'operator',
                'id_no' => 'OP-102',
                'name' => 'সোহেল',
                'mobile' => '01712-345602',
                'address' => 'সিদ্ধিরগঞ্জ, নারায়ণগঞ্জ',
                'designation' => 'অপারেটর',
                'shift' => 'A',
                'machine_assigned' => 'M-02',
                'daily_wage' => 700.00,
                'status' => 'active',
            ],
            [
                'factory_id' => $factoryId,
                'employee_type' => 'operator',
                'id_no' => 'OP-103',
                'name' => 'আলমগীর',
                'mobile' => '01712-345603',
                'address' => 'কোনাবাড়ি, গাজীপুর',
                'designation' => 'অপারেটর',
                'shift' => 'A',
                'machine_assigned' => 'M-03',
                'daily_wage' => 700.00,
                'status' => 'active',
            ],
            [
                'factory_id' => $factoryId,
                'employee_type' => 'operator',
                'id_no' => 'OP-104',
                'name' => 'রিপন',
                'mobile' => '01712-345604',
                'address' => 'কাঁচপুর, নারায়ণগঞ্জ',
                'designation' => 'অপারেটর',
                'shift' => 'B',
                'machine_assigned' => 'M-04',
                'daily_wage' => 700.00,
                'status' => 'active',
            ],
            [
                'factory_id' => $factoryId,
                'employee_type' => 'operator',
                'id_no' => 'OP-105',
                'name' => 'হাবিব',
                'mobile' => '01712-345605',
                'address' => 'টঙ্গী, গাজীপুর',
                'designation' => 'অপারেটর',
                'shift' => 'B',
                'machine_assigned' => 'M-05',
                'daily_wage' => 700.00,
                'status' => 'active',
            ],
            [
                'factory_id' => $factoryId,
                'employee_type' => 'operator',
                'id_no' => 'OP-106',
                'name' => 'মাসুদ',
                'mobile' => '01712-345606',
                'address' => 'ফতুল্লা, নারায়ণগঞ্জ',
                'designation' => 'অপারেটর',
                'shift' => 'C',
                'machine_assigned' => 'M-06',
                'daily_wage' => 720.00,
                'status' => 'active',
            ],
            [
                'factory_id' => $factoryId,
                'employee_type' => 'operator',
                'id_no' => 'OP-107',
                'name' => 'কামাল',
                'mobile' => '01712-345607',
                'address' => 'গোদানাইল, নারায়ণগঞ্জ',
                'designation' => 'অপারেটর',
                'shift' => 'A',
                'machine_assigned' => 'M-07',
                'daily_wage' => 680.00,
                'status' => 'active',
            ],
            [
                'factory_id' => $factoryId,
                'employee_type' => 'operator',
                'id_no' => 'OP-108',
                'name' => 'আবদুল মান্নান',
                'mobile' => '01712-345608',
                'address' => 'চাষাড়া, নারায়ণগঞ্জ',
                'designation' => 'অপারেটর',
                'shift' => 'B',
                'machine_assigned' => 'M-08',
                'daily_wage' => 680.00,
                'status' => 'active',
            ],
            [
                'factory_id' => $factoryId,
                'employee_type' => 'helper',
                'id_no' => 'HLP-201',
                'name' => 'নাজমুল হাসান',
                'mobile' => '01812-345609',
                'address' => 'চাষাড়া, নারায়ণগঞ্জ',
                'designation' => 'নিটিং হেল্পার',
                'shift' => 'A',
                'machine_assigned' => null,
                'daily_wage' => 450.00,
                'status' => 'active',
            ],
            [
                'factory_id' => $factoryId,
                'employee_type' => 'helper',
                'id_no' => 'HLP-202',
                'name' => 'আনোয়ার হোসেন',
                'mobile' => '01812-345610',
                'address' => 'কোনাবাড়ি, গাজীপুর',
                'designation' => 'নিটিং হেল্পার',
                'shift' => 'B',
                'machine_assigned' => null,
                'daily_wage' => 450.00,
                'status' => 'active',
            ],
            [
                'factory_id' => $factoryId,
                'employee_type' => 'supervisor',
                'id_no' => 'SUP-301',
                'name' => 'রুবেল মিয়া',
                'mobile' => '01912-345611',
                'address' => 'শিবু মার্কেট, নারায়ণগঞ্জ',
                'designation' => 'ফ্লোর সুপারভাইজার',
                'shift' => 'A',
                'machine_assigned' => null,
                'daily_wage' => 900.00,
                'status' => 'active',
            ],
        ];

        foreach ($employees as $emp) {
            Employee::updateOrCreate(
                ['id_no' => $emp['id_no']],
                $emp
            );
        }
    }
}
