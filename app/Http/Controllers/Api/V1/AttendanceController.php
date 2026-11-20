<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Factory;
use App\Models\FactoryAttendance;
use App\Models\Operator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
        public function getOperators(Request $request): JsonResponse
    {
        $factory = Factory::where('code', 'f1')->first();
        $query = Employee::where('employee_type', 'operator')->where('status', '!=', 'inactive');
        if ($factory) {
            $query->where(function ($q) use ($factory) {
                $q->where('factory_id', $factory->id)->orWhereNull('factory_id');
            });
        }
        $operators = $query->orderBy('name')->get();

        return $this->success($operators);
    }

        public function getEmployees(Request $request): JsonResponse
    {
        $factory = Factory::where('code', 'f1')->first();
        $query = Employee::query();
        if ($factory) {
            $query->where(function ($q) use ($factory) {
                $q->where('factory_id', $factory->id)->orWhereNull('factory_id');
            });
        }
        if ($type = $request->query('type')) {
            $query->where('employee_type', $type);
        }
        $employees = $query->orderBy('id')->get();

        return $this->success($employees);
    }

        public function getAttendance(Request $request): JsonResponse
    {
        $attendances = FactoryAttendance::orderByDesc('attendance_date')->get();
        return $this->success($attendances, 'হাজিরা তালিকা');
    }

        public function storeAttendance(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'worker_name' => ['required', 'string', 'max:100'],
            'role_type' => ['required', 'string', 'max:40'],
            'shift' => ['required', 'string', 'max:10'],
            'status' => ['required', 'string', 'in:present,absent,late,leave,overtime'],
            'attendance_date' => ['nullable', 'date'],
            'in_time' => ['nullable', 'string'],
            'out_time' => ['nullable', 'string'],
            'overtime_hours' => ['nullable', 'numeric'],
            'daily_wage_tk' => ['nullable', 'numeric'],
            'note' => ['nullable', 'string'],
        ]);

        $factory = Factory::where('code', 'f1')->firstOrFail();
        $date = $validated['attendance_date'] ?? now()->toDateString();

        $att = FactoryAttendance::updateOrCreate(
            [
                'factory_id' => $factory->id,
                'worker_name' => $validated['worker_name'],
                'attendance_date' => $date,
                'shift' => $validated['shift'],
            ],
            [
                'role_type' => $validated['role_type'],
                'status' => $validated['status'],
                'in_time' => $validated['in_time'] ?? ($validated['status'] === 'present' ? '08:00 AM' : null),
                'out_time' => $validated['out_time'] ?? ($validated['status'] === 'present' ? '05:00 PM' : null),
                'overtime_hours' => (float) ($validated['overtime_hours'] ?? 0),
                'daily_wage_tk' => (float) ($validated['daily_wage_tk'] ?? 550),
                'note' => $validated['note'] ?? null,
            ]
        );

        return $this->success($att, "{$att->worker_name} এর হাজিরা আপডেট হয়েছে।");
    }
}
