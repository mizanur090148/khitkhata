<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('free_machine_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_no', 30)->unique(); // RQ-07
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->string('party_code', 30); // xyz, nobo, abc
            $table->string('contact_person');
            $table->string('fabrication');
            $table->decimal('qty_kg', 12, 2);
            $table->integer('machines_needed')->default(1);
            $table->string('spec_label', 40);
            $table->date('start_date');
            $table->text('message')->nullable();
            $table->string('status', 20)->default('new'); // new, ok, no, wait, conf
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('free_machine_requests');
    }
};
