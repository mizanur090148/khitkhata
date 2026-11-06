<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add user_id (Primary Owner/Admin) to vendors table
        Schema::table('vendors', function (Blueprint $table) {
            if (!Schema::hasColumn('vendors', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            }
        });

        // 2. Add user_id (Primary Owner/Admin) to suppliers table
        Schema::table('suppliers', function (Blueprint $table) {
            if (!Schema::hasColumn('suppliers', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('vendors', function (Blueprint $table) {
            if (Schema::hasColumn('vendors', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
        });

        Schema::table('suppliers', function (Blueprint $table) {
            if (Schema::hasColumn('suppliers', 'user_id')) {
                $table->dropForeign(['user_id']);
                $table->dropColumn('user_id');
            }
        });
    }
};

