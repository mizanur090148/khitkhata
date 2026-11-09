<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add softDeletes to parties table
        Schema::table('parties', function (Blueprint $table) {
            if (!Schema::hasColumn('parties', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // 2. Add party_id and softDeletes to subcontract_orders table
        Schema::table('subcontract_orders', function (Blueprint $table) {
            if (!Schema::hasColumn('subcontract_orders', 'party_id')) {
                $table->foreignId('party_id')->nullable()->after('factory_id')->constrained('parties')->nullOnDelete();
            }
            if (!Schema::hasColumn('subcontract_orders', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        // 3. Backfill party_id on existing orders by matching party_code with parties.code
        try {
            DB::statement("
                UPDATE subcontract_orders so
                JOIN parties p ON (p.factory_id = so.factory_id AND (p.code = so.party_code OR p.name = so.party_code))
                SET so.party_id = p.id
                WHERE so.party_id IS NULL
            ");
        } catch (\Throwable $e) {
            // If table has no rows or foreign key mismatch, ignore
        }
    }

    public function down(): void
    {
        Schema::table('subcontract_orders', function (Blueprint $table) {
            if (Schema::hasColumn('subcontract_orders', 'party_id')) {
                $table->dropConstrainedForeignId('party_id');
            }
            if (Schema::hasColumn('subcontract_orders', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });

        Schema::table('parties', function (Blueprint $table) {
            if (Schema::hasColumn('parties', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};

