<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Vendors Table (Composites, Buying Houses, Garments)
        if (!Schema::hasTable('vendors')) {
            Schema::create('vendors', function (Blueprint $table) {
                $table->id();
                $table->string('code', 30)->unique();
                $table->string('name');
                $table->string('type', 40)->default('কম্পোজিট'); // কম্পোজিট, বায়িং হাউস, গার্মেন্টস
                $table->string('contact_person')->nullable();
                $table->string('phone', 30)->nullable();
                $table->string('email')->nullable();
                $table->string('area')->nullable();
                $table->string('address')->nullable();
                $table->boolean('is_verified')->default(true);
                $table->json('settings_json')->nullable();
                $table->timestamps();
            });
        }

        // 2. Partners Table (Affiliate & Referral Commission Program)
        if (!Schema::hasTable('partners')) {
            Schema::create('partners', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
                $table->string('partner_code', 30)->unique();
                $table->integer('total_referrals')->default(0);
                $table->integer('active_factories_count')->default(0);
                $table->decimal('total_commission_tk', 14, 2)->default(0);
                $table->decimal('withdrawn_commission_tk', 14, 2)->default(0);
                $table->decimal('balance_commission_tk', 14, 2)->default(0);
                $table->string('payout_method', 30)->default('bkash');
                $table->string('payout_number', 30)->nullable();
                $table->timestamps();
            });
        }

        // 3. Auth OTPs (Mobile Verification & Password Recovery)
        if (!Schema::hasTable('auth_otps')) {
            Schema::create('auth_otps', function (Blueprint $table) {
                $table->id();
                $table->string('phone', 30)->index();
                $table->string('code', 10);
                $table->string('purpose', 30)->default('register'); // register, login, reset_password
                $table->timestamp('expires_at');
                $table->boolean('is_used')->default(false);
                $table->timestamps();
            });
        }

        // 4. Enhance Users Table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'vendor_id')) {
                $table->unsignedBigInteger('vendor_id')->nullable()->after('factory_id');
            }
            if (!Schema::hasColumn('users', 'supplier_id')) {
                $table->unsignedBigInteger('supplier_id')->nullable()->after('vendor_id');
            }
            if (!Schema::hasColumn('users', 'partner_code')) {
                $table->string('partner_code', 30)->nullable()->after('supplier_id');
            }
            if (!Schema::hasColumn('users', 'phone_verified_at')) {
                $table->timestamp('phone_verified_at')->nullable()->after('is_active');
            }
            if (!Schema::hasColumn('users', 'trial_ends_at')) {
                $table->timestamp('trial_ends_at')->nullable()->after('phone_verified_at');
            }
            if (!Schema::hasColumn('users', 'subscription_plan')) {
                $table->string('subscription_plan', 20)->default('free')->after('trial_ends_at');
            }
            if (!Schema::hasColumn('users', 'billing_cycle')) {
                $table->string('billing_cycle', 10)->default('m')->after('subscription_plan');
            }
        });

        // 5. Enhance Factories Table
        Schema::table('factories', function (Blueprint $table) {
            if (!Schema::hasColumn('factories', 'trial_ends_at')) {
                $table->timestamp('trial_ends_at')->nullable()->after('plan_code');
            }
            if (!Schema::hasColumn('factories', 'owner_id')) {
                $table->unsignedBigInteger('owner_id')->nullable()->after('trial_ends_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('factories', function (Blueprint $table) {
            if (Schema::hasColumn('factories', 'owner_id')) {
                $table->dropColumn('owner_id');
            }
            if (Schema::hasColumn('factories', 'trial_ends_at')) {
                $table->dropColumn('trial_ends_at');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            $cols = ['vendor_id', 'supplier_id', 'partner_code', 'phone_verified_at', 'trial_ends_at', 'subscription_plan', 'billing_cycle'];
            foreach ($cols as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        Schema::dropIfExists('auth_otps');
        Schema::dropIfExists('partners');
        Schema::dropIfExists('vendors');
    }
};

