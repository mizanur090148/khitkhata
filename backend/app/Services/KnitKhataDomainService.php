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
use App\Models\Employee;
use App\Models\MessageThread;
use App\Models\Operator;
use App\Models\Partner;
use App\Models\Party;
use App\Models\Production;
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

        $prodLog = Production::orderByDesc('id')->get()->map(fn (Production $p) => [
            'id' => $p->id,
            'user_id' => $p->user_id,
            'employee_id' => $p->employee_id,
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

        $operators = Employee::where('employee_type', 'operator')
            ->where('status', '!=', 'inactive')
            ->orderBy('name')
            ->get()
            ->map(fn (Employee $e) => [
                'id' => $e->id,
                'name' => $e->name,
                'id_no' => $e->id_no,
                'mobile' => $e->mobile,
                'address' => $e->address,
                'designation' => $e->designation,
                'shift' => $e->shift,
                'machine_assigned' => $e->machine_assigned,
                'daily_wage' => (float) $e->daily_wage,
                'status' => $e->status,
            ])->values()->all();

        $employees = Employee::orderBy('id')->get()->map(fn (Employee $e) => [
            'id' => $e->id,
            'factory_id' => $e->factory_id,
            'employee_type' => $e->employee_type,
            'id_no' => $e->id_no,
            'name' => $e->name,
            'mobile' => $e->mobile,
            'address' => $e->address,
            'designation' => $e->designation,
            'shift' => $e->shift,
            'machine_assigned' => $e->machine_assigned,
            'daily_wage' => (float) $e->daily_wage,
            'status' => $e->status,
        ])->values()->all();

        $partner = Partner::first();

        $prodByMachine = Production::orderByDesc('id')->get()->groupBy('machine_code');
        $assignedEmployees = Employee::where('factory_id', $primaryFactory?->id)
            ->whereNotNull('machine_assigned')
            ->pluck('name', 'machine_assigned')
            ->toArray();
        $allEmployees = Employee::where('factory_id', $primaryFactory?->id)->pluck('name')->toArray();
        $orderFabrics = SubcontractOrder::where('factory_id', $primaryFactory?->id)->pluck('fabric_summary', 'order_no')->toArray();

        $machineList = $machines->map(function ($m, $index) use ($prodByMachine, $assignedEmployees, $allEmployees, $orderFabrics) {
            $mcLogs = $prodByMachine->get($m->code);
            $st = strtolower($m->status ?? '');
            $normalizedStatus = str_starts_with($st, 'run') ? 'Running' : ($st === 'down' || $st === 'maint' ? 'Maint' : ($m->broadcast_free ? 'Free' : 'Idle'));
            $operator = $mcLogs?->last()?->operator_name ?? ($assignedEmployees[$m->code] ?? ($allEmployees[$index % max(1, count($allEmployees))] ?? 'অপারেটর'));
            $todayKg = (float) ($mcLogs ? $mcLogs->sum('qty_kg') : 0);
            $orderNo = $m->current_order_no;
            $fabric = $orderNo && isset($orderFabrics[$orderNo]) ? $orderFabrics[$orderNo] : ($m->supported_fabrics_json[0] ?? 'Single Jersey 160 GSM');

            return [
                'id' => $m->code,
                'code' => $m->code,
                'brand' => $m->brand ?: 'Pailung (Taiwan)',
                'type' => $m->knit_type === 'f' ? 'Flat Collar / Cuff' : ($m->gauge >= 24 ? 'Single Jersey' : 'Rib / Interlock'),
                'dia' => $m->dia ? "{$m->dia}\"" : '30"',
                'gg' => $m->gauge ? "{$m->gauge}G" : '24G',
                'feeders' => $m->feeders_count ?? 90,
                'rpm' => $m->rpm ?? 28,
                'status' => $normalizedStatus,
                'orderId' => $orderNo ?? '',
                'order_no' => $orderNo ?? '',
                'fabric' => $fabric,
                'operator' => $operator,
                'todayKg' => round($todayKg, 1),
                'today_kg' => round($todayKg, 1),
                'targetKg' => (float) ($m->daily_capacity_kg ?: 190),
                'target_kg' => (float) ($m->daily_capacity_kg ?: 190),
                'availFrom' => $m->free_from ? $m->free_from->format('d M Y') : 'আজ থেকে',
                'rateQuote' => (float) ($m->free_rate_tk ?: 24),
                'note' => $m->note ?? '',
                'broadcast_free' => (bool) $m->broadcast_free,
                'spec_label' => $m->spec_label ?: "{$m->dia}\" × {$m->gauge}G",
            ];
        })->values()->all();

        $yarns = [];
        $yarnIdx = 1;
        foreach ($orders as $o) {
            if (!empty($o['yarnIn'])) {
                foreach ($o['yarnIn'] as $y) {
                    $yarns[] = [
                        'id' => 'YRN-' . str_pad((string) $yarnIdx++, 4, '0', STR_PAD_LEFT),
                        'orderId' => $o['id'],
                        'lineIdx' => 0,
                        'date' => $y['d'] ?? $o['orderDate'],
                        'party' => $o['party'],
                        'count' => $y['count'] ?? '30/1 Combed Cotton',
                        'brand' => $y['spin'] ?? 'Square Spinners',
                        'lot' => $y['lot'] ?? 'LOT-26A',
                        'bags' => (int) ($y['bags'] ?? 40),
                        'rcvKg' => (float) ($y['kg'] ?? 1000),
                        'usedKg' => round((float) ($y['kg'] ?? 1000) * 0.7, 1),
                        'retKg' => 0,
                        'wastageKg' => round((float) ($y['kg'] ?? 1000) * 0.02, 1),
                        'Factory' => $primaryFactory?->name,
                    ];
                }
            }
        }

        $qcLogs = QcInspection::with('order')->orderByDesc('id')->get()->map(function (QcInspection $q) {
            return [
                'id' => $q->qc_no,
                'date' => $q->date_label,
                'rollId' => $q->roll_no,
                'orderId' => $q->order?->order_no ?? 'SC-2610-014',
                'fabric' => $q->order?->fabric_summary ?? 'Single Jersey 160 GSM',
                'dia' => $q->order?->dia_gauge ?? '30" × 24G',
                'reqGsm' => 160,
                'actGsm' => 162,
                'reqDia' => 30,
                'actDia' => 30,
                'weightKg' => (float) $q->weight_kg,
                'lengthYds' => round((float) $q->weight_kg * 3.2, 1),
                'defects' => [
                    ['name' => $q->issue_description, 'pts' => 2],
                ],
                'totalPts' => 2,
                'ptsPer100' => 4,
                'grade' => 'A (Pass)',
                'status' => 'Pass',
                'inspector' => $q->factory_sign_json['by'] ?? 'QC Inspector',
                'issue' => $q->issue_description,
                'src' => $q->source,
                'action_taken' => $q->action_taken,
                'fac' => $q->factory_sign_json,
                'ven' => $q->vendor_sign_json,
            ];
        })->values()->all();

        $attendanceList = collect($attendances)->map(function ($a) {
            return [
                'id' => (string) $a['id'],
                'name' => $a['worker'],
                'role' => $a['role'],
                'shift' => $a['shift'],
                'machine' => 'M-01',
                'presentDays' => 24,
                'otHours' => (float) $a['ot'],
                'prodBonusKg' => 50,
                'dailyWage' => (float) $a['wage'],
                'todayStatus' => $a['status'] === 'present' ? 'Present' : ($a['status'] === 'late' ? 'Late' : 'Absent'),
            ];
        })->values()->all();

        $freeOffers = collect($freeRequests)->map(function ($r) {
            return [
                'id' => $r['id'],
                'party' => $r['v'],
                'contact' => $r['who'],
                'phone' => '01711-000000',
                'machineId' => 'M-01',
                'type' => 'Circular',
                'diaGg' => $r['spec'],
                'reqKg' => (float) $r['q'],
                'offerRate' => 24,
                'startDate' => $r['from'],
                'yarnSpec' => $r['fab'],
                'status' => 'New',
                'time' => 'আজ, ১০:১৫',
            ];
        })->values()->all();

        $rfqs = collect($supplierRfqs)->map(function ($r) {
            return [
                'id' => $r['id'],
                'factory' => $r['f'],
                'item' => $r['item'],
                'qty' => $r['q'],
                'needBy' => $r['need'],
                'status' => $r['st'],
                'price' => $r['price'],
                'days' => $r['days'],
                'note' => $r['note'],
            ];
        })->values()->all();

        $vouchers = [];
        $vIdx = 1;
        foreach ($expenses as $e) {
            $vouchers[] = [
                'id' => 'VCH-' . str_pad((string) $vIdx++, 4, '0', STR_PAD_LEFT),
                'date' => $e['date'],
                'party' => $e['title'],
                'type' => 'Expense',
                'method' => $e['method'],
                'ref' => $e['ref'] ?: 'EXP-' . $e['id'],
                'narration' => $e['notes'] ?: $e['title'],
                'debit' => (float) $e['amt'],
                'credit' => 0,
            ];
        }
        foreach ($bills as $b) {
            foreach ($b['recv'] as $r) {
                $vouchers[] = [
                    'id' => 'VCH-' . str_pad((string) $vIdx++, 4, '0', STR_PAD_LEFT),
                    'date' => $r['d'] ?? date('Y-m-d'),
                    'party' => $b['v'],
                    'type' => 'Receipt',
                    'method' => $r['mode'] ?? 'Bank Transfer',
                    'ref' => $r['rv'] ?? ('RV-' . $b['no']),
                    'narration' => 'Payment against bill ' . $b['no'],
                    'debit' => 0,
                    'credit' => (float) ($r['amt'] ?? 0),
                ];
            }
        }

        $subcontractPostsData = $subcontractPosts->map(function ($p) {
            return [
                'id' => $p->id,
                'title' => $p->title,
                'post_type' => $p->post_type,
                'order_no' => $p->order_no,
                'buyer' => $p->buyer,
                'fabric_type' => $p->fabric_type,
                'dia_gauge' => $p->dia_gauge,
                'gsm' => $p->gsm,
                'total_qty_kg' => (float) $p->total_qty_kg,
                'target_rate_tk' => (float) $p->target_rate_tk,
                'delivery_date' => $p->delivery_date ? $p->delivery_date->format('Y-m-d') : null,
                'location' => $p->location,
                'status' => $p->status,
                'quotations_count' => $p->quotations->count(),
                'quotations' => $p->quotations,
            ];
        })->values()->all();

        return [
            'vendors' => $parties,
            'parties' => $parties->values()->all(),
            'operators' => $operators,
            'employees' => $employees,
            'machines' => $machineList,
            'machineState' => $machineState,
            'freeSet' => $freeSet,
            'freeRequests' => $freeRequests,
            'freeOffers' => $freeOffers,
            'orders' => $orders,
            'yarns' => $yarns,
            'qcLogs' => $qcLogs,
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
            'rfqs' => $rfqs,
            'subcontractPosts' => $subcontractPostsData,
            'subcontract_posts' => $subcontractPostsData,
            'expenses' => $expenses,
            'attendances' => $attendances,
            'attendance' => $attendanceList,
            'vouchers' => $vouchers,
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

