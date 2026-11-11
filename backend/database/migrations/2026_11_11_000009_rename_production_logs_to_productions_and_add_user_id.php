<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('production_logs') && !Schema::hasTable('productions')) {
            Schema::rename('production_logs', 'productions');
        }

        Schema::table('productions', function (Blueprint $table) {
            if (!Schema::hasColumn('productions', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('subcontract_order_id')->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('productions', 'employee_id')) {
                $table->foreignId('employee_id')->nullable()->after('user_id')->constrained('employees')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('productions', function (Blueprint $table) {
            if (Schema::hasColumn('productions', 'employee_id')) {
                $table->dropForeign(['employee_id']);
                $table->dropColumn('employee_id');
            }
            if (Schema::hasColumn('productions', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
        });

        if (Schema::hasTable('productions') && !Schema::hasTable('production_logs')) {
            Schema::rename('productions', 'production_logs');
        }
    }
};

