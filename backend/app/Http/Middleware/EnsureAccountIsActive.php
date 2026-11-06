<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'আপনার অ্যাকাউন্টটি বর্তমানে নিষ্ক্রিয় রয়েছে। কর্তৃপক্ষের সাথে যোগাযোগ করুন।',
            ], 403);
        }

        return $next($request);
    }
}

