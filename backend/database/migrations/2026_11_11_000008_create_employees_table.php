<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('factory_id')->nullable()->constrained('factories')->nullOnDelete();
            $table->string('employee_type', 40)->default('operator'); // operator, helper, master, supervisor, etc.
            $table->string('id_no', 40)->nullable()->index();
            $table->string('name', 120);
            $table->string('mobile', 30)->nullable();
            $table->text('address')->nullable();
            $table->string('designation', 80)->nullable();
            $table->string('shift', 10)->nullable();
            $table->string('machine_assigned', 40)->nullable();
            $table->decimal('daily_wage', 10, 2)->default(0);
            $table->date('joining_date')->nullable();
            $table->string('status', 20)->default('active'); // active, inactive, on_leave
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Also create operators view so any query referencing the operators table/view works natively
        try {
            DB::statement("CREATE OR REPLACE VIEW operators AS SELECT * FROM employees WHERE employee_type = 'operator'");
        } catch (\Throwable $e) {
            // View fallback
        }
    }

    public function down(): void
    {
        try {
            DB::statement("DROP VIEW IF EXISTS operators");
        } catch (\Throwable $e) {}

        Schema::dropIfExists('employees');
    }
};

