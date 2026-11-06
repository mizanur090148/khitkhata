<?php

namespace App\Services;

use App\Models\Factory;
use App\Models\FactoryMachine;
use App\Models\SubcontractPost;
use Illuminate\Support\Collection;

class SubcontractMatchService
{
    /**
     * Match idle factory machines against vendor requirements (Dia, Gauge, Area, Fabrication)
     * Combines shilposetu-old matching logic with KnitKhata free machine search.
     */
    public function findMatchingFreeMachines(?int $dia = null, ?int $gauge = null, ?string $area = null): Collection
    {
        $query = FactoryMachine::with('factory')
            ->where('broadcast_free', true);

        if ($dia) {
            $query->where('dia', $dia);
        }

        if ($gauge) {
            $query->where('gauge', $gauge);
        }

        $machines = $query->get();

        if ($area && $area !== 'all') {
            $machines = $machines->filter(function (FactoryMachine $m) use ($area) {
                return $m->factory && str_contains((string) $m->factory->area, $area);
            });
        }

        return $machines->values();
    }

    /**
     * Score factories for a subcontract post based on machine availability, dia/gauge match,
     * location proximity, and on-time delivery performance.
     */
    public function matchFactoriesForPost(SubcontractPost $post): array
    {
        $factories = Factory::with('machines')->get();
        $matches = [];

        foreach ($factories as $factory) {
            $score = 0;
            $matchingMachines = $factory->machines->filter(function (FactoryMachine $m) use ($post) {
                $diaMatch = !$post->dia || $m->dia === (int) $post->dia;
                $gaugeMatch = !$post->gauge || $m->gauge === (int) $post->gauge;
                $isIdle = !str_starts_with($m->status, 'run') && $m->status !== 'down';
                return $diaMatch && $gaugeMatch && $isIdle;
            });

            if ($matchingMachines->count() > 0) {
                $score += min(50, $matchingMachines->count() * 15);
            }

            if ($post->location && str_contains((string) $factory->area, $post->location)) {
                $score += 20;
            }

            $score += (int) round(($factory->ontime_delivery_pct / 100) * 30);

            $matches[] = [
                'factory_id' => $factory->id,
                'factory_code' => $factory->code,
                'factory_name' => $factory->name,
                'area' => $factory->area,
                'matching_idle_machines' => $matchingMachines->count(),
                'ontime_delivery_pct' => $factory->ontime_delivery_pct,
                'qc_reject_pct' => $factory->qc_reject_pct,
                'match_score' => min(100, $score),
            ];
        }

        usort($matches, fn (array $a, array $b) => $b['match_score'] <=> $a['match_score']);

        return $matches;
    }
}

