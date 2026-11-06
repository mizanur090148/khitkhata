<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Production Logs & Fabric Rolls & Job Cards
        Schema::create('production_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subcontract_order_id')->constrained('subcontract_orders')->cascadeOnDelete();
            $table->string('order_no', 40);
            $table->integer('placement_index')->default(0);
            $table->string('date_label', 20); // 03 Oct
            $table->string('shift', 10)->default('A');
            $table->string('machine_code', 20);
            $table->string('operator_name', 60)->nullable();
            $table->decimal('qty_kg', 10, 2)->default(0);
            $table->integer('rolls_count')->default(0);
            $table->string('yarn_lot', 60)->nullable();
            $table->string('fault_code', 60)->nullable();
            $table->timestamps();
        });

        Schema::create('fabric_rolls', function (Blueprint $table) {
            $table->id();
            $table->string('roll_no', 40); // M-03/001
            $table->string('jc_seq', 10); // 001
            $table->string('order_no', 40)->index();
            $table->integer('placement_index')->default(0);
            $table->string('machine_code', 20);
            $table->string('date_label', 20);
            $table->string('shift', 10)->default('A');
            $table->string('operator_name', 60)->nullable();
            $table->decimal('weight_kg', 8, 2);
            $table->string('yarn_lot', 80)->nullable();
            $table->json('faults_json')->nullable(); // {"Hole": 2}
            $table->string('challan_no', 40)->nullable();
            $table->timestamps();
        });

        // Two-Party QC Inspections (Factory QC & Vendor QC)
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

        // Delivery Challans (Dual Signature)
        Schema::create('delivery_challans', function (Blueprint $table) {
            $table->id();
            $table->string('challan_no', 30)->unique(); // DC-0872
            $table->string('factory_code', 20)->default('f1');
            $table->string('party_code', 40);
            $table->string('order_no', 40);
            $table->string('date_label', 20);
            $table->json('rolls_json'); // roll numbers or roll details
            $table->string('vehicle_no', 80);
            $table->string('driver_name', 80)->nullable();
            $table->string('driver_phone', 40)->nullable();
            $table->json('factory_sign_json'); // {by, at}
            $table->json('vendor_sign_json')->nullable(); // {by, at, got}
            $table->timestamps();
        });

        // Store & Spare Parts
        Schema::create('store_items', function (Blueprint $table) {
            $table->id();
            $table->string('item_code', 20)->unique(); // n1, n2, s1...
            $table->string('name');
            $table->string('category', 60);
            $table->string('unit', 20)->default('পিস');
            $table->integer('stock_qty')->default(0);
            $table->integer('min_qty')->default(0);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->boolean('rfq_sent')->default(false);
            $table->timestamps();
        });

        Schema::create('store_issue_logs', function (Blueprint $table) {
            $table->id();
            $table->string('item_code', 20);
            $table->string('date_label', 20);
            $table->string('machine_code', 30);
            $table->integer('qty');
            $table->string('issued_by', 60);
            $table->timestamps();
        });

        // Bills & Vouchers
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

        // Messaging Threads & Chat
        Schema::create('message_threads', function (Blueprint $table) {
            $table->id();
            $table->string('thread_code', 40)->unique();
            $table->string('factory_code', 20)->default('f1');
            $table->string('party_code', 40)->default('abc');
            $table->string('order_no', 40)->nullable();
            $table->string('title');
            $table->integer('unread_count')->default(0);
            $table->json('messages_json');
            $table->timestamps();
        });

        // Public Jobs, Suppliers, RFQs, Ads, Partner Referrals
        Schema::create('job_listings', function (Blueprint $table) {
            $table->id();
            $table->string('role_title');
            $table->string('company_name');
            $table->string('area');
            $table->string('category', 20); // op, sup, tech, qc, mer
            $table->string('shift_label')->nullable();
            $table->string('experience_label')->nullable();
            $table->string('salary_label')->default('আলোচনা সাপেক্ষে');
            $table->string('posted_label')->default('আজ');
            $table->string('contact_phone', 30)->nullable();
            $table->boolean('is_new')->default(true);
            $table->integer('vacancies')->default(1);
            $table->json('requirements_json');
            $table->timestamps();
        });

        Schema::create('job_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_listing_id')->constrained('job_listings')->cascadeOnDelete();
            $table->string('applicant_name');
            $table->string('phone', 30);
            $table->string('experience');
            $table->string('current_area');
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_applications');
        Schema::dropIfExists('job_listings');
        Schema::dropIfExists('message_threads');
        Schema::dropIfExists('bills');
        Schema::dropIfExists('store_issue_logs');
        Schema::dropIfExists('store_items');
        Schema::dropIfExists('delivery_challans');
        Schema::dropIfExists('qc_inspections');
        Schema::dropIfExists('fabric_rolls');
        Schema::dropIfExists('production_logs');
    }
};

