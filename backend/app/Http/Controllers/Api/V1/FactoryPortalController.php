<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;

/**
 * Legacy FactoryPortalController proxy kept for backward compatibility.
 * All operations have been decomposed into dedicated domain controllers:
 * - OrderController
 * - ProductionController
 * - QcController
 * - FabricRollController
 * - JobCardController
 * - ChallanController
 * - YarnController
 * - StoreController
 * - AttendanceController
 * - PartyController
 * - BillController
 * - ExpenseController
 * - UserController
 * - PartnerController
 * - FactoryProfileController
 */
class FactoryPortalController extends Controller
{
    protected array $controllerMap = [
        'getOrders' => OrderController::class,
        'storeOrder' => OrderController::class,
        'toggleOrderMachine' => OrderController::class,
        'deleteOrder' => OrderController::class,
        'clearOrders' => OrderController::class,
        'storeProductionEntry' => ProductionController::class,
        'storeShiftProduction' => ProductionController::class,
        'getQcInspections' => QcController::class,
        'storeQcInspection' => QcController::class,
        'signQcInspection' => QcController::class,
        'updateQcAction' => QcController::class,
        'getRolls' => FabricRollController::class,
        'saveJobCard' => JobCardController::class,
        'getChallans' => ChallanController::class,
        'storeChallan' => ChallanController::class,
        'signChallanReceipt' => ChallanController::class,
        'receiveYarn' => YarnController::class,
        'storeStockMovement' => StoreController::class,
        'getStoreData' => StoreController::class,
        'getOperators' => AttendanceController::class,
        'getEmployees' => AttendanceController::class,
        'getAttendance' => AttendanceController::class,
        'storeAttendance' => AttendanceController::class,
        'getParties' => PartyController::class,
        'toggleParty' => PartyController::class,
        'deleteParty' => PartyController::class,
        'storeParty' => PartyController::class,
        'getBills' => BillController::class,
        'storeBill' => BillController::class,
        'recordBillPayment' => BillController::class,
        'getExpenses' => ExpenseController::class,
        'storeExpense' => ExpenseController::class,
        'storeUser' => UserController::class,
        'toggleUser' => UserController::class,
        'requestPayout' => PartnerController::class,
        'updateFactoryProfile' => FactoryProfileController::class,
    ];

    public function __call($method, $parameters)
    {
        if (isset($this->controllerMap[$method])) {
            return app($this->controllerMap[$method])->{$method}(...$parameters);
        }

        throw new \BadMethodCallException("Method {$method} does not exist on " . static::class);
    }
}
