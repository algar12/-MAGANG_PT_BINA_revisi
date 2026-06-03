<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('production_costings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('production_orders')->cascadeOnDelete();
            $table->foreignId('material_id')->constrained('materials')->cascadeOnDelete();
            $table->foreignId('device_id')->nullable()->constrained('devices')->nullOnDelete();
            $table->decimal('qty_required', 10, 2)->default(0);
            $table->decimal('netto_produksi', 10, 2)->nullable();
            $table->decimal('price_bom', 15, 2)->default(0);
            $table->decimal('sub_cost_price', 15, 2)->nullable();
            $table->enum('status', ['Pending', 'Weighed', 'Completed'])->default('Pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('production_costings');
    }
};
