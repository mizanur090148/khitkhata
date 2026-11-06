<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Subcontract Marketplace Posts & Quotations (from shilposetu-old)
        Schema::create('subcontract_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('factory_id')->nullable()->constrained('factories')->nullOnDelete();
            $table->enum('post_type', ['work_offer', 'machine_available'])->default('work_offer');
            $table->string('title');
            $table->string('fabric_type');
            $table->string('gsm', 30)->nullable();
            $table->integer('dia')->nullable();
            $table->integer('gauge')->nullable();
            $table->decimal('quantity_kg', 12, 2)->default(0);
            $table->decimal('target_rate_tk', 10, 2)->nullable();
            $table->string('yarn_count')->nullable();
            $table->string('location')->nullable();
            $table->date('delivery_deadline')->nullable();
            $table->text('description')->nullable();
            $table->string('status', 20)->default('open'); // open, matched, closed
            $table->timestamps();
        });

        Schema::create('quotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subcontract_post_id')->constrained('subcontract_posts')->cascadeOnDelete();
            $table->foreignId('factory_id')->nullable()->constrained('factories')->nullOnDelete();
            $table->string('bidder_name');
            $table->string('bidder_phone', 30)->nullable();
            $table->decimal('offered_rate_tk', 10, 2);
            $table->integer('estimated_days')->default(7);
            $table->integer('allocated_machines')->default(2);
            $table->text('note')->nullable();
            $table->string('status', 20)->default('pending'); // pending, accepted, rejected
            $table->timestamps();
        });

        // Suppliers, RFQs, Advertisements & Partner Affiliate Program
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
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

        Schema::create('supplier_rfqs', function (Blueprint $table) {
            $table->id();
            $table->string('rfq_no', 30)->unique(); // RFQ-118
            $table->string('factory_code', 20)->default('f1');
            $table->string('category', 40)->nullable();
            $table->string('item_name');
            $table->string('qty_label');
            $table->string('area')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('need_by_label')->default('06 Oct');
            $table->string('status', 20)->default('new'); // new, quoted, won, lost
            $table->string('quoted_price')->nullable();
            $table->string('delivery_days')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('advertisements', function (Blueprint $table) {
            $table->id();
            $table->string('org_name');
            $table->string('placement', 30)->default('home'); // home, sup, job, app
            $table->string('title');
            $table->string('description')->nullable();
            $table->string('cta_label')->default('কল করুন');
            $table->string('duration_label')->default('১৫ দিন');
            $table->string('contact_phone', 30)->nullable();
            $table->string('status', 20)->default('pending'); // active, pending, ended
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advertisements');
        Schema::dropIfExists('supplier_rfqs');
        Schema::dropIfExists('suppliers');
        Schema::dropIfExists('quotations');
        Schema::dropIfExists('subcontract_posts');
    }
};

