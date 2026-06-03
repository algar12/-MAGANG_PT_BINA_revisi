<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WeightReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string $device_id,
        public readonly string $device_name,
        public readonly float $weight,
        public readonly string $unit = 'KG'
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('scale.' . $this->device_id)
        ];
    }

    public function broadcastAs(): string
    {
        return 'weight.received';
    }

    public function broadcastWith(): array
    {
        return [
            'device_id' => $this->device_id,
            'device_name' => $this->device_name,
            'weight' => $this->weight,
            'unit' => $this->unit,
            'timestamp' => now()->toISOString(),
        ];
    }
}
