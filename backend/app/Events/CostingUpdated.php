<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CostingUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly int $order_id
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('costing.' . $this->order_id)
        ];
    }

    public function broadcastAs(): string
    {
        return 'costing.updated';
    }
}
