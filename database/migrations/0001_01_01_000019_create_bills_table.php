<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->string('bill_no', 40)->unique(); // BL-2610-001
            $table->string('factory_code', 20)->default('f1');
            $table->string('party_code', 40);
            $table->date('bill_date');
            $table->string('jv_no', 40);
            $table->json('lines_json'); // [{o, fab, kg, rate}]
            $table->json('payments_json')->nullable(); // [{d, amt, rv/ref, mode, pend}]
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};
