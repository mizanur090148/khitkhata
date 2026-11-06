<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Factories & Subscriptions (combining shilposetu-old & KnitKhata)
        Schema::create('factories', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique(); // f1, f2...
            $table->string('name');
            $table->string('area')->nullable();
            $table->string('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->integer('total_machines')->default(24);
            $table->string('plan_code', 10)->default('g'); // s, g, p, e
            $table->string('billing_cycle', 10)->default('m'); // m, y
            $table->boolean('qr_sticker_enabled')->default(true);
            $table->string('last_update_label')->default('আজ ২:০০');
            $table->integer('yearly_orders_count')->default(14);
            $table->decimal('ontime_delivery_pct', 5, 2)->default(93.00);
            $table->decimal('qc_reject_pct', 5, 2)->default(0.60);
            $table->json('settings_json')->nullable();
            $table->timestamps();
        });

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

        // Parties (Vendors & Suppliers in Factory Ledger)
        Schema::create('parties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->string('code', 40); // abc, xyz, nobo, sup1, sup2
            $table->string('name');
            $table->string('type', 10)->default('ven'); // ven, sup
            $table->string('address')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->string('bin_tin', 50)->nullable();
            $table->decimal('default_rate_tk', 10, 2)->default(0);
            $table->string('payment_terms')->default('বিলের ৩০ দিনের মধ্যে');
            $table->decimal('opening_balance', 14, 2)->default(0);
            $table->date('added_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['factory_id', 'code']);
        });

        // Subcontract Orders & Multi-placement Order Lines
        Schema::create('subcontract_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_no', 40)->unique(); // SC-2610-014
            $table->foreignId('factory_id')->constrained('factories')->cascadeOnDelete();
            $table->string('party_code', 40); // abc, xyz, nobo
            $table->string('buyer')->nullable();
            $table->string('fabric_summary');
            $table->string('gsm', 30)->nullable();
            $table->string('finish_gsm', 30)->nullable();
            $table->string('stitch_length', 30)->nullable();
            $table->string('grey_dia', 30)->nullable();
            $table->string('dia_gauge', 50)->nullable();
            $table->string('color')->nullable();
            $table->string('yarn_summary')->nullable();
            $table->decimal('total_qty_kg', 12, 2)->default(0);
            $table->decimal('done_kg', 12, 2)->default(0);
            $table->decimal('delivered_kg', 12, 2)->default(0);
            $table->decimal('daily_rate_kg', 10, 2)->default(300);
            $table->decimal('rate_tk', 10, 2)->default(14);
            $table->string('status', 20)->default('run'); // run, wait, done
            $table->string('start_label', 30)->default('—');
            $table->date('order_date')->nullable();
            $table->date('delivery_due_date')->nullable();
            $table->date('complete_date')->nullable();
            $table->decimal('today_prod_kg', 10, 2)->default(0);
            $table->json('week_prod_json')->nullable(); // 7-day production array
            $table->json('machines_json')->nullable();
            $table->json('challans_json')->nullable();
            $table->json('yarn_in_json')->nullable();
            $table->timestamps();
        });

        Schema::create('order_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subcontract_order_id')->constrained('subcontract_orders')->cascadeOnDelete();
            $table->integer('line_index')->default(0);
            $table->string('knit_type', 10)->default('c'); // c = circular, f = flat
            $table->boolean('is_yarn_dyed')->default(false);
            $table->string('unit', 10)->default('kg'); // kg, pcs
            $table->string('placement', 60); // Body, Neck Rib, Collar, Cuff
            $table->string('fabrication', 100);
            $table->string('color', 80)->nullable();
            $table->decimal('qty', 12, 2)->default(0);
            $table->decimal('done_qty', 12, 2)->default(0);
            $table->decimal('delivered_qty', 12, 2)->default(0);
            $table->string('grey_gsm', 20)->nullable();
            $table->string('finish_gsm', 20)->nullable();
            $table->string('stitch_length', 30)->nullable();
            $table->string('grey_dia', 20)->nullable();
            $table->string('dia_gauge', 40)->nullable();
            $table->string('flat_size', 40)->nullable();
            $table->string('piece_weight_gm', 20)->nullable();
            $table->string('flat_design')->nullable();
            $table->json('machines_json')->nullable();
            $table->json('yarns_json')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_lines');
        Schema::dropIfExists('subcontract_orders');
        Schema::dropIfExists('parties');
        Schema::dropIfExists('free_machine_requests');
        Schema::dropIfExists('factory_machines');
        Schema::dropIfExists('factories');
    }
};

