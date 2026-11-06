<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRoleAccess
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'অনুগ্রহ করে লগইন করুন।',
            ], 401);
        }

        if (!empty($roles) && !in_array($user->role, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'এই রিসোর্সে আপনার প্রবেশের অনুমতি নেই।',
            ], 403);
        }

        return $next($request);
    }
}

