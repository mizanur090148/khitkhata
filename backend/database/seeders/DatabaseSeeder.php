<?php

namespace Database\Seeders;

use App\Models\Bill;
use App\Models\DeliveryChallan;
use App\Models\FabricRoll;
use App\Models\Factory;
use App\Models\FactoryMachine;
use App\Models\FreeMachineRequest;
use App\Models\JobListing;
use App\Models\MessageThread;
use App\Models\OrderLine;
use App\Models\Party;
use App\Models\ProductionLog;
use App\Models\QcInspection;
use App\Models\Quotation;
use App\Models\StoreIssueLog;
use App\Models\StoreItem;
use App\Models\SubcontractOrder;
use App\Models\SubcontractPost;
use App\Models\Supplier;
use App\Models\SupplierRfq;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed 8 Knitting Factories
        $factoriesData = [
            ['code' => 'f1', 'name' => 'রহমান নিটিং ইন্ডাস্ট্রিজ', 'area' => 'কোনাবাড়ি, গাজীপুর', 'mc' => 24, 'upd' => 'আজ ২:০০', 'yr' => 14, 'ot' => 93, 'rj' => 0.6],
            ['code' => 'f2', 'name' => 'সোনালী নিট ফ্যাব্রিক্স', 'area' => 'আশুলিয়া, সাভার', 'mc' => 32, 'upd' => 'আজ ১:৪০', 'yr' => 22, 'ot' => 88, 'rj' => 0.9],
            ['code' => 'f3', 'name' => 'মদিনা নিটিং', 'area' => 'ফতুল্লা, নারায়ণগঞ্জ', 'mc' => 18, 'upd' => 'আজ ১২:১৫', 'yr' => 9, 'ot' => 71, 'rj' => 1.8],
            ['code' => 'f4', 'name' => 'তাসনিম নিটওয়্যার', 'area' => 'বোর্ডবাজার, গাজীপুর', 'mc' => 20, 'upd' => 'আজ ২:১০', 'yr' => 17, 'ot' => 95, 'rj' => 0.4],
            ['code' => 'f5', 'name' => 'এভারগ্রিন সার্কুলার নিট', 'area' => 'হেমায়েতপুর, সাভার', 'mc' => 28, 'upd' => 'আজ ১:৩০', 'yr' => 19, 'ot' => 90, 'rj' => 0.7],
            ['code' => 'f6', 'name' => 'নূর নিটিং মিলস', 'area' => 'টঙ্গী, গাজীপুর', 'mc' => 16, 'upd' => 'গতকাল ১০:০০', 'yr' => 8, 'ot' => 64, 'rj' => 1.2],
            ['code' => 'f7', 'name' => 'আল-আমিন নিট', 'area' => 'কাশিমপুর, গাজীপুর', 'mc' => 22, 'upd' => 'আজ ১১:৫০', 'yr' => 11, 'ot' => 86, 'rj' => 0.8],
            ['code' => 'f8', 'name' => 'সিটি নিট কনসার্ন', 'area' => 'কাঁচপুর, নারায়ণগঞ্জ', 'mc' => 14, 'upd' => 'আজ ১:০৫', 'yr' => 5, 'ot' => 100, 'rj' => 0.5],
        ];

        $f1 = null;
        foreach ($factoriesData as $fd) {
            $fac = Factory::create([
                'code' => $fd['code'],
                'name' => $fd['name'],
                'area' => $fd['area'],
                'address' => 'প্লট ১৪, ' . $fd['area'],
                'phone' => '01711000001',
                'total_machines' => $fd['mc'],
                'plan_code' => 'g',
                'billing_cycle' => 'm',
                'qr_sticker_enabled' => true,
                'last_update_label' => $fd['upd'],
                'yearly_orders_count' => $fd['yr'],
                'ontime_delivery_pct' => $fd['ot'],
                'qc_reject_pct' => $fd['rj'],
            ]);
            if ($fd['code'] === 'f1') {
                $f1 = $fac;
            }
        }

        // 2. Seed Users (Factory Team, Vendor Reps, Supplier, Partner)
        $usersData = [
            ['n' => 'আরিফ হোসেন', 'ph' => '01711000000', 'em' => 'rahmanknit@gmail.com', 'role' => 'fac', 'r' => 'মালিক (অ্যাডমিন)', 'org' => 'রহমান নিটিং ইন্ডাস্ট্রিজ', 'on' => true, 'owner' => true, 'msg' => true, 'ven' => false, 'last' => 'এখন'],
            ['n' => 'শফিকুল ইসলাম', 'ph' => '01711000002', 'em' => 'shafiq@rahmanknit.com', 'role' => 'fac', 'r' => 'প্রোডাকশন ম্যানেজার', 'org' => 'রহমান নিটিং ইন্ডাস্ট্রিজ', 'on' => true, 'owner' => false, 'msg' => true, 'ven' => false, 'last' => 'আজ, ২:১৫'],
            ['n' => 'রুবেল মিয়া', 'ph' => '01711000003', 'em' => 'rubel@rahmanknit.com', 'role' => 'fac', 'r' => 'QC ইনচার্জ', 'org' => 'রহমান নিটিং ইন্ডাস্ট্রিজ', 'on' => true, 'owner' => false, 'msg' => true, 'ven' => false, 'last' => 'আজ, ১:৪০'],
            ['n' => 'মাহমুদুল হাসান', 'ph' => '01711000004', 'em' => 'mahmud@rahmanknit.com', 'role' => 'fac', 'r' => 'ফ্লোর সুপারভাইজার (শিফট A)', 'org' => 'রহমান নিটিং ইন্ডাস্ট্রিজ', 'on' => true, 'owner' => false, 'msg' => false, 'ven' => false, 'last' => 'আজ, ২:০৫'],
            ['n' => 'তানভীর আহমেদ', 'ph' => '01711000005', 'em' => 'tanvir@rahmanknit.com', 'role' => 'fac', 'r' => 'হিসাবরক্ষক', 'org' => 'রহমান নিটিং ইন্ডাস্ট্রিজ', 'on' => true, 'owner' => false, 'msg' => false, 'ven' => false, 'last' => 'আজ, ১১:৩০'],
            ['n' => 'মো. কামরুল হাসান', 'ph' => '01913000000', 'em' => 'kamrul@abcknit.com', 'role' => 'ven', 'r' => 'ভেন্ডর প্রতিনিধি', 'org' => 'ABC Knit Composite', 'on' => true, 'owner' => false, 'msg' => true, 'ven' => true, 'last' => 'আজ, ১০:১২'],
            ['n' => 'আসিফ ইকবাল (সাবেক)', 'ph' => '01913000099', 'em' => 'asif@abcknit.com', 'role' => 'ven', 'r' => 'ভেন্ডর প্রতিনিধি', 'org' => 'ABC Knit Composite', 'on' => false, 'owner' => false, 'msg' => false, 'ven' => true, 'last' => '১৮ দিন আগে'],
            ['n' => 'শারমিন আক্তার', 'ph' => '01811000011', 'em' => 'sharmin@xyzfashion.com', 'role' => 'ven', 'r' => 'ভেন্ডর প্রতিনিধি', 'org' => 'XYZ Fashion Ltd', 'on' => true, 'owner' => false, 'msg' => true, 'ven' => true, 'last' => 'গতকাল, ৬:৪০'],
            ['n' => 'রাশেদুল ইসলাম', 'ph' => '01611000022', 'em' => 'rashed@nobodoy.com', 'role' => 'ven', 'r' => 'ভেন্ডর প্রতিনিধি', 'org' => 'নবোদয় টেক্সটাইল', 'on' => true, 'owner' => false, 'msg' => true, 'ven' => true, 'last' => '৩ দিন আগে'],
            ['n' => 'মো. রাকিব হাসান', 'ph' => '01615000000', 'em' => 'rakib@knitparts.com', 'role' => 'sup', 'r' => 'বিক্রয় ব্যবস্থাপক', 'org' => 'নিটপার্টস ট্রেডিং', 'on' => true, 'owner' => true, 'msg' => true, 'ven' => false, 'last' => 'এখন'],
            ['n' => 'মো. সাইফুল ইসলাম', 'ph' => '01819000000', 'em' => 'saiful.partner@gmail.com', 'role' => 'par', 'r' => 'প্রতিষ্ঠাতা পার্টনার', 'org' => 'নিটখাতা পার্টনার #২৭', 'on' => true, 'owner' => true, 'msg' => true, 'ven' => false, 'last' => 'এখন'],
        ];

        foreach ($usersData as $ud) {
            User::create([
                'name' => $ud['n'],
                'phone' => $ud['ph'],
                'email' => $ud['em'],
                'password' => Hash::make('demo1234'),
                'role' => $ud['role'],
                'designation' => $ud['r'],
                'organization_name' => $ud['org'],
                'factory_id' => $f1->id,
                'is_owner' => $ud['owner'],
                'is_vendor_rep' => $ud['ven'],
                'can_message' => $ud['msg'],
                'is_active' => $ud['on'],
                'last_login_label' => $ud['last'],
            ]);
        }

        // 3. Seed Parties (Vendors & Suppliers)
        $partiesData = [
            ['code' => 'abc', 'name' => 'ABC Knit Composite', 'type' => 'ven', 'addr' => 'জামগড়া, আশুলিয়া, সাভার (নমুনা)', 'contact' => 'মো. কামরুল হাসান · মার্চেন্ডাইজার', 'phone' => '+8801711-000111', 'rate' => 14, 'terms' => 'বিলের ৩০ দিনের মধ্যে', 'open' => 0, 'added' => '2026-06-10', 'on' => true],
            ['code' => 'xyz', 'name' => 'XYZ Fashion Ltd', 'type' => 'ven', 'addr' => 'বিসিক, ফতুল্লা, নারায়ণগঞ্জ (নমুনা)', 'contact' => 'শারমিন আক্তার · সিনিয়র মার্চেন্ডাইজার', 'phone' => '+8801811-000222', 'rate' => 15, 'terms' => 'বিলের ৪৫ দিনের মধ্যে', 'open' => 0, 'added' => '2026-07-02', 'on' => true],
            ['code' => 'nobo', 'name' => 'নবোদয় টেক্সটাইল', 'type' => 'ven', 'addr' => 'কোনাবাড়ি, গাজীপুর (নমুনা)', 'contact' => 'রাশেদুল ইসলাম · প্ল্যানিং', 'phone' => '+8801911-000333', 'rate' => 14.5, 'terms' => 'বিলের ৩০ দিনের মধ্যে', 'open' => 38000, 'added' => '2026-08-19', 'on' => true],
            ['code' => 'sup1', 'name' => 'নিডল ও স্পেয়ার সাপ্লায়ার', 'type' => 'sup', 'addr' => 'মিরপুর-১০, ঢাকা (নমুনা)', 'contact' => 'হাবিবুর রহমান', 'phone' => '+8801611-000444', 'rate' => 0, 'terms' => 'নগদ / ১৫ দিন', 'open' => 46000, 'added' => '2026-06-01', 'on' => true],
            ['code' => 'sup2', 'name' => 'পরিবহন কন্ট্রাক্টর (জাকির)', 'type' => 'sup', 'addr' => 'কাশিমপুর, গাজীপুর', 'contact' => 'মো. জাকির হোসেন', 'phone' => '+8801511-000555', 'rate' => 0, 'terms' => 'সাপ্তাহিক', 'open' => 12000, 'added' => '2026-06-01', 'on' => true],
        ];

        foreach ($partiesData as $pd) {
            Party::create([
                'factory_id' => $f1->id,
                'code' => $pd['code'],
                'name' => $pd['name'],
                'type' => $pd['type'],
                'address' => $pd['addr'],
                'contact_person' => $pd['contact'],
                'phone' => $pd['phone'],
                'default_rate_tk' => $pd['rate'],
                'payment_terms' => $pd['terms'],
                'opening_balance' => $pd['open'],
                'added_date' => $pd['added'],
                'is_active' => $pd['on'],
            ]);
        }

        // 4. Seed 24 Circular + 6 Flat Knitting Machines for Factory f1
        $machineStates = [
            'M-01' => 'idle', 'M-02' => 'idle', 'M-03' => 'run:SC-2610-014', 'M-04' => 'run:SC-2610-014',
            'M-05' => 'wait', 'M-06' => 'wait', 'M-07' => 'run:SC-2610-014', 'M-08' => 'run:SC-2610-014',
            'M-09' => 'idle', 'M-10' => 'down', 'M-11' => 'idle', 'M-12' => 'run:SC-2609-011',
            'M-13' => 'run:SC-2609-011', 'M-14' => 'run:SC-2610-019', 'M-15' => 'run:SC-2610-019',
            'M-16' => 'run:SC-2610-016', 'M-17' => 'run:SC-2610-016', 'M-18' => 'run:SC-2610-016',
            'M-19' => 'run:SC-2610-019', 'M-20' => 'run:SC-2610-020', 'M-21' => 'run:SC-2610-015',
            'M-22' => 'run:SC-2610-015', 'M-23' => 'run:SC-2610-015', 'M-24' => 'run:SC-2610-015',
            'F-01' => 'run:SC-2610-020', 'F-02' => 'run:SC-2610-020', 'F-03' => 'run:SC-2610-020',
            'F-04' => 'run:SC-2610-016', 'F-05' => 'run:SC-2610-016', 'F-06' => 'idle',
        ];
        $freeSetMap = [
            'M-01' => ['on' => true, 'from' => '2026-10-05'],
            'M-02' => ['on' => true, 'from' => '2026-10-05'],
            'M-05' => ['on' => true, 'from' => '2026-10-04'],
            'M-06' => ['on' => false, 'from' => '2026-10-04'],
            'M-09' => ['on' => false, 'from' => '2026-10-06'],
            'M-11' => ['on' => true, 'from' => '2026-10-03'],
        ];

        foreach ($machineStates as $code => $status) {
            $isFlat = str_starts_with($code, 'F-');
            $num = (int) substr($code, 2);
            $dia = $isFlat ? null : ($num <= 9 ? 30 : ($num <= 14 ? 34 : ($num <= 20 ? 30 : 32)));
            $gauge = $isFlat ? 14 : ($num <= 9 ? 24 : ($num <= 14 ? 18 : ($num <= 20 ? 28 : 20)));
            $spec = $isFlat ? "ফ্ল্যাট · {$gauge}G" : "{$dia}\" × {$gauge}G";
            $fs = $freeSetMap[$code] ?? ['on' => false, 'from' => '2026-10-03'];

            FactoryMachine::create([
                'factory_id' => $f1->id,
                'code' => $code,
                'knit_type' => $isFlat ? 'f' : 'c',
                'dia' => $dia,
                'gauge' => $gauge,
                'spec_label' => $spec,
                'brand' => 'Pailung',
                'status' => $status,
                'current_order_no' => str_starts_with($status, 'run:') ? substr($status, 4) : null,
                'broadcast_free' => $fs['on'],
                'free_from' => $fs['from'],
                'daily_capacity_kg' => $isFlat ? 80 : 190,
                'rate_label' => '৳১৩–১৫ / kg',
                'supported_fabrics_json' => ['Single Jersey', '1×1 Rib', 'Fleece'],
            ]);
        }

        // Free Machine Requests
        FreeMachineRequest::create([
            'request_no' => 'RQ-07',
            'factory_id' => $f1->id,
            'party_code' => 'xyz',
            'contact_person' => 'শারমিন আক্তার',
            'fabrication' => 'Single Jersey',
            'qty_kg' => 3000,
            'machines_needed' => 2,
            'spec_label' => '30" × 24G',
            'start_date' => '2026-10-05',
            'message' => 'সুতা ৪ তারিখে পাঠাব, GSM 160',
            'status' => 'new',
        ]);
        FreeMachineRequest::create([
            'request_no' => 'RQ-06',
            'factory_id' => $f1->id,
            'party_code' => 'nobo',
            'contact_person' => 'রাশেদুল ইসলাম',
            'fabrication' => '1×1 Rib',
            'qty_kg' => 1200,
            'machines_needed' => 1,
            'spec_label' => '34" × 18G',
            'start_date' => '2026-10-04',
            'message' => 'জরুরি, বায়ারের ডেট ১২ তারিখ',
            'status' => 'new',
        ]);

        // 5. Seed Subcontract Orders & Multi-placement Lines
        $ordersData = [
            [
                'id' => 'SC-2610-014', 'v' => 'abc', 'buyer' => 'H&M', 'fabric' => 'Single Jersey + 1×1 Rib Lycra', 'gsm' => '160 GSM', 'dia' => '30" × 24G', 'color' => 'Navy Blue', 'yarn' => '30/1 Combed Cotton',
                'qty' => 12000, 'done' => 7420, 'machines' => ['M-03', 'M-04', 'M-07', 'M-08'], 'rate' => 380, 'start' => '21 Sep', 'status' => 'run', 'rateTk' => 14,
                'orderDate' => '2026-09-19', 'deliveryDue' => '2026-10-12', 'completeDate' => null, 'delivered' => 4200, 'challans' => ['DC-0872'],
                'yarnIn' => [
                    ['count' => '30/1 Combed Cotton', 'spinner' => 'Square Yarns', 'lot' => 'SQ-88412', 'bags' => 120, 'kg' => 5443],
                    ['count' => '30/1 Combed Cotton', 'spinner' => 'Square Yarns', 'lot' => 'SQ-88419', 'bags' => 150, 'kg' => 6804],
                    ['count' => '20D Spandex', 'spinner' => 'Hyosung', 'lot' => 'HY-2207', 'bags' => 6, 'kg' => 130],
                ],
                'lines' => [
                    ['place' => 'Body', 'fab' => 'Single Jersey', 'color' => 'Navy Blue', 'qty' => 10000, 'done' => 6500, 'dl' => 3800, 'ggsm' => '150', 'fgsm' => '160', 'sl' => '2.85 mm', 'gdia' => '68"', 'dia' => '30" × 24G', 'machines' => ['M-03', 'M-04', 'M-07'], 'yarns' => [['role' => 'বডি সুতা', 'count' => '30/1 Combed Cotton', 'brand' => 'Square Yarns', 'lot' => 'SQ-88419', 'pct' => 100]]],
                    ['place' => 'Neck Rib', 'fab' => '1×1 Rib Lycra', 'color' => 'Navy Blue', 'qty' => 2000, 'done' => 920, 'dl' => 400, 'ggsm' => '200', 'fgsm' => '220', 'sl' => '2.60 mm', 'gdia' => '62"', 'dia' => '34" × 18G', 'machines' => ['M-08'], 'yarns' => [['role' => 'বডি সুতা', 'count' => '30/1 Combed Cotton', 'brand' => 'Square Yarns', 'lot' => 'SQ-88419', 'pct' => 95], ['role' => 'লাইক্রা (Spandex)', 'count' => '20D Spandex', 'brand' => 'Hyosung', 'lot' => 'HY-2207', 'pct' => 5]]],
                ],
            ],
            [
                'id' => 'SC-2609-011', 'v' => 'abc', 'buyer' => 'Primark', 'fabric' => '1×1 Rib', 'gsm' => '220 GSM', 'dia' => '34" × 18G', 'color' => 'Heather Grey', 'yarn' => '26/1 CVC 60/40',
                'qty' => 6000, 'done' => 5810, 'machines' => ['M-12', 'M-13'], 'rate' => 310, 'start' => '14 Sep', 'status' => 'run', 'rateTk' => 16,
                'orderDate' => '2026-09-12', 'deliveryDue' => '2026-10-06', 'completeDate' => null, 'delivered' => 4000, 'challans' => ['DC-0861'],
                'yarnIn' => [['count' => '26/1 CVC 60/40', 'spinner' => 'Akij Yarn', 'lot' => 'AK-5521', 'bags' => 135, 'kg' => 6124]],
                'lines' => [
                    ['place' => 'Body', 'fab' => '1×1 Rib', 'color' => 'Heather Grey', 'qty' => 6000, 'done' => 5810, 'dl' => 4000, 'ggsm' => '210', 'fgsm' => '220', 'sl' => '2.70 mm', 'gdia' => '66"', 'dia' => '34" × 18G', 'machines' => ['M-12', 'M-13'], 'yarns' => [['role' => 'বডি সুতা', 'count' => '26/1 CVC 60/40', 'brand' => 'Akij Yarn', 'lot' => 'AK-5521', 'pct' => 100]]],
                ],
            ],
            [
                'id' => 'SC-2610-019', 'v' => 'abc', 'buyer' => 'H&M', 'fabric' => 'Fleece (3-Thread) + 2×1 Rib Lycra', 'gsm' => '280 GSM', 'dia' => '32" × 20G', 'color' => 'Black', 'yarn' => '30/1 + 20/1 Poly + 150D',
                'qty' => 18000, 'done' => 3200, 'machines' => ['M-14', 'M-15', 'M-19'], 'rate' => 420, 'start' => '29 Sep', 'status' => 'run', 'rateTk' => 17,
                'orderDate' => '2026-09-27', 'deliveryDue' => '2026-10-20', 'completeDate' => null, 'delivered' => 0, 'challans' => [],
                'yarnIn' => [
                    ['count' => '30/1 Carded Cotton', 'spinner' => 'Square Yarns', 'lot' => 'SQ-88470', 'bags' => 220, 'kg' => 9979],
                    ['count' => '20/1 Polyester', 'spinner' => 'Matin Spinning', 'lot' => 'MS-1102', 'bags' => 60, 'kg' => 2722],
                    ['count' => '150D Polyester', 'spinner' => 'Matin Spinning', 'lot' => 'MS-1108', 'bags' => 110, 'kg' => 4990],
                ],
                'lines' => [
                    ['place' => 'Body', 'fab' => 'Fleece (3-Thread)', 'color' => 'Black', 'qty' => 14000, 'done' => 2600, 'dl' => 1200, 'ggsm' => '265', 'fgsm' => '280', 'sl' => '3.10 mm', 'gdia' => '72"', 'dia' => '32" × 20G', 'machines' => ['M-14', 'M-15'], 'yarns' => [['role' => 'Face', 'count' => '30/1 Carded Cotton', 'brand' => 'Square Yarns', 'lot' => 'SQ-88470', 'pct' => 45], ['role' => 'Binder / Tie', 'count' => '20/1 Polyester', 'brand' => 'Matin Spinning', 'lot' => 'MS-1102', 'pct' => 10], ['role' => 'Loop (Back)', 'count' => '150D Polyester', 'brand' => 'Matin Spinning', 'lot' => 'MS-1108', 'pct' => 45]]],
                    ['place' => 'Hood', 'fab' => 'Fleece (3-Thread)', 'color' => 'Black', 'qty' => 2500, 'done' => 600, 'dl' => 0, 'ggsm' => '265', 'fgsm' => '280', 'sl' => '3.10 mm', 'gdia' => '72"', 'dia' => '32" × 20G', 'machines' => ['M-19'], 'yarns' => [['role' => 'Face', 'count' => '30/1 Carded Cotton', 'brand' => 'Square Yarns', 'lot' => 'SQ-88470', 'pct' => 45], ['role' => 'Binder / Tie', 'count' => '20/1 Polyester', 'brand' => 'Matin Spinning', 'lot' => 'MS-1102', 'pct' => 10], ['role' => 'Loop (Back)', 'count' => '150D Polyester', 'brand' => 'Matin Spinning', 'lot' => 'MS-1108', 'pct' => 45]]],
                    ['place' => 'Cuff', 'fab' => '2×1 Rib Lycra', 'color' => 'Black', 'qty' => 1500, 'done' => 0, 'dl' => 0, 'ggsm' => '240', 'fgsm' => '260', 'sl' => '2.55 mm', 'gdia' => '60"', 'dia' => '30" × 18G', 'machines' => [], 'yarns' => [['role' => 'বডি সুতা', 'count' => '30/1 Carded Cotton', 'brand' => 'Square Yarns', 'lot' => 'SQ-88470', 'pct' => 95], ['role' => 'লাইক্রা (Spandex)', 'count' => '20D Spandex', 'brand' => 'Hyosung', 'lot' => 'HY-2207', 'pct' => 5]]],
                ],
            ],
            [
                'id' => 'SC-2610-020', 'v' => 'abc', 'buyer' => 'H&M', 'fabric' => 'Y/D Stripe Single Jersey + কলার-কাফ', 'gsm' => '180 GSM', 'dia' => '30" × 24G + ফ্ল্যাট 14G', 'color' => 'Navy + White স্ট্রাইপ', 'yarn' => '30/1 Y/D Combed Cotton',
                'qty' => 3000, 'done' => 1200, 'machines' => ['M-20', 'F-01', 'F-02', 'F-03'], 'rate' => 280, 'start' => '30 Sep', 'status' => 'run', 'rateTk' => 19,
                'orderDate' => '2026-09-28', 'deliveryDue' => '2026-10-18', 'completeDate' => null, 'delivered' => 500, 'challans' => [],
                'yarnIn' => [
                    ['count' => '30/1 Y/D Navy', 'spinner' => 'Square Yarns', 'lot' => 'SQD-2210', 'bags' => 50, 'kg' => 2268],
                    ['count' => '30/1 Y/D White', 'spinner' => 'Square Yarns', 'lot' => 'SQD-2211', 'bags' => 20, 'kg' => 907],
                    ['count' => '2/30 Y/D Navy', 'spinner' => 'Akij Yarn', 'lot' => 'AKD-3301', 'bags' => 14, 'kg' => 635],
                    ['count' => '2/30 Y/D White', 'spinner' => 'Akij Yarn', 'lot' => 'AKD-3302', 'bags' => 4, 'kg' => 181],
                ],
                'lines' => [
                    ['kt' => 'c', 'yd' => true, 'unit' => 'kg', 'place' => 'Body', 'fab' => 'Y/D Stripe Single Jersey', 'color' => 'Navy 20mm + White 6mm', 'qty' => 3000, 'done' => 1200, 'dl' => 500, 'ggsm' => '170', 'fgsm' => '180', 'sl' => '2.80 mm', 'gdia' => '68"', 'dia' => '30" × 24G', 'machines' => ['M-20'], 'yarns' => [['role' => 'বডি সুতা', 'count' => '30/1 Y/D Navy', 'brand' => 'Square Yarns', 'lot' => 'SQD-2210', 'col' => 'Navy', 'pct' => 70], ['role' => 'বডি সুতা', 'count' => '30/1 Y/D White', 'brand' => 'Square Yarns', 'lot' => 'SQD-2211', 'col' => 'White', 'pct' => 30]]],
                    ['kt' => 'f', 'yd' => true, 'unit' => 'pcs', 'place' => 'Collar', 'fab' => 'Tipping Collar', 'color' => 'Navy + ২টা White টিপিং', 'qty' => 12000, 'done' => 7400, 'dl' => 5000, 'size' => '40 × 8 cm', 'pcw' => '18', 'dia' => 'ফ্ল্যাট · 14G', 'machines' => ['F-01', 'F-02'], 'yarns' => [['role' => 'বডি সুতা', 'count' => '2/30 Y/D Navy', 'brand' => 'Akij Yarn', 'lot' => 'AKD-3301', 'col' => 'Navy', 'pct' => 85], ['role' => 'বডি সুতা', 'count' => '2/30 Y/D White', 'brand' => 'Akij Yarn', 'lot' => 'AKD-3302', 'col' => 'White', 'pct' => 15]]],
                    ['kt' => 'f', 'yd' => true, 'unit' => 'pcs', 'place' => 'Cuff', 'fab' => 'Flat Knit Cuff', 'color' => 'Navy', 'qty' => 24000, 'done' => 9800, 'dl' => 6000, 'size' => '22 × 6 cm', 'pcw' => '8', 'dia' => 'ফ্ল্যাট · 14G', 'machines' => ['F-03'], 'yarns' => [['role' => 'বডি সুতা', 'count' => '2/30 Y/D Navy', 'brand' => 'Akij Yarn', 'lot' => 'AKD-3301', 'col' => 'Navy', 'pct' => 100]]],
                ],
            ],
            [
                'id' => 'SC-2610-022', 'v' => 'abc', 'buyer' => 'Next', 'fabric' => 'French Terry', 'gsm' => '240 GSM', 'dia' => '30" × 20G', 'color' => 'Olive', 'yarn' => '24/1 + 10/1 Cotton',
                'qty' => 8000, 'done' => 0, 'machines' => [], 'rate' => 360, 'start' => '—', 'status' => 'wait', 'rateTk' => 16,
                'orderDate' => '2026-10-01', 'deliveryDue' => '2026-10-25', 'completeDate' => null, 'delivered' => 0, 'challans' => [],
                'yarnIn' => [],
                'lines' => [],
            ],
            [
                'id' => 'SC-2610-016', 'v' => 'xyz', 'buyer' => 'Zara', 'fabric' => 'Pique (Lacoste) + Flat Collar', 'gsm' => '200 GSM', 'dia' => '30" × 24G + ফ্ল্যাট 14G', 'color' => 'White (RFD)', 'yarn' => '28/1 Combed',
                'qty' => 9500, 'done' => 6100, 'machines' => ['M-16', 'M-17', 'M-18', 'F-04', 'F-05'], 'rate' => 350, 'start' => '19 Sep', 'status' => 'run', 'rateTk' => 15,
                'orderDate' => '2026-09-17', 'deliveryDue' => '2026-10-14', 'completeDate' => null, 'delivered' => 3500, 'challans' => ['DC-0869'],
                'yarnIn' => [['count' => '28/1 Combed', 'spinner' => 'Noman Spinning', 'lot' => 'NS-3092', 'bags' => 210, 'kg' => 9525]],
                'lines' => [
                    ['kt' => 'c', 'yd' => false, 'unit' => 'kg', 'place' => 'Body', 'fab' => 'Pique (Lacoste)', 'color' => 'White (RFD)', 'qty' => 9500, 'done' => 6100, 'dl' => 3500, 'ggsm' => '190', 'fgsm' => '200', 'sl' => '2.75 mm', 'gdia' => '68"', 'dia' => '30" × 24G', 'machines' => ['M-16', 'M-17', 'M-18'], 'yarns' => [['role' => 'বডি সুতা', 'count' => '28/1 Combed', 'brand' => 'Noman Spinning', 'lot' => 'NS-3092', 'pct' => 100]]],
                    ['kt' => 'f', 'yd' => false, 'unit' => 'pcs', 'place' => 'Collar', 'fab' => 'Flat Knit Collar', 'color' => 'White (RFD)', 'qty' => 15000, 'done' => 9200, 'dl' => 5000, 'size' => '38 × 8 cm', 'pcw' => '17', 'dia' => 'ফ্ল্যাট · 14G', 'machines' => ['F-04', 'F-05'], 'yarns' => [['role' => 'বডি সুতা', 'count' => '28/1 Combed', 'brand' => 'Noman Spinning', 'lot' => 'NS-3092', 'pct' => 100]]],
                ],
            ],
            [
                'id' => 'SC-2610-015', 'v' => 'nobo', 'buyer' => 'C&A', 'fabric' => 'Single Jersey Lycra', 'gsm' => '180 GSM', 'dia' => '32" × 24G', 'color' => 'Red', 'yarn' => '30/1 + 20D Spandex',
                'qty' => 10000, 'done' => 4850, 'machines' => ['M-21', 'M-22', 'M-23', 'M-24'], 'rate' => 340, 'start' => '23 Sep', 'status' => 'run', 'rateTk' => 18,
                'orderDate' => '2026-09-21', 'deliveryDue' => '2026-10-16', 'completeDate' => null, 'delivered' => 2000, 'challans' => ['DC-0870'],
                'yarnIn' => [['count' => '30/1 + 20D', 'spinner' => 'Square + Creora', 'lot' => 'SQ-88390', 'bags' => 230, 'kg' => 10432]],
                'lines' => [],
            ],
            [
                'id' => 'SC-2609-006', 'v' => 'abc', 'buyer' => 'H&M', 'fabric' => 'Single Jersey', 'gsm' => '150 GSM', 'dia' => '30" × 24G', 'color' => 'White (RFD)', 'yarn' => '34/1 Combed Cotton',
                'qty' => 8000, 'done' => 8000, 'machines' => [], 'rate' => 380, 'start' => '05 Sep', 'status' => 'done', 'rateTk' => 13.5,
                'orderDate' => '2026-09-03', 'deliveryDue' => '2026-09-25', 'completeDate' => '2026-09-24', 'delivered' => 7910, 'challans' => ['DC-0831', 'DC-0839', 'DC-0844'],
                'yarnIn' => [['count' => '34/1 Combed Cotton', 'spinner' => 'Square Yarns', 'lot' => 'SQ-88104', 'bags' => 178, 'kg' => 8074]],
                'lines' => [],
            ],
            [
                'id' => 'SC-2609-008', 'v' => 'abc', 'buyer' => 'Tesco', 'fabric' => 'Interlock', 'gsm' => '210 GSM', 'dia' => '34" × 24G', 'color' => 'Navy Blue', 'yarn' => '40/1 Combed Cotton',
                'qty' => 5000, 'done' => 5000, 'machines' => [], 'rate' => 280, 'start' => '10 Sep', 'status' => 'done', 'rateTk' => 17,
                'orderDate' => '2026-09-08', 'deliveryDue' => '2026-09-30', 'completeDate' => '2026-09-29', 'delivered' => 4940, 'challans' => ['DC-0852', 'DC-0856'],
                'yarnIn' => [['count' => '40/1 Combed Cotton', 'spinner' => 'Matin Spinning', 'lot' => 'MS-0998', 'bags' => 112, 'kg' => 5080]],
                'lines' => [],
            ],
            [
                'id' => 'SC-2609-012', 'v' => 'abc', 'buyer' => 'Primark', 'fabric' => 'Single Jersey', 'gsm' => '160 GSM', 'dia' => '30" × 24G', 'color' => 'Royal Blue', 'yarn' => '30/1 Carded Cotton',
                'qty' => 4500, 'done' => 4500, 'machines' => [], 'rate' => 380, 'start' => '18 Sep', 'status' => 'done', 'rateTk' => 13,
                'orderDate' => '2026-09-16', 'deliveryDue' => '2026-10-03', 'completeDate' => '2026-10-02', 'delivered' => 4440, 'challans' => ['DC-0867', 'DC-0871'],
                'yarnIn' => [['count' => '30/1 Carded Cotton', 'spinner' => 'Akij Yarn', 'lot' => 'AK-5509', 'bags' => 100, 'kg' => 4536]],
                'lines' => [],
            ],
            [
                'id' => 'SC-2608-009', 'v' => 'abc', 'buyer' => 'Next', 'fabric' => 'Pique', 'gsm' => '200 GSM', 'dia' => '30" × 24G', 'color' => 'Black', 'yarn' => '28/1 Combed Cotton',
                'qty' => 7000, 'done' => 7000, 'machines' => [], 'rate' => 350, 'start' => '14 Aug', 'status' => 'done', 'rateTk' => 15,
                'orderDate' => '2026-08-12', 'deliveryDue' => '2026-09-05', 'completeDate' => '2026-09-04', 'delivered' => 6920, 'challans' => ['DC-0802', 'DC-0811'],
                'yarnIn' => [['count' => '28/1 Combed Cotton', 'spinner' => 'Noman Spinning', 'lot' => 'NS-2981', 'bags' => 156, 'kg' => 7076]],
                'lines' => [],
            ],
            [
                'id' => 'SC-2609-004', 'v' => 'xyz', 'buyer' => 'Zara', 'fabric' => 'Single Jersey', 'gsm' => '160 GSM', 'dia' => '30" × 24G', 'color' => 'Olive', 'yarn' => '30/1 Combed',
                'qty' => 6000, 'done' => 6000, 'machines' => [], 'rate' => 380, 'start' => '02 Sep', 'status' => 'done', 'rateTk' => 14.5,
                'orderDate' => '2026-09-01', 'deliveryDue' => '2026-09-22', 'completeDate' => '2026-09-20', 'delivered' => 5930, 'challans' => ['DC-0825', 'DC-0834'],
                'yarnIn' => [['count' => '30/1 Combed', 'spinner' => 'Square Yarns', 'lot' => 'SQ-88090', 'bags' => 134, 'kg' => 6078]],
                'lines' => [],
            ],
        ];

        foreach ($ordersData as $od) {
            $order = SubcontractOrder::create([
                'order_no' => $od['id'],
                'factory_id' => $f1->id,
                'party_code' => $od['v'],
                'buyer' => $od['buyer'],
                'fabric_summary' => $od['fabric'],
                'gsm' => $od['gsm'],
                'dia_gauge' => $od['dia'],
                'color' => $od['color'],
                'yarn_summary' => $od['yarn'],
                'total_qty_kg' => $od['qty'],
                'done_kg' => $od['done'],
                'delivered_kg' => $od['delivered'],
                'daily_rate_kg' => $od['rate'],
                'rate_tk' => $od['rateTk'],
                'status' => $od['status'],
                'start_label' => $od['start'],
                'order_date' => $od['orderDate'],
                'delivery_due_date' => $od['deliveryDue'],
                'complete_date' => $od['completeDate'],
                'today_prod_kg' => $od['id'] === 'SC-2610-014' ? 635 : 310,
                'week_prod_json' => [640, 702, 688, 655, 710, 725, 635],
                'machines_json' => $od['machines'],
                'challans_json' => $od['challans'],
                'yarn_in_json' => $od['yarnIn'],
            ]);

            $lines = !empty($od['lines']) ? $od['lines'] : [[
                'kt' => 'c', 'yd' => false, 'unit' => 'kg', 'place' => 'Body', 'fab' => $od['fabric'],
                'color' => $od['color'], 'qty' => $od['qty'], 'done' => $od['done'], 'dl' => $od['delivered'],
                'ggsm' => str_replace(' GSM', '', $od['gsm']), 'fgsm' => '', 'sl' => '2.85 mm', 'gdia' => '', 'dia' => $od['dia'],
                'machines' => $od['machines'],
                'yarns' => array_map(fn ($y) => ['role' => 'বডি সুতা', 'count' => $y['count'], 'brand' => $y['spinner'], 'lot' => $y['lot'], 'pct' => 100], $od['yarnIn']),
            ]];

            foreach ($lines as $idx => $l) {
                OrderLine::create([
                    'subcontract_order_id' => $order->id,
                    'line_index' => $idx,
                    'knit_type' => $l['kt'] ?? 'c',
                    'is_yarn_dyed' => $l['yd'] ?? false,
                    'unit' => $l['unit'] ?? 'kg',
                    'placement' => $l['place'],
                    'fabrication' => $l['fab'],
                    'color' => $l['color'] ?? '—',
                    'qty' => $l['qty'],
                    'done_qty' => $l['done'],
                    'delivered_qty' => $l['dl'] ?? 0,
                    'grey_gsm' => $l['ggsm'] ?? null,
                    'finish_gsm' => $l['fgsm'] ?? null,
                    'stitch_length' => $l['sl'] ?? null,
                    'grey_dia' => $l['gdia'] ?? null,
                    'dia_gauge' => $l['dia'] ?? null,
                    'flat_size' => $l['size'] ?? null,
                    'piece_weight_gm' => $l['pcw'] ?? null,
                    'machines_json' => $l['machines'] ?? [],
                    'yarns_json' => $l['yarns'] ?? [],
                ]);
            }
        }

        // 6. Seed Production Logs, Fabric Rolls & Two-Party QC Inspections
        $o14 = SubcontractOrder::where('order_no', 'SC-2610-014')->first();
        $o11 = SubcontractOrder::where('order_no', 'SC-2609-011')->first();
        $o16 = SubcontractOrder::where('order_no', 'SC-2610-016')->first();

        $prodLogs = [
            ['order' => $o14, 'pl' => 0, 'd' => '03 Oct', 'sh' => 'A', 'm' => 'M-03', 'op' => 'জসিম', 'kg' => 192, 'rolls' => 8, 'lot' => 'SQ-88419', 'fault' => ''],
            ['order' => $o14, 'pl' => 0, 'd' => '03 Oct', 'sh' => 'A', 'm' => 'M-04', 'op' => 'সোহেল', 'kg' => 185, 'rolls' => 8, 'lot' => 'SQ-88419', 'fault' => ''],
            ['order' => $o14, 'pl' => 0, 'd' => '03 Oct', 'sh' => 'A', 'm' => 'M-07', 'op' => 'আলমগীর', 'kg' => 170, 'rolls' => 7, 'lot' => 'SQ-88419', 'fault' => 'Needle mark (1 রোল)'],
            ['order' => $o14, 'pl' => 1, 'd' => '03 Oct', 'sh' => 'A', 'm' => 'M-08', 'op' => 'রিপন', 'kg' => 88, 'rolls' => 6, 'lot' => 'SQ-88419 + HY-2207', 'fault' => ''],
            ['order' => $o11, 'pl' => 0, 'd' => '03 Oct', 'sh' => 'A', 'm' => 'M-12', 'op' => 'হাবিব', 'kg' => 126, 'rolls' => 6, 'lot' => 'AK-5521', 'fault' => ''],
            ['order' => $o16, 'pl' => 0, 'd' => '03 Oct', 'sh' => 'A', 'm' => 'M-16', 'op' => 'মাসুদ', 'kg' => 158, 'rolls' => 7, 'lot' => 'NS-3092', 'fault' => 'Oil spot (1 রোল)'],
        ];

        foreach ($prodLogs as $pl) {
            ProductionLog::create([
                'subcontract_order_id' => $pl['order']->id,
                'order_no' => $pl['order']->order_no,
                'placement_index' => $pl['pl'],
                'date_label' => $pl['d'],
                'shift' => $pl['sh'],
                'machine_code' => $pl['m'],
                'operator_name' => $pl['op'],
                'qty_kg' => $pl['kg'],
                'rolls_count' => $pl['rolls'],
                'yarn_lot' => $pl['lot'],
                'fault_code' => $pl['fault'],
            ]);
        }

        // Seed Rolls for SC-2610-014
        $rollGroups = [
            ['m' => 'M-03', 'pl' => 0, 'n' => 6, 'kg' => 23.2, 'op' => 'জসিম', 'lot' => 'SQ-88419', 'fx' => [1 => ['Hole' => 2], 4 => ['Oil Spot' => 1]]],
            ['m' => 'M-04', 'pl' => 0, 'n' => 6, 'kg' => 23.8, 'op' => 'সোহেল', 'lot' => 'SQ-88419', 'fx' => [2 => ['Needle Mark' => 1, 'Thick Thin' => 1]]],
            ['m' => 'M-07', 'pl' => 0, 'n' => 5, 'kg' => 24.1, 'op' => 'আলমগীর', 'lot' => 'SQ-88419', 'fx' => [0 => ['Hole' => 3, 'Needle Mark' => 2]]],
            ['m' => 'M-08', 'pl' => 1, 'n' => 4, 'kg' => 14.6, 'op' => 'রিপন', 'lot' => 'SQ-88419 + HY-2207', 'fx' => [3 => ['Lycra Out' => 1]]],
        ];

        $rollCount = 0;
        foreach ($rollGroups as $rg) {
            for ($i = 0; $i < $rg['n']; $i++) {
                $jc = str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT);
                $rollNo = $rg['m'] . '/' . $jc;
                $weight = round($rg['kg'] + ((($i * 7) % 5) - 2) * 0.4, 1);
                FabricRoll::create([
                    'roll_no' => $rollNo,
                    'jc_seq' => $jc,
                    'order_no' => 'SC-2610-014',
                    'placement_index' => $rg['pl'],
                    'machine_code' => $rg['m'],
                    'date_label' => '03 Oct',
                    'shift' => 'A',
                    'operator_name' => $rg['op'],
                    'weight_kg' => $weight,
                    'yarn_lot' => $rg['lot'],
                    'faults_json' => $rg['fx'][$i] ?? [],
                    'challan_no' => $rollCount < 4 ? 'DC-0872' : null,
                ]);
                $rollCount++;
            }
        }

        // Seed Two-Party QC Inspections
        $qcs = [
            [
                'id' => 'QC-0104', 'o' => 'SC-2610-014', 'pl' => 1, 'd' => '03 Oct', 'roll' => 'M-08/004', 'm' => 'M-08', 'kg' => 21.4,
                'issue' => 'Lycra out — রোলের শেষে ৪ মিটার', 'src' => 'ven',
                'fac' => ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
                'ven' => ['v' => 'bad', 'by' => 'মো. কামরুল হাসান (ABC QC)', 'at' => '03 Oct, 11:20', 'note' => 'রোলের শেষে লাইক্রা ছিঁড়ে গেছে, রিব ঢিলা হয়ে আছে। এই রোল নেওয়া যাবে না।'],
                'act' => '',
            ],
            [
                'id' => 'QC-0103', 'o' => 'SC-2610-014', 'pl' => 0, 'd' => '03 Oct', 'roll' => 'M-07/001', 'm' => 'M-07', 'kg' => 22.8,
                'issue' => 'Needle mark — পুরো রোলে লম্বা দাগ', 'src' => 'fac',
                'fac' => ['v' => 'bad', 'by' => 'রুবেল মিয়া (ফ্যাক্টরি QC)', 'at' => '03 Oct, 10:05', 'note' => 'নিডল ভেঙে দাগ পড়েছে। নিডল বদলানো হয়েছে, রোলটা রিনিট করা হবে।'],
                'ven' => ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
                'act' => 'রিনিট হবে',
            ],
            [
                'id' => 'QC-0101', 'o' => 'SC-2610-014', 'pl' => 0, 'd' => '01 Oct', 'roll' => 'M-04/005', 'm' => 'M-04', 'kg' => 24.0,
                'issue' => 'Barre / শেড লাইন (লট মিক্স সন্দেহ)', 'src' => 'ven',
                'fac' => ['v' => 'ok', 'by' => 'রুবেল মিয়া (ফ্যাক্টরি QC)', 'at' => '01 Oct, 17:10', 'note' => 'একই লট SQ-88419 চালানো হয়েছে, ওয়াশের পর চলে যাবে।'],
                'ven' => ['v' => 'bad', 'by' => 'মো. কামরুল হাসান (ABC QC)', 'at' => '01 Oct, 16:30', 'note' => 'আলোতে স্পষ্ট পাট্টা দেখা যাচ্ছে, ডাইংয়ে ঝুঁকি আছে।'],
                'act' => '',
            ],
            [
                'id' => 'QC-0098', 'o' => 'SC-2610-014', 'pl' => 0, 'd' => '30 Sep', 'roll' => 'M-03/001 – M-03/030 (৩০ রোল)', 'm' => 'M-03, M-04', 'kg' => 684.0,
                'issue' => 'কোনো ফল্ট নেই — GSM 160, Dia 68"', 'src' => 'fac',
                'fac' => ['v' => 'ok', 'by' => 'রুবেল মিয়া (ফ্যাক্টরি QC)', 'at' => '30 Sep, 18:00', 'note' => '৩০ রোল চেক, সব ঠিক আছে।'],
                'ven' => ['v' => 'ok', 'by' => 'মো. কামরুল হাসান (ABC QC)', 'at' => '01 Oct, 11:15', 'note' => '৫ রোল র‍্যান্ডম চেক করে পাস দেওয়া হলো।'],
                'act' => 'ডেলিভারি যাবে',
            ],
            [
                'id' => 'QC-0102', 'o' => 'SC-2609-011', 'pl' => 0, 'd' => '02 Oct', 'roll' => 'M-12/001 – M-12/040 (৪০ রোল)', 'm' => 'M-12, M-13', 'kg' => 980.0,
                'issue' => 'কোনো ফল্ট নেই — GSM 220 ঠিক আছে', 'src' => 'fac',
                'fac' => ['v' => 'ok', 'by' => 'রুবেল মিয়া (ফ্যাক্টরি QC)', 'at' => '02 Oct, 19:00', 'note' => 'সব রোল পাস।'],
                'ven' => ['v' => null, 'by' => '', 'at' => '', 'note' => ''],
                'act' => '',
            ],
            [
                'id' => 'QC-0100', 'o' => 'SC-2610-016', 'pl' => 0, 'd' => '03 Oct', 'roll' => 'M-16/012', 'm' => 'M-16', 'kg' => 23.1,
                'issue' => 'Oil spot — ৪ জায়গায় তেলের দাগ', 'src' => 'fac',
                'fac' => ['v' => 'bad', 'by' => 'রুবেল মিয়া (ফ্যাক্টরি QC)', 'at' => '03 Oct, 09:40', 'note' => 'অয়েল লাইন পরিষ্কার করা হয়েছে।'],
                'ven' => ['v' => 'bad', 'by' => 'শারমিন আক্তার (XYZ QC)', 'at' => '03 Oct, 12:05', 'note' => 'দাগ উঠলে B-grade হিসেবে নেওয়া যাবে।'],
                'act' => 'স্টেইন রিমুভ করে আবার চেক',
            ],
        ];

        foreach ($qcs as $q) {
            QcInspection::create([
                'qc_no' => $q['id'],
                'order_no' => $q['o'],
                'placement_index' => $q['pl'],
                'date_label' => $q['d'],
                'roll_no' => $q['roll'],
                'machine_code' => $q['m'],
                'weight_kg' => $q['kg'],
                'issue_description' => $q['issue'],
                'source' => $q['src'],
                'factory_sign_json' => $q['fac'],
                'vendor_sign_json' => $q['ven'],
                'action_taken' => $q['act'],
            ]);
        }

        // 7. Seed Delivery Challans
        DeliveryChallan::create([
            'challan_no' => 'DC-0872',
            'factory_code' => 'f1',
            'party_code' => 'abc',
            'order_no' => 'SC-2610-014',
            'date_label' => '03 Oct',
            'rolls_json' => ['M-03/001', 'M-03/002', 'M-03/003', 'M-03/004'],
            'vehicle_no' => 'ঢাকা মেট্রো ন ১৪-২২৫৬',
            'driver_name' => 'মো. জাকির',
            'driver_phone' => '01711-223344',
            'factory_sign_json' => ['by' => 'শফিকুল ইসলাম', 'at' => '03 Oct, 10:10'],
            'vendor_sign_json' => ['by' => 'মো. কামরুল হাসান', 'at' => '03 Oct, 13:05', 'got' => 4],
        ]);

        // 8. Seed Store Items & Issue Logs
        $storeItems = [
            ['id' => 'n1', 'name' => 'নিডল Groz-Beckert VO 74.41 G02', 'cat' => 'নিডল ও সিংকার', 'unit' => 'পিস', 'stock' => 340, 'min' => 500, 'price' => 42],
            ['id' => 'n2', 'name' => 'নিডল Groz-Beckert VO 71.52 G01 (রিব)', 'cat' => 'নিডল ও সিংকার', 'unit' => 'পিস', 'stock' => 820, 'min' => 400, 'price' => 45],
            ['id' => 's1', 'name' => 'সিংকার (Pailung 24G)', 'cat' => 'নিডল ও সিংকার', 'unit' => 'পিস', 'stock' => 150, 'min' => 200, 'price' => 18],
            ['id' => 'o1', 'name' => 'নিটিং অয়েল (২০ লিটার)', 'cat' => 'নিটিং অয়েল', 'unit' => 'ক্যান', 'stock' => 6, 'min' => 4, 'price' => 3600],
            ['id' => 'p1', 'name' => 'ইয়ার্ন ফিডার', 'cat' => 'স্পেয়ার পার্টস', 'unit' => 'পিস', 'stock' => 12, 'min' => 10, 'price' => 950],
            ['id' => 'p2', 'name' => 'পজিটিভ ফিড বেল্ট', 'cat' => 'স্পেয়ার পার্টস', 'unit' => 'পিস', 'stock' => 3, 'min' => 5, 'price' => 1400],
            ['id' => 'p3', 'name' => 'ক্যাম বক্স স্প্রিং', 'cat' => 'স্পেয়ার পার্টস', 'unit' => 'সেট', 'stock' => 9, 'min' => 4, 'price' => 600],
            ['id' => 'e1', 'name' => 'ইনভার্টার রিলে', 'cat' => 'ইলেকট্রিক গুডস', 'unit' => 'পিস', 'stock' => 2, 'min' => 2, 'price' => 2200],
        ];
        foreach ($storeItems as $si) {
            StoreItem::create([
                'item_code' => $si['id'],
                'name' => $si['name'],
                'category' => $si['cat'],
                'unit' => $si['unit'],
                'stock_qty' => $si['stock'],
                'min_qty' => $si['min'],
                'unit_price' => $si['price'],
                'rfq_sent' => false,
            ]);
        }

        $issueLogs = [
            ['d' => '03 Oct', 'id' => 'n1', 'm' => 'M-07', 'q' => 60, 'by' => 'শফিকুল'],
            ['d' => '02 Oct', 'id' => 'n1', 'm' => 'M-03', 'q' => 40, 'by' => 'শফিকুল'],
            ['d' => '02 Oct', 'id' => 'o1', 'm' => 'সব মেশিন', 'q' => 1, 'by' => 'মো. হানিফ'],
            ['d' => '01 Oct', 'id' => 'n2', 'm' => 'M-12', 'q' => 30, 'by' => 'শফিকুল'],
            ['d' => '30 Sep', 'id' => 'p2', 'm' => 'M-10', 'q' => 1, 'by' => 'মো. হানিফ'],
        ];
        foreach ($issueLogs as $il) {
            StoreIssueLog::create([
                'item_code' => $il['id'],
                'date_label' => $il['d'],
                'machine_code' => $il['m'],
                'qty' => $il['q'],
                'issued_by' => $il['by'],
            ]);
        }

        // 9. Seed Bills & Vouchers
        $billsData = [
            ['no' => 'BL-2609-002', 'date' => '2026-09-05', 'v' => 'abc', 'lines' => [['o' => 'SC-2608-009', 'fab' => 'Pique 200 GSM', 'kg' => 6920, 'rate' => 15]], 'jv' => 'JV-0912', 'recv' => [['d' => '2026-09-18', 'amt' => 60000, 'rv' => 'RV-0921', 'mode' => 'ব্যাংক ট্রান্সফার — ব্যাংক A'], ['d' => '2026-09-28', 'amt' => 43800, 'rv' => 'RV-0929', 'mode' => 'চেক — ব্যাংক A']]],
            ['no' => 'BL-2609-005', 'date' => '2026-09-21', 'v' => 'xyz', 'lines' => [['o' => 'SC-2609-004', 'fab' => 'Single Jersey 160 GSM', 'kg' => 5930, 'rate' => 14.5]], 'jv' => 'JV-0920', 'recv' => [['d' => '2026-09-30', 'amt' => 50000, 'rv' => 'RV-0930', 'mode' => 'ব্যাংক ট্রান্সফার — ব্যাংক A']]],
            ['no' => 'BL-2609-007', 'date' => '2026-09-26', 'v' => 'abc', 'lines' => [['o' => 'SC-2609-006', 'fab' => 'Single Jersey 150 GSM', 'kg' => 7910, 'rate' => 13.5]], 'jv' => 'JV-0924', 'recv' => [['d' => '2026-10-01', 'amt' => 60000, 'rv' => 'RV-0933', 'mode' => 'ব্যাংক ট্রান্সফার — ব্যাংক A']]],
            ['no' => 'BL-2610-001', 'date' => '2026-10-01', 'v' => 'abc', 'lines' => [['o' => 'SC-2609-008', 'fab' => 'Interlock 210 GSM', 'kg' => 4940, 'rate' => 17]], 'jv' => 'JV-0927', 'recv' => []],
        ];
        foreach ($billsData as $bd) {
            Bill::create([
                'bill_no' => $bd['no'],
                'factory_code' => 'f1',
                'party_code' => $bd['v'],
                'bill_date' => $bd['date'],
                'jv_no' => $bd['jv'],
                'lines_json' => $bd['lines'],
                'payments_json' => $bd['recv'],
            ]);
        }

        // 10. Seed Message Threads
        $threadsData = [
            [
                'id' => 'a1', 'f' => 'f1', 'v' => 'abc', 'o' => 'SC-2610-014', 'title' => 'Body + Neck Rib', 'unread' => 1,
                'msgs' => [
                    ['s' => 'fac', 'n' => 'রুবেল মিয়া · ফ্যাক্টরি QC', 't' => '০১ অক্টো, ৫:১০', 'txt' => 'M-04/005 রোলটা আমরা আবার দেখেছি। একই লট SQ-88419, শেড ঠিক আছে।'],
                    ['s' => 'ven', 'n' => 'মো. কামরুল হাসান · মার্চেন্ডাইজার', 't' => '০১ অক্টো, ৫:৪২', 'txt' => 'আলোতে পাট্টা দেখা যাচ্ছে। কাল আমাদের QC এসে একসাথে দেখুক?'],
                    ['s' => 'fac', 'n' => 'শফিকুল ইসলাম · প্রোডাকশন ম্যানেজার', 't' => '০২ অক্টো, ৯:০৫', 'txt' => 'ঠিক আছে, কাল ১১টায় আসুন। রোল আলাদা করে রাখা আছে।'],
                    ['s' => 'sys', 't' => '০৩ অক্টো, ২:০০', 'txt' => 'প্রোডাকশন এন্ট্রি · শিফট A · Body 547 kg, Neck Rib 88 kg'],
                    ['s' => 'fac', 'n' => 'শফিকুল ইসলাম · প্রোডাকশন ম্যানেজার', 't' => '০৩ অক্টো, ২:১৫', 'txt' => 'Neck Rib-এর লাইক্রা লট HY-2207 শেষের দিকে। নতুন লট কবে পাঠাবেন?', 'img' => 1],
                    ['s' => 'ven', 'n' => 'মো. কামরুল হাসান · মার্চেন্ডাইজার', 't' => '০৩ অক্টো, ২:৪০', 'txt' => 'নতুন লট কাল সকালে পাঠাচ্ছি, ৩০ ব্যাগ।'],
                    ['s' => 'ven', 'n' => 'মো. কামরুল হাসান · মার্চেন্ডাইজার', 't' => '০৩ অক্টো, ২:৪১', 'voice' => ['id' => 's1', 'dur' => 14]],
                ],
            ],
            [
                'id' => 'a2', 'f' => 'f1', 'v' => 'abc', 'o' => 'SC-2609-011', 'title' => '1×1 Rib', 'unread' => 0,
                'msgs' => [
                    ['s' => 'ven', 'n' => 'মো. কামরুল হাসান · মার্চেন্ডাইজার', 't' => '০২ অক্টো, ১০:০০', 'txt' => 'বাকি ১৯০ kg কবে শেষ হবে?'],
                    ['s' => 'fac', 'n' => 'শফিকুল ইসলাম · প্রোডাকশন ম্যানেজার', 't' => '০২ অক্টো, ১০:১২', 'txt' => 'কাল শিফট A-তে শেষ হয়ে যাবে ইনশাআল্লাহ।'],
                ],
            ],
            [
                'id' => 'x1', 'f' => 'f1', 'v' => 'xyz', 'o' => 'SC-2610-016', 'title' => 'Pique', 'unread' => 1,
                'msgs' => [
                    ['s' => 'fac', 'n' => 'রুবেল মিয়া · ফ্যাক্টরি QC', 't' => '০৩ অক্টো, ৯:৪৫', 'txt' => 'M-16/012 রোলে ৪টা অয়েল স্পট। রোল আলাদা রাখা হয়েছে।', 'img' => 1],
                    ['s' => 'ven', 'n' => 'শারমিন আক্তার · মার্চেন্ডাইজার', 't' => '০৩ অক্টো, ১১:৩০', 'txt' => 'ছবি পেয়েছি। আমাদের QC বিকেলে আসবে।'],
                ],
            ],
        ];
        foreach ($threadsData as $td) {
            MessageThread::create([
                'thread_code' => $td['id'],
                'factory_code' => $td['f'],
                'party_code' => $td['v'],
                'order_no' => $td['o'],
                'title' => $td['title'],
                'unread_count' => $td['unread'],
                'messages_json' => $td['msgs'],
            ]);
        }

        // 11. Seed Jobs Board
        $jobsData = [
            ['r' => 'নিটিং অপারেটর (সার্কুলার মেশিন)', 'c' => 'রহমান নিটিং ইন্ডাস্ট্রিজ (নমুনা)', 'a' => 'কাশিমপুর, গাজীপুর', 't' => 'op', 'sh' => 'শিফট A / B (১২ ঘণ্টা)', 'exp' => 'কমপক্ষে ১ বছর', 's' => '৳ ১৪,০০০ – ১৮,০০০', 'd' => 'আজ', 'ph' => '01711000111', 'n' => true, 'vac' => 4, 'req' => ['সার্কুলার নিটিং মেশিনে কমপক্ষে ১ বছরের অভিজ্ঞতা', 'শিফটে কাজ করতে আগ্রহী', 'Single Jersey, Rib চালানোর অভিজ্ঞতা থাকলে ভালো']],
            ['r' => 'নিটিং সুপারভাইজার', 'c' => 'সোনালী নিট ফ্যাব্রিক্স (নমুনা)', 'a' => 'আশুলিয়া, সাভার', 't' => 'sup', 'sh' => 'ডে শিফট', 'exp' => '৩–৫ বছর', 's' => '৳ ২২,০০০ – ২৮,০০০', 'd' => '১ দিন আগে', 'ph' => '01819000222', 'n' => true, 'vac' => 1, 'req' => ['৩–৫ বছর নিটিং ফ্লোরের অভিজ্ঞতা', 'প্রোডাকশন রিপোর্ট ও শিফট প্ল্যানিং', 'মোবাইলে এন্ট্রি দিতে পারতে হবে']],
            ['r' => 'নিটিং মেশিন টেকনিশিয়ান', 'c' => 'মদিনা নিট কম্পোজিট (নমুনা)', 'a' => 'ফতুল্লা, নারায়ণগঞ্জ', 't' => 'tech', 'sh' => 'ফুল টাইম', 'exp' => '৪+ বছর', 's' => '৳ ২৫,০০০ – ৩৫,০০০', 'd' => '২ দিন আগে', 'ph' => '01912000333', 'n' => false, 'vac' => 2, 'req' => ['সার্কুলার মেশিন সেটিং, গেজ ও সিংকার বদলানো', 'Pailung ও Fukuhara মেশিনের ব্রেকডাউন দ্রুত সারানোর অভিজ্ঞতা']],
            ['r' => 'ফেব্রিক QC ইন্সপেক্টর (গ্রে)', 'c' => 'রহমান নিটিং ইন্ডাস্ট্রিজ (নমুনা)', 'a' => 'কাশিমপুর, গাজীপুর', 't' => 'qc', 'sh' => 'শিফট A', 'exp' => '২ বছর', 's' => '৳ ১৬,০০০ – ২০,০০০', 'd' => '৩ দিন আগে', 'ph' => '01711000111', 'n' => false, 'vac' => 2, 'req' => ['৪-পয়েন্ট সিস্টেমে রোল ইন্সপেকশন', 'GSM, Dia চেক ও ফল্ট রিপোর্ট']],
            ['r' => 'নিটিং মার্চেন্ডাইজার', 'c' => 'তাসনিম নিট কম্পোজিট (নমুনা)', 'a' => 'টঙ্গী, গাজীপুর', 't' => 'mer', 'sh' => 'ডে (৯টা – ৬টা)', 'exp' => '২–৪ বছর', 's' => 'আলোচনা সাপেক্ষে', 'd' => '৪ দিন আগে', 'ph' => '01611000444', 'n' => false, 'vac' => 1, 'req' => ['সাব-কন্ট্রাক্ট ফ্যাক্টরি ফলোআপ ও সুতা প্ল্যানিং', 'Excel এ দক্ষ', 'টেক্সটাইলে ডিপ্লোমা বা স্নাতক অগ্রাধিকার']],
            ['r' => 'নিটিং অপারেটর (ফ্ল্যাট/কলার-কাফ)', 'c' => 'এভারগ্রিন নিটিং (নমুনা)', 'a' => 'মিরপুর, ঢাকা', 't' => 'op', 'sh' => 'শিফট A / B', 'exp' => '১–২ বছর', 's' => '৳ ১৫,০০০ – ১৯,০০০', 'd' => '৫ দিন আগে', 'ph' => '01511000555', 'n' => false, 'vac' => 3, 'req' => ['ফ্ল্যাট নিটিং মেশিনে অভিজ্ঞতা', 'কলার ও কাফ বোনার কাজ জানা']],
            ['r' => 'স্টোর ইনচার্জ (সুতা)', 'c' => 'রহমান নিটিং ইন্ডাস্ট্রিজ (নমুনা)', 'a' => 'কাশিমপুর, গাজীপুর', 't' => 'sup', 'sh' => 'ডে শিফট', 'exp' => '২+ বছর', 's' => '৳ ১৮,০০০ – ২২,০০০', 'd' => '১ সপ্তাহ আগে', 'ph' => '01711000111', 'n' => false, 'vac' => 1, 'req' => ['সুতা গ্রহণ, লট আলাদা রাখা, ব্যালেন্স হিসাব', 'চালান ও রেজিস্টার রাখার অভিজ্ঞতা']],
        ];
        foreach ($jobsData as $jd) {
            JobListing::create([
                'role_title' => $jd['r'],
                'company_name' => $jd['c'],
                'area' => $jd['a'],
                'category' => $jd['t'],
                'shift_label' => $jd['sh'],
                'experience_label' => $jd['exp'],
                'salary_label' => $jd['s'],
                'posted_label' => $jd['d'],
                'contact_phone' => $jd['ph'],
                'is_new' => $jd['n'],
                'vacancies' => $jd['vac'],
                'requirements_json' => $jd['req'],
            ]);
        }

        // 12. Seed Suppliers & RFQs
        $suppliersData = [
            ['n' => 'সার্কেল নিট মেশিনারি (নমুনা)', 'c' => 'mc', 'also' => ['spare'], 'a' => 'সাভার', 'r' => 4.6, 'f' => 28, 'g' => 'নতুন ও রিকন্ডিশন্ড সার্কুলার মেশিন, ইনস্টলেশন ও ২৪ ঘণ্টা সার্ভিস', 'sp' => true],
            ['n' => 'ইউনিনিট মেশিনারিজ (নমুনা)', 'c' => 'mc', 'also' => [], 'a' => 'গাজীপুর', 'r' => 4.5, 'f' => 17, 'g' => 'ফ্ল্যাট ও কলার-কাফ নিটিং মেশিন, অপারেটর ট্রেনিং', 'sp' => false],
            ['n' => 'প্রাইম সিংকার হাউস (নমুনা)', 'c' => 'sinker', 'also' => [], 'a' => 'গাজীপুর', 'r' => 4.8, 'f' => 42, 'g' => 'সার্কুলার ও ফ্ল্যাট মেশিনের সিংকার, নিডল ও ক্যাম', 'sp' => false],
            ['n' => 'ক্লিয়ারফ্লো লুব্রিক্যান্টস (নমুনা)', 'c' => 'oil', 'also' => [], 'a' => 'নারায়ণগঞ্জ', 'r' => 4.7, 'f' => 35, 'g' => 'দাগ না পড়া নিটিং অয়েল, সিলিন্ডার ক্লিনার', 'sp' => false],
            ['n' => 'টেকস্পেয়ার বিডি (নমুনা)', 'c' => 'spare', 'also' => [], 'a' => 'আশুলিয়া', 'r' => 4.5, 'f' => 21, 'g' => 'ফিডার, পজিটিভ ফিড, স্টপ মোশন, বেল্ট, সিলিন্ডার', 'sp' => false],
            ['n' => 'পাওয়ারলাইন ইলেকট্রিক (নমুনা)', 'c' => 'elec', 'also' => [], 'a' => 'গাজীপুর', 'r' => 4.4, 'f' => 16, 'g' => 'মোটর, ইনভার্টার, প্যানেল, লাইট ও ক্যাবল', 'sp' => false],
        ];
        foreach ($suppliersData as $sd) {
            Supplier::create([
                'name' => $sd['n'],
                'category' => $sd['c'],
                'also_categories_json' => $sd['also'],
                'area' => $sd['a'],
                'rating' => $sd['r'],
                'reviews_count' => $sd['f'],
                'description' => $sd['g'],
                'is_sponsored' => $sd['sp'],
                'is_verified' => true,
            ]);
        }

        $rfqsData = [
            ['id' => 'RFQ-118', 'f' => 'f1', 'item' => 'নিডল Groz-Beckert VO 74.41 G02', 'q' => '৫০০ পিস', 'need' => '06 Oct', 'st' => 'new', 'price' => null, 'days' => null, 'note' => 'M-07-এ নিডল বেশি ভাঙছে, জরুরি'],
            ['id' => 'RFQ-117', 'f' => 'f4', 'item' => 'পজিটিভ ফিড বেল্ট (Pailung)', 'q' => '৬ পিস', 'need' => '08 Oct', 'st' => 'new', 'price' => null, 'days' => null, 'note' => ''],
            ['id' => 'RFQ-115', 'f' => 'f3', 'item' => 'সিলিন্ডার মেরামত, 30" × 28G', 'q' => '১টা মেশিন', 'need' => '05 Oct', 'st' => 'quoted', 'price' => '৳ ১৮,৫০০', 'days' => '৩ দিন', 'note' => 'দুইটা মেশিনের সিলিন্ডারে সমস্যা'],
            ['id' => 'RFQ-112', 'f' => 'f2', 'item' => 'সিংকার (Fukuhara 18G)', 'q' => '৩০০ পিস', 'need' => '01 Oct', 'st' => 'won', 'price' => '৳ ১৭ / পিস', 'days' => '১ দিন', 'note' => ''],
            ['id' => 'RFQ-109', 'f' => 'f5', 'item' => 'নিটিং অয়েল ২০ লিটার', 'q' => '১০ ক্যান', 'need' => '28 Sep', 'st' => 'lost', 'price' => '৳ ৩,৭০০ / ক্যান', 'days' => '২ দিন', 'note' => ''],
        ];
        foreach ($rfqsData as $rd) {
            SupplierRfq::create([
                'rfq_no' => $rd['id'],
                'factory_code' => $rd['f'],
                'item_name' => $rd['item'],
                'qty_label' => $rd['q'],
                'need_by_label' => $rd['need'],
                'status' => $rd['st'],
                'quoted_price' => $rd['price'],
                'delivery_days' => $rd['days'],
                'note' => $rd['note'],
            ]);
        }

        // 13. Seed Subcontract Posts & Quotations (shilposetu-old domain)
        $post = SubcontractPost::create([
            'factory_id' => $f1->id,
            'post_type' => 'work_offer',
            'title' => 'Single Jersey 160 GSM 5,000 kg জরুরি নিটিং সাবকন্ট্রাক্ট',
            'fabric_type' => 'Single Jersey',
            'gsm' => '160 GSM',
            'dia' => 30,
            'gauge' => 24,
            'quantity_kg' => 5000,
            'target_rate_tk' => 14.0,
            'yarn_count' => '30/1 Combed Cotton',
            'location' => 'গাজীপুর',
            'delivery_deadline' => '2026-10-20',
            'description' => 'সুতা রেডি আছে, ২–৩টা ৩০×২৪জি মেশিন খালি থাকলে যোগাযোগ করুন।',
            'status' => 'open',
        ]);

        Quotation::create([
            'subcontract_post_id' => $post->id,
            'factory_id' => $f1->id,
            'bidder_name' => 'রহমান নিটিং ইন্ডাস্ট্রিজ',
            'bidder_phone' => '01711000001',
            'offered_rate_tk' => 14.0,
            'estimated_days' => 9,
            'allocated_machines' => 3,
            'note' => '৩টা Pailung 30"×24G মেশিন ৫ অক্টোবর থেকে খালি আছে।',
            'status' => 'accepted',
        ]);
    }
}

