<script lang="ts">
  import { billStore } from '$lib/stores/bill.svelte';
  
  let tipType = $state<'percentage' | 'fixed'>('percentage');
  let tipValue = $state('0');
  let taxAmount = $state('0');
  let isUpdating = $state(false);
  
  const TIP_PRESETS = [0, 10, 15, 18, 20, 25];
  
  // Sync with bill data
  $effect(() => {
    if (billStore.bill) {
      tipType = billStore.bill.tip_type;
      tipValue = billStore.bill.tip_value;
      taxAmount = billStore.bill.tax_amount;
    }
  });
  
  async function updateTip() {
    if (isUpdating) return;
    isUpdating = true;
    await billStore.updateBill({
      tip_type: tipType,
      tip_value: tipValue,
      tax_amount: taxAmount,
    });
    isUpdating = false;
  }
  
  function selectPreset(percentage: number) {
    tipType = 'percentage';
    tipValue = percentage.toString();
    updateTip();
  }
  
  function handleTipTypeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    tipType = target.value as 'percentage' | 'fixed';
    tipValue = '0';
    updateTip();
  }
  
  function handleTipValueBlur() {
    updateTip();
  }
  
  function handleTaxBlur() {
    updateTip();
  }
  
  function formatCurrency(amount: string): string {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }
</script>

<section class="tip-card">
  <div class="card-header">
    <h2>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
        <path d="M12 18V6"/>
      </svg>
      Tip & Tax
    </h2>
  </div>
  
  <div class="tip-presets">
    <span class="preset-label">Quick tip:</span>
    <div class="preset-buttons">
      {#each TIP_PRESETS as preset}
        <button
          class="preset-btn"
          class:active={tipType === 'percentage' && parseFloat(tipValue) === preset}
          onclick={() => selectPreset(preset)}
        >
          {preset}%
        </button>
      {/each}
    </div>
  </div>
  
  <div class="input-section">
    <div class="input-group">
      <label for="tipType">Tip Type</label>
      <select id="tipType" value={tipType} onchange={handleTipTypeChange}>
        <option value="percentage">Percentage</option>
        <option value="fixed">Fixed Amount</option>
      </select>
    </div>
    
    <div class="input-group">
      <label for="tipValue">
        {tipType === 'percentage' ? 'Tip %' : 'Tip Amount'}
      </label>
      <div class="input-with-symbol">
        {#if tipType === 'fixed'}
          <span class="symbol left">$</span>
        {/if}
        <input
          id="tipValue"
          type="number"
          bind:value={tipValue}
          onblur={handleTipValueBlur}
          step={tipType === 'percentage' ? '1' : '0.01'}
          min="0"
          class={tipType === 'fixed' ? 'with-left-symbol' : 'with-right-symbol'}
        />
        {#if tipType === 'percentage'}
          <span class="symbol right">%</span>
        {/if}
      </div>
    </div>
    
    <div class="input-group">
      <label for="taxAmount">Tax Amount</label>
      <div class="input-with-symbol">
        <span class="symbol left">$</span>
        <input
          id="taxAmount"
          type="number"
          bind:value={taxAmount}
          onblur={handleTaxBlur}
          step="0.01"
          min="0"
          class="with-left-symbol"
        />
      </div>
    </div>
  </div>
  
  {#if billStore.bill}
    <div class="summary-preview">
      <div class="summary-row">
        <span>Subtotal</span>
        <span class="value">{formatCurrency(billStore.bill.subtotal)}</span>
      </div>
      <div class="summary-row">
        <span>Tip</span>
        <span class="value tip">{formatCurrency(billStore.bill.tip_amount)}</span>
      </div>
      <div class="summary-row">
        <span>Tax</span>
        <span class="value">{formatCurrency(billStore.bill.tax_amount)}</span>
      </div>
      <div class="summary-row total">
        <span>Total</span>
        <span class="value">{formatCurrency(billStore.bill.total)}</span>
      </div>
    </div>
  {/if}
</section>

<style>
  .tip-card {
    background: white;
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e7eb;
  }
  
  .card-header {
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .card-header h2 {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
  
  .card-header h2 svg {
    color: #10b981;
  }
  
  .tip-presets {
    margin-bottom: 1rem;
  }
  
  .preset-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
    display: block;
    margin-bottom: 0.5rem;
  }
  
  .preset-buttons {
    display: flex;
    gap: 0.375rem;
    flex-wrap: wrap;
  }
  
  .preset-btn {
    padding: 0.375rem 0.75rem;
    background: #f3f4f6;
    border: 2px solid transparent;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 500;
    color: #4b5563;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .preset-btn:hover {
    background: #e5e7eb;
  }
  
  .preset-btn.active {
    background: #dcfce7;
    border-color: #22c55e;
    color: #166534;
  }
  
  .input-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .input-group label {
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
  }
  
  .input-group select {
    padding: 0.5rem 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
    background: white;
    cursor: pointer;
  }
  
  .input-group select:focus {
    border-color: #10b981;
  }
  
  .input-with-symbol {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  .symbol {
    position: absolute;
    color: #9ca3af;
    font-size: 0.875rem;
    pointer-events: none;
  }
  
  .symbol.left {
    left: 0.75rem;
  }
  
  .symbol.right {
    right: 0.75rem;
  }
  
  .input-with-symbol input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
  }
  
  .input-with-symbol input.with-left-symbol {
    padding-left: 1.5rem;
  }
  
  .input-with-symbol input.with-right-symbol {
    padding-right: 1.75rem;
  }
  
  .input-with-symbol input:focus {
    border-color: #10b981;
  }
  
  .summary-preview {
    background: #f9fafb;
    border-radius: 10px;
    padding: 0.875rem;
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.375rem 0;
    font-size: 0.875rem;
    color: #4b5563;
  }
  
  .summary-row .value {
    font-weight: 500;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
  
  .summary-row .value.tip {
    color: #10b981;
  }
  
  .summary-row.total {
    border-top: 2px solid #e5e7eb;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    font-weight: 600;
    font-size: 1rem;
    color: #1f2937;
  }
  
  .summary-row.total .value {
    font-size: 1.125rem;
    color: #10b981;
  }
</style>
