<?php

namespace Tests\Feature\Api;

use App\Models\Factory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_as_factory(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'মোঃ আরিফ হোসেন',
            'phone' => '01711998877',
            'email' => 'arif@knitkhata.com',
            'password' => 'secret123',
            'role' => 'fac',
            'organization_name' => 'আরিফ নিটিং টেক্সটাইল',
            'area' => 'গাজীপুর',
            'machines_count' => 12,
            'plan_code' => 'g',
        ]);

        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'user' => ['id', 'name', 'phone', 'email', 'role'],
                'token',
            ],
        ]);

        $this->assertDatabaseHas('users', [
            'phone' => '01711998877',
            'name' => 'মোঃ আরিফ হোসেন',
        ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $factory = Factory::create([
            'code' => 'f1',
            'name' => 'রহমান নিটিং',
        ]);

        User::create([
            'name' => 'ম্যানেজার',
            'phone' => '01711000000',
            'email' => 'manager@test.com',
            'password' => Hash::make('password123'),
            'role' => 'fac',
            'factory_id' => $factory->id,
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'identifier' => '01711000000',
            'password' => 'password123',
            'role' => 'fac',
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'token',
                'user' => ['name', 'phone'],
            ],
        ]);
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        User::create([
            'name' => 'টেস্ট ইউজার',
            'phone' => '01711111111',
            'password' => Hash::make('password123'),
            'role' => 'fac',
            'is_active' => true,
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'identifier' => '01711111111',
            'password' => 'wrongpassword',
            'role' => 'fac',
        ]);

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
        ]);
    }

    public function test_authenticated_user_can_access_me_endpoint(): void
    {
        $user = User::create([
            'name' => 'আরিফ মালিক',
            'phone' => '01711222222',
            'password' => Hash::make('secret'),
            'role' => 'fac',
            'is_active' => true,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'data' => [
                'user' => [
                    'phone' => '01711222222',
                    'name' => 'আরিফ মালিক',
                ],
            ],
        ]);
    }
}
