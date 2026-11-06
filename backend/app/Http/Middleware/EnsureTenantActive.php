<?php

namespace App\Http\Middleware;

use App\Models\Factory;
use App\Services\SubscriptionService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantActive
{
    public function __construct(protected SubscriptionService $subscriptionService)
    {
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'অননুমোদিত অ্যাক্সেস। অনুগ্রহ করে লগইন করুন।',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Only enforce factory checks for users associated with a factory
        if ($user->factory_id) {
            $factory = Factory::find($user->factory_id);

            if (!$factory) {
                return response()->json([
                    'success' => false,
                    'message' => 'ফ্যাক্টরি প্রোফাইল পাওয়া যায়নি।',
                ], Response::HTTP_NOT_FOUND);
            }

            // Bind tenant factory into request for easy controller access
            $request->attributes->set('tenant_factory', $factory);
        }

        return $next($request);
    }
}

