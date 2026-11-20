<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Factory;
use App\Models\Partner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PartnerController extends Controller
{
        public function requestPayout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount_tk' => ['required', 'numeric', 'min:500'],
            'payout_method' => ['required', 'string', 'in:bkash,nagad,rocket,bank'],
            'account_number' => ['required', 'string', 'max:30'],
        ]);

        $partner = Partner::first();
        if (!$partner) {
            $partner = Partner::create([
                'partner_code' => 'KNIT-P27',
                'total_referrals' => 8,
                'active_factories_count' => 6,
                'total_commission_tk' => 45000,
                'withdrawn_commission_tk' => 15000,
                'balance_commission_tk' => 30000,
                'payout_method' => $validated['payout_method'],
                'payout_number' => $validated['account_number'],
            ]);
        }

        $amt = (float) $validated['amount_tk'];
        if ($amt > $partner->balance_commission_tk) {
            return $this->error("উত্তোলনযোগ্য ব্যালেন্স মাত্র ৳{$partner->balance_commission_tk}", 422);
        }

        $partner->withdrawn_commission_tk += $amt;
        $partner->balance_commission_tk -= $amt;
        $partner->payout_method = $validated['payout_method'];
        $partner->payout_number = $validated['account_number'];
        $partner->save();

        return $this->success($partner, "৳{$amt} উত্তোলনের অনুরোধ সফলভাবে গ্রহণ করা হয়েছে।");
    }
}
