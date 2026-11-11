<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BootstrapController;
use App\Http\Controllers\Api\V1\FactoryDashboardController;
use App\Http\Controllers\Api\V1\FactoryPortalController;
use App\Http\Controllers\Api\V1\PublicAndMarketplaceController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Health & Bootstrap State
    Route::get('/health', [BootstrapController::class, 'health']);
    Route::get('/bootstrap', [BootstrapController::class, 'index']);

    // Auth & Multi-Role Profile
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/send-otp', [AuthController::class, 'sendOtp']);
        Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    });

    // Factory & Vendor Portal Operations
    Route::prefix('portal')->group(function () {
        // Factory Dashboard Core & Actions
        Route::get('/dashboard', [FactoryDashboardController::class, 'index']);
        Route::post('/dashboard/quick-production', [FactoryDashboardController::class, 'quickProduction']);
        Route::post('/dashboard/toggle-machine', [FactoryDashboardController::class, 'toggleMachineStatus']);
        Route::post('/dashboard/broadcast-free', [FactoryDashboardController::class, 'broadcastFreeMachines']);
        Route::post('/dashboard/submit-quotation', [FactoryDashboardController::class, 'submitQuotation']);

        Route::get('/orders', [FactoryPortalController::class, 'getOrders']);
        Route::post('/orders', [FactoryPortalController::class, 'storeOrder']);
        Route::delete('/orders/{orderNo}', [FactoryPortalController::class, 'deleteOrder']);
        Route::delete('/orders', [FactoryPortalController::class, 'clearOrders']);
        Route::post('/orders/{orderNo}/toggle-machine', [FactoryPortalController::class, 'toggleOrderMachine']);
        Route::post('/production', [FactoryPortalController::class, 'storeProductionEntry']);
        Route::post('/production/shift', [FactoryPortalController::class, 'storeShiftProduction']);
        Route::post('/qc', [FactoryPortalController::class, 'storeQcInspection']);
        Route::post('/qc/{qcNo}/sign', [FactoryPortalController::class, 'signQcInspection']);
        Route::get('/rolls', [FactoryPortalController::class, 'getRolls']);
        Route::post('/jobcard/save', [FactoryPortalController::class, 'saveJobCard']);
        Route::post('/challans', [FactoryPortalController::class, 'storeChallan']);
        Route::post('/challans/{challanNo}/sign', [FactoryPortalController::class, 'signChallanReceipt']);
        Route::post('/yarn/receive', [FactoryPortalController::class, 'receiveYarn']);
        Route::post('/store/movement', [FactoryPortalController::class, 'storeStockMovement']);
        Route::get('/parties', [FactoryPortalController::class, 'getParties']);
        Route::post('/parties', [FactoryPortalController::class, 'storeParty']);
        Route::post('/parties/{id}/toggle', [FactoryPortalController::class, 'toggleParty']);
        Route::delete('/parties/{id}', [FactoryPortalController::class, 'deleteParty']);
        Route::post('/bills', [FactoryPortalController::class, 'storeBill']);
        Route::post('/bills/{billNo}/pay', [FactoryPortalController::class, 'recordBillPayment']);
        Route::post('/accounts/expenses', [FactoryPortalController::class, 'storeExpense']);
        Route::post('/attendance/punch', [FactoryPortalController::class, 'storeAttendance']);
        Route::post('/users', [FactoryPortalController::class, 'storeUser']);
        Route::post('/users/{id}/toggle', [FactoryPortalController::class, 'toggleUser']);
        Route::post('/partner/payout', [FactoryPortalController::class, 'requestPayout']);
        Route::post('/profile', [FactoryPortalController::class, 'updateFactoryProfile']);
        Route::post('/threads/{threadCode}/messages', [PublicAndMarketplaceController::class, 'sendMessage']);
    });

    // Public Jobs, Suppliers, RFQs, Ads & Subcontract Marketplace (shilposetu-old)
    Route::prefix('public')->group(function () {
        Route::get('/jobs', [PublicAndMarketplaceController::class, 'jobs']);
        Route::post('/jobs', [PublicAndMarketplaceController::class, 'storeJob']);
        Route::post('/jobs/{jobId}/apply', [PublicAndMarketplaceController::class, 'applyJob']);
        Route::post('/rfq', [PublicAndMarketplaceController::class, 'storeRfq']);
        Route::post('/rfq/{rfqNo}/quote', [PublicAndMarketplaceController::class, 'quoteRfq']);
        Route::post('/ads', [PublicAndMarketplaceController::class, 'storeAd']);
        Route::get('/subcontract/free-machines', [PublicAndMarketplaceController::class, 'subcontractMatches']);
        Route::post('/subcontract/posts', [PublicAndMarketplaceController::class, 'storeSubcontractPost']);
        Route::post('/subcontract/posts/{postId}/quotations', [PublicAndMarketplaceController::class, 'storeQuotation']);
    });
});

