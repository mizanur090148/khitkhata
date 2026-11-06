<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use App\Models\JobApplication;
use App\Models\JobListing;
use App\Models\MessageThread;
use App\Models\Quotation;
use App\Models\SubcontractPost;
use App\Models\Supplier;
use App\Models\SupplierRfq;
use App\Services\SubcontractMatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicAndMarketplaceController extends Controller
{
    public function __construct(
        private readonly SubcontractMatchService $matchService
    ) {}

    public function jobs(): JsonResponse
    {
        return $this->success(JobListing::orderByDesc('id')->get());
    }

    public function storeJob(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role_title' => ['required', 'string', 'max:150'],
            'company_name' => ['required', 'string', 'max:150'],
            'area' => ['required', 'string', 'max:120'],
            'category' => ['required', 'string', 'in:op,sup,tech,qc,mer'],
            'shift_label' => ['nullable', 'string'],
            'experience_label' => ['nullable', 'string'],
            'salary_label' => ['nullable', 'string'],
            'contact_phone' => ['required', 'string', 'max:30'],
            'vacancies' => ['nullable', 'integer', 'min:1'],
            'requirements' => ['nullable', 'array'],
        ]);

        $job = JobListing::create([
            'role_title' => $validated['role_title'],
            'company_name' => $validated['company_name'],
            'area' => $validated['area'],
            'category' => $validated['category'],
            'shift_label' => $validated['shift_label'] ?? 'শিফট A / B',
            'experience_label' => $validated['experience_label'] ?? 'কমপক্ষে ১ বছর',
            'salary_label' => $validated['salary_label'] ?: 'আলোচনা সাপেক্ষে',
            'posted_label' => 'এইমাত্র',
            'contact_phone' => $validated['contact_phone'],
            'is_new' => true,
            'vacancies' => $validated['vacancies'] ?? 1,
            'requirements_json' => !empty($validated['requirements'])
                ? $validated['requirements']
                : [($validated['experience_label'] ?? '১ বছর') . ' নিটিং ফ্লোরের অভিজ্ঞতা', ($validated['shift_label'] ?? 'শিফট') . '-এ কাজ করতে আগ্রহী'],
        ]);

        return $this->success($job, 'চাকরির বিজ্ঞাপন প্রকাশিত হয়েছে', 201);
    }

    public function applyJob(Request $request, int $jobId): JsonResponse
    {
        $validated = $request->validate([
            'applicant_name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:30'],
            'experience' => ['required', 'string', 'max:80'],
            'current_area' => ['nullable', 'string', 'max:120'],
            'note' => ['nullable', 'string'],
        ]);

        $job = JobListing::findOrFail($jobId);
        $application = JobApplication::create([
            'job_listing_id' => $job->id,
            'applicant_name' => $validated['applicant_name'],
            'phone' => $validated['phone'],
            'experience' => $validated['experience'],
            'current_area' => $validated['current_area'] ?? $job->area,
            'note' => $validated['note'] ?? null,
        ]);

        return $this->success($application, "আবেদন জমা হয়েছে · {$job->company_name} ফোনে যোগাযোগ করবে", 201);
    }

    public function storeRfq(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['nullable', 'string'],
            'item_name' => ['required', 'string'],
            'qty_label' => ['required', 'string'],
            'area' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],
            'note' => ['nullable', 'string'],
        ]);

        $rfqNo = 'RFQ-' . (SupplierRfq::count() + 119);
        $rfq = SupplierRfq::create([
            'rfq_no' => $rfqNo,
            'factory_code' => 'f1',
            'category' => $validated['category'] ?? 'spare',
            'item_name' => $validated['item_name'],
            'qty_label' => $validated['qty_label'],
            'area' => $validated['area'] ?? 'গাজীপুর',
            'phone' => $validated['phone'] ?? '01711000000',
            'need_by_label' => '10 Oct',
            'status' => 'new',
            'note' => $validated['note'] ?? '',
        ]);

        return $this->success($rfq, 'কোটেশন অনুরোধ ৩ জন অনুমোদিত সাপ্লায়ারের কাছে পাঠানো হয়েছে', 201);
    }

    public function quoteRfq(Request $request, string $rfqNo): JsonResponse
    {
        $validated = $request->validate([
            'quoted_price' => ['required', 'string'],
            'delivery_days' => ['nullable', 'string'],
            'note' => ['nullable', 'string'],
        ]);

        $rfq = SupplierRfq::where('rfq_no', $rfqNo)->firstOrFail();
        $rfq->update([
            'status' => 'quoted',
            'quoted_price' => $validated['quoted_price'],
            'delivery_days' => $validated['delivery_days'] ?: '১ দিন',
            'note' => $validated['note'] ?? $rfq->note,
        ]);

        return $this->success($rfq, 'কোটেশন পাঠানো হয়েছে');
    }

    public function storeAd(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'org_name' => ['required', 'string'],
            'placement' => ['required', 'string'],
            'title' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'cta_label' => ['nullable', 'string'],
            'duration_label' => ['nullable', 'string'],
            'contact_phone' => ['nullable', 'string'],
        ]);

        $ad = Advertisement::create($validated + ['status' => 'active']);

        return $this->success($ad, 'বিজ্ঞাপন জমা হয়েছে — রিভিউর পর চালু হবে', 201);
    }

    public function sendMessage(Request $request, string $threadCode): JsonResponse
    {
        $validated = $request->validate([
            'sender_side' => ['required', 'string'], // fac, ven, sys, me, them
            'sender_name' => ['nullable', 'string'],
            'txt' => ['nullable', 'string'],
            'voice' => ['nullable', 'array'],
            'photo' => ['nullable', 'string'],
            'file' => ['nullable', 'array'],
        ]);

        $thread = MessageThread::where('thread_code', $threadCode)->firstOrFail();
        $msgs = $thread->messages_json ?? [];
        $msgs[] = array_filter([
            's' => $validated['sender_side'],
            'who' => $validated['sender_side'] === 'ven' ? 'me' : ($validated['sender_side'] === 'sys' ? 'sys' : 'them'),
            'n' => $validated['sender_name'] ?? '',
            't' => 'এখন',
            'txt' => $validated['txt'] ?? null,
            'voice' => $validated['voice'] ?? null,
            'photo' => $validated['photo'] ?? null,
            'file' => $validated['file'] ?? null,
        ], fn ($v) => $v !== null);

        $thread->update([
            'messages_json' => $msgs,
            'unread_count' => 0,
        ]);

        return $this->success($thread, 'মেসেজ পাঠানো হয়েছে');
    }

    public function subcontractMatches(Request $request): JsonResponse
    {
        $dia = $request->integer('dia') ?: null;
        $gauge = $request->integer('gauge') ?: null;
        $area = $request->string('area')->toString() ?: null;

        return $this->success(
            $this->matchService->findMatchingFreeMachines($dia, $gauge, $area)
        );
    }

    public function storeSubcontractPost(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'post_type' => ['required', 'in:work_offer,machine_available'],
            'title' => ['required', 'string'],
            'fabric_type' => ['required', 'string'],
            'gsm' => ['nullable', 'string'],
            'dia' => ['nullable', 'integer'],
            'gauge' => ['nullable', 'integer'],
            'quantity_kg' => ['required', 'numeric'],
            'target_rate_tk' => ['nullable', 'numeric'],
            'yarn_count' => ['nullable', 'string'],
            'location' => ['nullable', 'string'],
            'delivery_deadline' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
        ]);

        $post = SubcontractPost::create($validated + ['status' => 'open']);
        $matches = $this->matchService->matchFactoriesForPost($post);

        return $this->success([
            'post' => $post,
            'recommended_factories' => $matches,
        ], 'সাবকন্ট্রাক্ট পোস্ট তৈরি হয়েছে', 201);
    }

    public function storeQuotation(Request $request, int $postId): JsonResponse
    {
        $validated = $request->validate([
            'bidder_name' => ['required', 'string'],
            'bidder_phone' => ['nullable', 'string'],
            'offered_rate_tk' => ['required', 'numeric'],
            'estimated_days' => ['required', 'integer'],
            'allocated_machines' => ['required', 'integer'],
            'note' => ['nullable', 'string'],
        ]);

        $post = SubcontractPost::findOrFail($postId);
        $quote = Quotation::create($validated + [
            'subcontract_post_id' => $post->id,
            'status' => 'pending',
        ]);

        return $this->success($quote, 'কোটেশন জমা হয়েছে', 201);
    }
}

