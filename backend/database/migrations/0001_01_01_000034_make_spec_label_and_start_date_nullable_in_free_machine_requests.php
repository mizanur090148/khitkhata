<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('free_machine_requests', function (Blueprint $table) {
            $table->string('spec_label', 100)->default('30" × 24G')->change();
            $table->date('start_date')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('free_machine_requests', function (Blueprint $table) {
            $table->string('spec_label', 40)->change();
            $table->date('start_date')->nullable(false)->change();
        });
    }
};
