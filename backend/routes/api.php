<?php

use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BillController;
use App\Http\Controllers\Api\V1\BootstrapController;
use App\Http\Controllers\Api\V1\ChallanController;
use App\Http\Controllers\Api\V1\ExpenseController;
use App\Http\Controllers\Api\V1\FabricRollController;
use App\Http\Controllers\Api\V1\FactoryDashboardController;
use App\Http\Controllers\Api\V1\FactoryProfileController;
use App\Http\Controllers\Api\V1\JobCardController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\PartnerController;
use App\Http\Controllers\Api\V1\PartyController;
use App\Http\Controllers\Api\V1\ProductionController;
use App\Http\Controllers\Api\V1\PublicAndMarketplaceController;
use App\Http\Controllers\Api\V1\QcController;
use App\Http\Controllers\Api\V1\StoreController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\YarnController;
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

    // Factory & Vendor Portal Operations (Separated Domain Controllers)
    Route::prefix('portal')->group(function () {
        // Factory Dashboard Core & Actions
        Route::get('/dashboard', [FactoryDashboardController::class, 'index']);
        Route::post('/dashboard/quick-production', [FactoryDashboardController::class, 'quickProduction']);
        Route::post('/dashboard/toggle-machine', [FactoryDashboardController::class, 'toggleMachineStatus']);
        Route::post('/dashboard/broadcast-free', [FactoryDashboardController::class, 'broadcastFreeMachines']);
        Route::post('/dashboard/submit-quotation', [FactoryDashboardController::class, 'submitQuotation']);

        // Orders Management
        Route::get('/orders', [OrderController::class, 'getOrders']);
        Route::post('/orders', [OrderController::class, 'storeOrder']);
        Route::delete('/orders/{orderNo}', [OrderController::class, 'deleteOrder']);
        Route::delete('/orders', [OrderController::class, 'clearOrders']);
        Route::post('/orders/{orderNo}/toggle-machine', [OrderController::class, 'toggleOrderMachine']);

        // Production & Shift Tracking
        Route::post('/production', [ProductionController::class, 'storeProductionEntry']);
        Route::post('/production/shift', [ProductionController::class, 'storeShiftProduction']);

        // Quality Control (QC) & Defects
        Route::get('/qc', [QcController::class, 'getQcInspections']);
        Route::post('/qc', [QcController::class, 'storeQcInspection']);
        Route::post('/qc/{qcNo}/sign', [QcController::class, 'signQcInspection']);
        Route::post('/qc/{qcNo}/action', [QcController::class, 'updateQcAction']);

        // Fabric Rolls & Job Cards
        Route::get('/rolls', [FabricRollController::class, 'getRolls']);
        Route::post('/jobcard/save', [JobCardController::class, 'saveJobCard']);

        // Delivery Challans
        Route::get('/challans', [ChallanController::class, 'getChallans']);
        Route::post('/challans', [ChallanController::class, 'storeChallan']);
        Route::post('/challans/{challanNo}/sign', [ChallanController::class, 'signChallanReceipt']);

        // Yarn Inventory & Inward
        Route::post('/yarn/receive', [YarnController::class, 'receiveYarn']);
        Route::post('/yarn/request-return', [YarnController::class, 'requestReturn']);
        Route::post('/yarn/return-challan', [YarnController::class, 'createReturnChallan']);

        // Store & Spare Parts
        Route::get('/store', [StoreController::class, 'getStoreData']);
        Route::post('/store/movement', [StoreController::class, 'storeStockMovement']);
        Route::post('/store/item', [StoreController::class, 'storeNewItem']);

        // Parties (Vendors / Buyers / Mills)
        Route::get('/parties', [PartyController::class, 'getParties']);
        Route::post('/parties', [PartyController::class, 'storeParty']);
        Route::post('/parties/{id}/toggle', [PartyController::class, 'toggleParty']);
        Route::delete('/parties/{id}', [PartyController::class, 'deleteParty']);

        // Billing & Payments
        Route::get('/bills', [BillController::class, 'getBills']);
        Route::post('/bills', [BillController::class, 'storeBill']);
        Route::post('/bills/{billNo}/pay', [BillController::class, 'recordBillPayment']);

        // Accounts & Expenses
        Route::get('/accounts/expenses', [ExpenseController::class, 'getExpenses']);
        Route::post('/accounts/expenses', [ExpenseController::class, 'storeExpense']);

        // HR, Attendance & Operators
        Route::get('/operators', [AttendanceController::class, 'getOperators']);
        Route::get('/employees', [AttendanceController::class, 'getEmployees']);
        Route::get('/attendance', [AttendanceController::class, 'getAttendance']);
        Route::post('/attendance/punch', [AttendanceController::class, 'storeAttendance']);

        // Users & Permissions
        Route::post('/users', [UserController::class, 'storeUser']);
        Route::post('/users/{id}/toggle', [UserController::class, 'toggleUser']);

        // Partner Referral & Payout
        Route::post('/partner/payout', [PartnerController::class, 'requestPayout']);

        // Factory Profile
        Route::post('/profile', [FactoryProfileController::class, 'updateFactoryProfile']);

        // Communication
        Route::post('/threads/{threadCode}/messages', [PublicAndMarketplaceController::class, 'sendMessage']);
    });

    // Public Jobs, Suppliers, RFQs, Ads & Subcontract Marketplace
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
