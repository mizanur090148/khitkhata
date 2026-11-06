<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone', 30)->unique();
            $table->string('email')->nullable()->unique();
            $table->string('password');
            $table->string('role', 20)->default('fac'); // fac, ven, sup, par
            $table->string('designation')->nullable(); // মালিক, প্রোডাকশন ম্যানেজার, QC ইনচার্জ, মার্চেন্ডাইজার
            $table->string('organization_name')->nullable();
            $table->unsignedBigInteger('factory_id')->nullable();
            $table->string('party_code', 50)->nullable();
            $table->boolean('is_owner')->default(false);
            $table->boolean('is_vendor_rep')->default(false);
            $table->boolean('can_message')->default(true);
            $table->boolean('is_active')->default(true);
            $table->string('last_login_label')->nullable();
            $table->json('permissions_json')->nullable();
            $table->json('profile_json')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->text('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cache_locks');
        Schema::dropIfExists('cache');
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};

