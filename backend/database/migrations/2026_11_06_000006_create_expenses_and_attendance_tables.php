<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Factory Daily Expenses & Costing Ledger
        if (!Schema::hasTable('factory_expenses')) {
            Schema::create('factory_expenses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
                $table->string('category', 40); // electricity, maintenance, needle_oil, salary, snacks, transport, other
                $table->string('title');
                $table->decimal('amount_tk', 14, 2);
                $table->string('payment_method', 30)->default('cash'); // cash, bank, bkash
                $table->string('reference_no', 40)->nullable();
                $table->date('expense_date');
                $table->string('created_by', 60)->default('ম্যানেজার');
                $table->text('notes')->nullable();
                $table->timestamps();
            });
        }

        // 2. Factory Floor Workers Daily Attendance & Payroll
        if (!Schema::hasTable('factory_attendances')) {
            Schema::create('factory_attendances', function (Blueprint $table) {
                $table->id();
                $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
                $table->string('worker_name', 100);
                $table->string('role_type', 40)->default('operator'); // operator, helper, master, mechanic, qc, guard
                $table->string('shift', 10)->default('A');
                $table->string('status', 20)->default('present'); // present, absent, late, leave, overtime
                $table->date('attendance_date');
                $table->string('in_time', 20)->nullable();
                $table->string('out_time', 20)->nullable();
                $table->decimal('overtime_hours', 4, 1)->default(0);
                $table->decimal('daily_wage_tk', 10, 2)->default(500);
                $table->text('note')->nullable();
                $table->timestamps();

                $table->unique(['factory_id', 'worker_name', 'attendance_date', 'shift'], 'factory_worker_shift_unique');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('factory_attendances');
        Schema::dropIfExists('factory_expenses');
    }
};

