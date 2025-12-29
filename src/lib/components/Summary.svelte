<script lang="ts">
  import { billStore } from '$lib/stores/bill.svelte';
  
  let expandedParticipant = $state<string | null>(null);
  
  function toggleExpanded(id: string) {
    expandedParticipant = expandedParticipant === id ? null : id;
  }
  
  function formatCurrency(amount: string): string {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }
</script>

<section class="summary-card">
  <div class="card-header">
    <h2>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
      Summary
    </h2>
  </div>
  
  {#if billStore.summary}
    <div class="bill-totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span class="value">{formatCurrency(billStore.summary.bill_subtotal)}</span>
      </div>
      <div class="total-row">
        <span>Tip</span>
        <span class="value">{formatCurrency(billStore.summary.bill_tip)}</span>
      </div>
      <div class="total-row">
        <span>Tax</span>
        <span class="value">{formatCurrency(billStore.summary.bill_tax)}</span>
      </div>
      <div class="total-row grand-total">
        <span>Grand Total</span>
        <span class="value">{formatCurrency(billStore.summary.bill_total)}</span>
      </div>
    </div>
    
    <div class="participants-summary">
      <h3>Who Owes What</h3>
      
      {#if billStore.summary.participants.length === 0}
        <div class="empty-summary">
          <p>Add participants and assign items to see the breakdown</p>
        </div>
      {:else}
        <ul class="summary-list">
          {#each billStore.summary.participants as participant (participant.participant_id)}
            <li class="participant-summary" class:expanded={expandedParticipant === participant.participant_id}>
              <button class="summary-header" onclick={() => toggleExpanded(participant.participant_id)}>
                <div class="participant-avatar" style="background-color: {participant.participant_color}">
                  {participant.participant_name.charAt(0).toUpperCase()}
                </div>
                <div class="participant-main">
                  <span class="participant-name">{participant.participant_name}</span>
                  <span class="participant-total" style="color: {participant.participant_color}">
                    {formatCurrency(participant.total_owed)}
                  </span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>
              
              {#if expandedParticipant === participant.participant_id}
                <div class="participant-details">
                  <div class="detail-section">
                    <span class="detail-label">Items</span>
                    {#if participant.items.length > 0}
                      <ul class="item-list">
                        {#each participant.items as item}
                          <li class="item-row">
                            <span class="item-name">{item.item_name}</span>
                            <span class="item-share">
                              {(parseFloat(item.share) * 100).toFixed(0)}%
                            </span>
                            <span class="item-amount">{formatCurrency(item.amount)}</span>
                          </li>
                        {/each}
                      </ul>
                    {:else}
                      <p class="no-items">No items assigned</p>
                    {/if}
                  </div>
                  
                  <div class="detail-breakdown">
                    <div class="breakdown-row">
                      <span>Items Total</span>
                      <span>{formatCurrency(participant.items_total)}</span>
                    </div>
                    <div class="breakdown-row">
                      <span>Tip Share</span>
                      <span>{formatCurrency(participant.tip_share)}</span>
                    </div>
                    <div class="breakdown-row">
                      <span>Tax Share</span>
                      <span>{formatCurrency(participant.tax_share)}</span>
                    </div>
                    <div class="breakdown-row total">
                      <span>Total</span>
                      <span style="color: {participant.participant_color}">
                        {formatCurrency(participant.total_owed)}
                      </span>
                    </div>
                  </div>
                </div>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  {:else}
    <div class="loading-summary">
      <div class="spinner"></div>
      <p>Loading summary...</p>
    </div>
  {/if}
</section>

<style>
  .summary-card {
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
    color: #8b5cf6;
  }
  
  .bill-totals {
    background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1.25rem;
    border: 1px solid #e9d5ff;
  }
  
  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.375rem 0;
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .total-row .value {
    font-weight: 500;
    font-family: 'SF Mono', 'Fira Code', monospace;
    color: #4b5563;
  }
  
  .total-row.grand-total {
    border-top: 2px solid #d8b4fe;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    font-weight: 600;
    font-size: 1.125rem;
    color: #1f2937;
  }
  
  .total-row.grand-total .value {
    font-size: 1.25rem;
    color: #7c3aed;
  }
  
  .participants-summary h3 {
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
    margin: 0 0 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .empty-summary {
    text-align: center;
    padding: 2rem;
    color: #9ca3af;
  }
  
  .empty-summary p {
    margin: 0;
    font-size: 0.875rem;
  }
  
  .summary-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .participant-summary {
    background: #f9fafb;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s;
    border: 2px solid transparent;
  }
  
  .participant-summary:hover {
    background: #f3f4f6;
  }
  
  .participant-summary.expanded {
    border-color: #8b5cf6;
    background: #faf5ff;
  }
  
  .summary-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem;
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
  }
  
  .participant-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  .participant-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }
  
  .participant-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .participant-total {
    font-size: 1rem;
    font-weight: 700;
  }
  
  .chevron {
    color: #9ca3af;
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  
  .expanded .chevron {
    transform: rotate(180deg);
  }
  
  .participant-details {
    padding: 0 0.875rem 0.875rem;
    border-top: 1px solid #e9d5ff;
  }
  
  .detail-section {
    padding-top: 0.75rem;
  }
  
  .detail-label {
    font-size: 0.7rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: block;
    margin-bottom: 0.5rem;
  }
  
  .item-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
  
  .item-row {
    display: flex;
    align-items: center;
    font-size: 0.8rem;
    padding: 0.375rem 0.5rem;
    background: white;
    border-radius: 6px;
  }
  
  .item-row .item-name {
    flex: 1;
    color: #4b5563;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .item-row .item-share {
    color: #9ca3af;
    font-size: 0.7rem;
    margin-right: 0.5rem;
    background: #f3f4f6;
    padding: 0.125rem 0.375rem;
    border-radius: 4px;
  }
  
  .item-row .item-amount {
    font-weight: 500;
    font-family: 'SF Mono', 'Fira Code', monospace;
    color: #1f2937;
  }
  
  .no-items {
    font-size: 0.8rem;
    color: #9ca3af;
    font-style: italic;
    margin: 0;
    padding: 0.5rem 0;
  }
  
  .detail-breakdown {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px dashed #e9d5ff;
  }
  
  .breakdown-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
    font-size: 0.8rem;
    color: #6b7280;
  }
  
  .breakdown-row span:last-child {
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
  
  .breakdown-row.total {
    border-top: 1px solid #e9d5ff;
    margin-top: 0.375rem;
    padding-top: 0.5rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: #1f2937;
  }
  
  .loading-summary {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem;
    color: #9ca3af;
  }
  
  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #e5e7eb;
    border-top-color: #8b5cf6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 0.75rem;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .loading-summary p {
    margin: 0;
    font-size: 0.875rem;
  }
</style>
