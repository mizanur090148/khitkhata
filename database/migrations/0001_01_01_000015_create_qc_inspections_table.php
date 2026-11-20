<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qc_inspections', function (Blueprint $table) {
            $table->id();
            $table->string('qc_no', 30)->unique(); // QC-0104
            $table->string('order_no', 40)->index();
            $table->integer('placement_index')->default(0);
            $table->string('placement_name', 60)->nullable();
            $table->string('date_label', 20);
            $table->string('roll_no', 40);
            $table->string('machine_code', 20)->nullable();
            $table->decimal('weight_kg', 10, 2)->default(0);
            $table->string('issue_description');
            $table->string('source', 20)->default('fac'); // fac, ven, floor
            $table->json('factory_sign_json')->nullable(); // {v:'ok'|'bad'|null, by, at, note}
            $table->json('vendor_sign_json')->nullable();  // {v:'ok'|'bad'|null, by, at, note}
            $table->string('action_taken', 100)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qc_inspections');
    }
};
