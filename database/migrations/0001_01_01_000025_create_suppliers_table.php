<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('name');
            $table->string('category', 30); // mc, sinker, oil, spare, elec
            $table->json('also_categories_json')->nullable();
            $table->string('area');
            $table->decimal('rating', 3, 1)->default(4.6);
            $table->integer('reviews_count')->default(20);
            $table->string('description');
            $table->boolean('is_sponsored')->default(false);
            $table->boolean('is_verified')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
