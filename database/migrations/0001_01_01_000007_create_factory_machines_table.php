<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factory_machines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->string('code', 20); // M-01..M-24, F-01..F-06
            $table->string('knit_type', 10)->default('c'); // c = circular, f = flat
            $table->integer('dia')->nullable();
            $table->integer('gauge')->default(24);
            $table->string('spec_label', 40)->nullable(); // 30" × 24G
            $table->string('brand')->nullable();
            $table->string('status', 50)->default('idle'); // idle, wait, down, run:SC-2610-014
            $table->string('current_order_no', 50)->nullable();
            $table->boolean('broadcast_free')->default(false);
            $table->date('free_from')->nullable();
            $table->integer('daily_capacity_kg')->default(190);
            $table->string('rate_label')->nullable();
            $table->json('supported_fabrics_json')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();

            $table->unique(['factory_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factory_machines');
    }
};
