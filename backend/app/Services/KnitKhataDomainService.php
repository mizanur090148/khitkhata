<?php

namespace App\Services;

use App\Models\Advertisement;
use App\Models\Bill;
use App\Models\DeliveryChallan;
use App\Models\FabricRoll;
use App\Models\Factory;
use App\Models\FactoryAttendance;
use App\Models\FactoryExpense;
use App\Models\FactoryMachine;
use App\Models\FreeMachineRequest;
use App\Models\JobListing;
use App\Models\MessageThread;
use App\Models\Partner;
use App\Models\Party;
use App\Models\ProductionLog;
use App\Models\QcInspection;
use App\Models\StoreIssueLog;
use App\Models\StoreItem;
use App\Models\SubcontractOrder;
use App\Models\SubcontractPost;
use App\Models\Supplier;
use App\Models\SupplierRfq;
use App\Models\User;

class KnitKhataDomainService
{
    /**
     * Build the complete synchronized state for Factory, Vendor, Supplier, Partner, and Public portals
     * directly from the relational MySQL database.
     */
    public function getBootstrapPayload(): array
    {
        $factories = Factory::orderBy('id')->get();
        $primaryFactory = $factories->firstWhere('code', 'f1') ?? $factories->first();

        $partyList = Party::where('factory_id', $primaryFactory?->id)
            ->orderBy('id', 'desc')
            ->get();

        $parties = $partyList
            ->keyBy('code')
            ->map(fn (Party $p) => [
                'id' => $p->id,
                'code' => $p->code,
                'name' => $p->name,
                'type' => $p->type,
                'addr' => $p->address ?? '—',
                'contact' => $p->contact_person ?? '—',
                'phone' => $p->phone ?? '—',
                'email' => $p->email ?? '',
                'bin' => $p->bin_tin ?? '',
                'rate' => (float) $p->default_rate_tk,
                'terms' => $p->payment_terms,
                'open' => (float) $p->opening_balance,
                'added' => $p->added_date ? $p->added_date->format('Y-m-d') : '2026-10-01',
                'on' => (bool) $p->is_active,
            ]);

        $machines = FactoryMachine::where('factory_id', $primaryFactory?->id)
            ->orderBy('id')
            ->get();

        $machineState = [];
        $freeSet = [];
        foreach ($machines as $m) {
            $machineState[$m->code] = $m->status;
            if ($m->knit_type === 'c' && !str_starts_with($m->status, 'run') && $m->status !== 'down') {
                $freeSet[$m->code] = [
                    'on' => (bool) $m->broadcast_free,
                    'from' => $m->free_from ? $m->free_from->format('Y-m-d') : '2026-10-05',
                ];
            }
        }

        $orders = SubcontractOrder::with(['lines', 'qcInspections', 'party'])
            ->where('factory_id', $primaryFactory?->id)
            ->orderBy('id')
            ->get()
            ->map(function (SubcontractOrder $o) {
                $lines = $o->lines->map(fn ($l) => [
                    'kt' => $l->knit_type,
                    'yd' => (bool) $l->is_yarn_dyed,
                    'unit' => $l->unit,
                    'place' => $l->placement,
                    'fab' => $l->fabrication,
                    'color' => $l->color ?? '—',
                    'qty' => (float) $l->qty,
                    'done' => (float) $l->done_qty,
                    'dl' => (float) $l->delivered_qty,
                    'ggsm' => $l->grey_gsm,
                    'fgsm' => $l->finish_gsm,
                    'sl' => $l->stitch_length,
                    'gdia' => $l->grey_dia,
                    'dia' => $l->dia_gauge,
                    'size' => $l->flat_size,
                    'pcw' => $l->piece_weight_gm,
                    'fdes' => $l->flat_design,
                    'machines' => $l->machines_json ?? [],
                    'yarns' => $l->yarns_json ?? [],
                ])->values()->all();

                $qc = $o->qcInspections->map(fn (QcInspection $q) => [
                    'id' => $q->qc_no,
                    'd' => $q->date_label,
                    'roll' => $q->roll_no,
                    'm' => $q->machine_code ?? '—',
                    'pl' => $q->placement_index,
                    'kg' => (float) $q->weight_kg,
                    'issue' => $q->issue_description,
                    'src' => $q->source,
                    'fac' => $q->factory_sign_json ?? ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
                    'ven' => $q->vendor_sign_json ?? ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
                    'act' => $q->action_taken ?? '',
                ])->values()->all();

                return [
                    'id' => $o->order_no,
                    'party' => $o->party?->name ?? $o->party_code,
                    'party_id' => $o->party_id,
                    'party_code' => $o->party_code,
                    'v' => $o->party_code,
                    'buyer' => $o->buyer,
                    'fabric' => $o->fabric_summary,
                    'gsm' => $o->gsm,
                    'finishGsm' => $o->finish_gsm,
                    'stitch' => $o->stitch_length,
                    'greyDia' => $o->grey_dia,
                    'dia' => $o->dia_gauge,
                    'color' => $o->color,
                    'yarn' => $o->yarn_summary,
                    'qty' => (float) $o->total_qty_kg,
                    'done' => (float) $o->done_kg,
                    'machines' => $o->machines_json ?? [],
                    'rate' => (float) $o->daily_rate_kg,
                    'start' => $o->start_label,
                    'status' => $o->status,
                    'rateTk' => (float) $o->rate_tk,
                    'orderDate' => $o->order_date ? $o->order_date->format('Y-m-d') : '2026-09-21',
                    'deliveryDue' => $o->delivery_due_date ? $o->delivery_due_date->format('Y-m-d') : null,
                    'completeDate' => $o->complete_date ? $o->complete_date->format('Y-m-d') : null,
                    'delivered' => (float) $o->delivered_kg,
                    'challans' => $o->challans_json ?? [],
                    'yarnIn' => $o->yarn_in_json ?? [],
                    'lines' => $lines,
                    'qc' => $qc,
                ];
            })->values()->all();

        $prodLog = ProductionLog::orderByDesc('id')->get()->map(fn (ProductionLog $p) => [
            'id' => $p->id,
            'd' => $p->date_label,
            'sh' => $p->shift,
            'm' => $p->machine_code,
            'o' => $p->order_no,
            'pl' => $p->placement_index,
            'op' => $p->operator_name,
            'kg' => (float) $p->qty_kg,
            'rolls' => $p->rolls_count,
            'lot' => $p->yarn_lot,
            'fault' => $p->fault_code,
        ])->values()->all();

        $rolls = FabricRoll::orderBy('id')->get()->map(fn (FabricRoll $r) => [
            'no' => $r->roll_no,
            'jc' => $r->jc_seq,
            'o' => $r->order_no,
            'pl' => $r->placement_index,
            'm' => $r->machine_code,
            'd' => $r->date_label,
            'sh' => $r->shift,
            'op' => $r->operator_name,
            'kg' => (float) $r->weight_kg,
            'lot' => $r->yarn_lot,
            'f' => $r->faults_json ?? [],
            'ch' => $r->challan_no,
        ])->values()->all();

        $challans = DeliveryChallan::orderByDesc('id')->get()->map(fn (DeliveryChallan $c) => [
            'no' => $c->challan_no,
            'f' => $c->factory_code,
            'v' => $c->party_code,
            'o' => $c->order_no,
            'd' => $c->date_label,
            'rolls' => $c->rolls_json ?? [],
            'veh' => $c->vehicle_no,
            'drv' => $c->driver_name ?? '—',
            'ph' => $c->driver_phone ?? '—',
            'fac' => $c->factory_sign_json,
            'ven' => $c->vendor_sign_json,
        ])->values()->all();

        $bills = Bill::orderBy('id')->get()->map(fn (Bill $b) => [
            'no' => $b->bill_no,
            'f' => $b->factory_code,
            'date' => $b->bill_date ? $b->bill_date->format('Y-m-d') : '2026-10-01',
            'v' => $b->party_code,
            'lines' => $b->lines_json ?? [],
            'jv' => $b->jv_no,
            'recv' => $b->payments_json ?? [],
        ])->values()->all();

        $storeItems = StoreItem::orderBy('id')->get()->map(fn (StoreItem $s) => [
            'id' => $s->item_code,
            'name' => $s->name,
            'cat' => $s->category,
            'unit' => $s->unit,
            'stock' => $s->stock_qty,
            'min' => $s->min_qty,
            'price' => (float) $s->unit_price,
            'rfq' => (bool) $s->rfq_sent,
        ])->values()->all();

        $storeIssueLogs = StoreIssueLog::orderByDesc('id')->get()->map(fn (StoreIssueLog $l) => [
            'd' => $l->date_label,
            'id' => $l->item_code,
            'm' => $l->machine_code,
            'q' => $l->qty,
            'by' => $l->issued_by,
        ])->values()->all();

        $users = User::orderBy('id')->get()->map(fn (User $u) => [
            'id' => $u->id,
            'n' => $u->name,
            'phone' => $u->phone,
            'email' => $u->email,
            'role_code' => $u->role,
            'r' => $u->designation ?? 'স্টাফ',
            'org' => $u->organization_name ?? 'রহমান নিটিং ইন্ডাস্ট্রিজ',
            'on' => (bool) $u->is_active,
            'owner' => (bool) $u->is_owner,
            'msg' => (bool) $u->can_message,
            'vendor' => (bool) $u->is_vendor_rep,
            'last' => $u->last_login_label ?? 'আজ, ১০:১২',
        ])->values()->all();

        $threads = MessageThread::orderBy('id')->get()->map(fn (MessageThread $t) => [
            'id' => $t->thread_code,
            'f' => $t->factory_code,
            'v' => $t->party_code,
            'o' => $t->order_no,
            'title' => $t->title,
            'unread' => $t->unread_count,
            'msgs' => $t->messages_json ?? [],
        ])->values()->all();

        $freeRequests = FreeMachineRequest::orderByDesc('id')->get()->map(fn (FreeMachineRequest $r) => [
            'id' => $r->request_no,
            'v' => $r->party_code,
            'who' => $r->contact_person,
            'fab' => $r->fabrication,
            'q' => (float) $r->qty_kg,
            'n' => $r->machines_needed,
            'spec' => $r->spec_label,
            'from' => $r->start_date ? $r->start_date->format('Y-m-d') : '2026-10-05',
            'msg' => $r->message ?? '',
            'st' => $r->status,
        ])->values()->all();

        $jobs = JobListing::orderByDesc('id')->get()->map(fn (JobListing $j) => [
            'id' => $j->id,
            'r' => $j->role_title,
            'c' => $j->company_name,
            'a' => $j->area,
            't' => $j->category,
            'sh' => $j->shift_label ?? 'শিফট A / B',
            'exp' => $j->experience_label ?? '১–৩ বছর',
            's' => $j->salary_label,
            'd' => $j->posted_label,
            'ph' => $j->contact_phone ?? '01711000000',
            'n' => (bool) $j->is_new,
            'vac' => $j->vacancies,
            'req' => $j->requirements_json ?? [],
        ])->values()->all();

        $suppliers = Supplier::orderBy('id')->get()->map(fn (Supplier $s) => [
            'id' => $s->id,
            'n' => $s->name,
            'c' => $s->category,
            'also' => $s->also_categories_json ?? [],
            'a' => $s->area,
            'r' => (float) $s->rating,
            'f' => $s->reviews_count,
            'g' => $s->description,
            'sp' => (bool) $s->is_sponsored,
        ])->values()->all();

        $supplierRfqs = SupplierRfq::orderByDesc('id')->get()->map(fn (SupplierRfq $r) => [
            'id' => $r->rfq_no,
            'f' => $r->factory_code,
            'item' => $r->item_name,
            'q' => $r->qty_label,
            'need' => $r->need_by_label,
            'st' => $r->status,
            'price' => $r->quoted_price,
            'days' => $r->delivery_days,
            'note' => $r->note ?? '',
        ])->values()->all();

        $subcontractPosts = SubcontractPost::with('quotations')->orderByDesc('id')->get();

        $expenses = FactoryExpense::where('factory_id', $primaryFactory?->id)->orderByDesc('expense_date')->get()->map(fn (FactoryExpense $e) => [
            'id' => $e->id,
            'cat' => $e->category,
            'title' => $e->title,
            'amt' => (float) $e->amount_tk,
            'method' => $e->payment_method,
            'ref' => $e->reference_no,
            'date' => $e->expense_date ? $e->expense_date->format('Y-m-d') : date('Y-m-d'),
            'by' => $e->created_by,
            'notes' => $e->notes,
        ])->values()->all();

        $attendances = FactoryAttendance::where('factory_id', $primaryFactory?->id)->orderByDesc('attendance_date')->get()->map(fn (FactoryAttendance $a) => [
            'id' => $a->id,
            'worker' => $a->worker_name,
            'role' => $a->role_type,
            'shift' => $a->shift,
            'status' => $a->status,
            'date' => $a->attendance_date ? $a->attendance_date->format('Y-m-d') : date('Y-m-d'),
            'in' => $a->in_time,
            'out' => $a->out_time,
            'ot' => (float) $a->overtime_hours,
            'wage' => (float) $a->daily_wage_tk,
            'note' => $a->note,
        ])->values()->all();

        $partner = Partner::first();

        return [
            'vendors' => $parties,
            'parties' => $parties->values()->all(),
            'machineState' => $machineState,
            'freeSet' => $freeSet,
            'freeRequests' => $freeRequests,
            'orders' => $orders,
            'prodLog' => $prodLog,
            'rolls' => $rolls,
            'challans' => $challans,
            'bills' => $bills,
            'store' => $storeItems,
            'issueLog' => $storeIssueLogs,
            'users' => $users,
            'threads' => $threads,
            'jobs' => $jobs,
            'suppliers' => $suppliers,
            'supplierRfqs' => $supplierRfqs,
            'subcontractPosts' => $subcontractPosts,
            'expenses' => $expenses,
            'attendances' => $attendances,
            'partner' => $partner ? [
                'code' => $partner->partner_code,
                'total_referrals' => $partner->total_referrals,
                'active_factories' => $partner->active_factories_count,
                'commission_earned' => (float) $partner->total_commission_tk,
                'withdrawn' => (float) $partner->withdrawn_commission_tk,
                'balance' => (float) $partner->balance_commission_tk,
                'payout_method' => $partner->payout_method,
                'payout_number' => $partner->payout_number,
            ] : null,
            'factories' => $factories->keyBy('code')->map(fn (Factory $f) => [
                'id' => $f->id,
                'code' => $f->code,
                'name' => $f->name,
                'area' => $f->area,
                'mc' => $f->total_machines,
                'upd' => $f->last_update_label,
                'yearlyOrders' => $f->yearly_orders_count,
                'ontimePct' => (float) $f->ontime_delivery_pct,
                'qcRejectPct' => (float) $f->qc_reject_pct,
            ]),
            'factory' => $primaryFactory ? [
                'id' => (string) $primaryFactory->id,
                'code' => $primaryFactory->code,
                'name' => $primaryFactory->name,
                'owner' => 'মালিক',
                'phone' => $primaryFactory->phone ?? '',
                'email' => 'info@silposetu.com',
                'address' => $primaryFactory->address ?? $primaryFactory->area ?? 'কোনাবাড়ি, গাজীপুর',
                'loc' => $primaryFactory->area ?? 'কোনাবাড়ি, গাজীপুর',
                'bin' => 'BIN-9920148',
                'plan' => $primaryFactory->plan_code ?? 'g',
                'machinesCount' => $primaryFactory->total_machines ?? 24,
                'verified' => true,
                'rating' => 4.9,
            ] : null,
        ];
    }
}

