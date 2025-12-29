<script lang="ts">
  import { billStore } from '$lib/stores/bill.svelte';
  import type { BillItem } from '$lib/api/client';
  
  let newItemName = $state('');
  let newItemPrice = $state('');
  let newItemQuantity = $state(1);
  let isAdding = $state(false);
  let editingId = $state<string | null>(null);
  let editData = $state({ name: '', price: '', quantity: 1 });
  let expandedItem = $state<string | null>(null);
  
  async function addItem() {
    if (!newItemName.trim() || !newItemPrice) return;
    
    isAdding = true;
    await billStore.addItem(newItemName.trim(), newItemPrice, newItemQuantity);
    newItemName = '';
    newItemPrice = '';
    newItemQuantity = 1;
    isAdding = false;
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      addItem();
    }
  }
  
  function startEdit(item: BillItem) {
    editingId = item.id;
    editData = {
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    };
  }
  
  async function saveEdit() {
    if (editingId && editData.name.trim() && editData.price) {
      await billStore.updateItem(editingId, {
        name: editData.name.trim(),
        price: editData.price,
        quantity: editData.quantity,
      });
    }
    editingId = null;
  }
  
  function handleEditKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      editingId = null;
    }
  }
  
  async function removeItem(id: string) {
    await billStore.removeItem(id);
  }
  
  async function splitEqually(itemId: string) {
    await billStore.splitItemEqually(itemId);
  }
  
  async function toggleParticipantSplit(itemId: string, participantId: string) {
    const item = billStore.bill?.items.find(i => i.id === itemId);
    if (!item || !billStore.bill?.participants) return;
    
    const currentSplit = item.splits.find(s => s.participant === participantId);
    const otherSplits = item.splits.filter(s => s.participant !== participantId);
    
    let newSplits: { participant_id: string; share: string }[];
    
    if (currentSplit) {
      // Remove this participant
      const count = otherSplits.length;
      if (count === 0) {
        newSplits = [];
      } else {
        const share = (1 / count).toFixed(4);
        newSplits = otherSplits.map(s => ({
          participant_id: s.participant,
          share,
        }));
      }
    } else {
      // Add this participant
      const count = otherSplits.length + 1;
      const share = (1 / count).toFixed(4);
      newSplits = [
        ...otherSplits.map(s => ({
          participant_id: s.participant,
          share,
        })),
        { participant_id: participantId, share },
      ];
    }
    
    await billStore.updateItemSplits(itemId, newSplits);
  }
  
  function toggleExpanded(id: string) {
    expandedItem = expandedItem === id ? null : id;
  }
  
  function formatCurrency(amount: string): string {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }
  
  function getSplitParticipants(item: BillItem): string[] {
    return item.splits.map(s => s.participant);
  }
</script>

<section class="items-card">
  <div class="card-header">
    <h2>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z"/>
        <path d="M6 9.01V9"/>
        <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/>
      </svg>
      Bill Items
    </h2>
    <span class="count">{billStore.bill?.items?.length || 0}</span>
  </div>
  
  <div class="add-item">
    <div class="add-row">
      <input
        type="text"
        placeholder="Item name..."
        bind:value={newItemName}
        onkeydown={handleKeydown}
        disabled={isAdding}
        class="name-input"
      />
      <div class="price-input-wrapper">
        <span class="currency-symbol">$</span>
        <input
          type="number"
          placeholder="0.00"
          bind:value={newItemPrice}
          onkeydown={handleKeydown}
          disabled={isAdding}
          class="price-input"
          step="0.01"
          min="0"
        />
      </div>
      <input
        type="number"
        placeholder="Qty"
        bind:value={newItemQuantity}
        onkeydown={handleKeydown}
        disabled={isAdding}
        class="qty-input"
        min="1"
      />
      <button onclick={addItem} disabled={isAdding || !newItemName.trim() || !newItemPrice} class="add-btn">
        {#if isAdding}
          <span class="spinner-small"></span>
        {:else}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        {/if}
      </button>
    </div>
  </div>
  
  <ul class="items-list">
    {#if billStore.bill?.items}
      {#each billStore.bill.items as item (item.id)}
        <li class="item-card" class:expanded={expandedItem === item.id}>
          {#if editingId === item.id}
            <div class="edit-form">
              <input
                type="text"
                bind:value={editData.name}
                onkeydown={handleEditKeydown}
                class="edit-name"
                autofocus
              />
              <div class="edit-row">
                <div class="price-input-wrapper small">
                  <span class="currency-symbol">$</span>
                  <input
                    type="number"
                    bind:value={editData.price}
                    onkeydown={handleEditKeydown}
                    class="edit-price"
                    step="0.01"
                    min="0"
                  />
                </div>
                <input
                  type="number"
                  bind:value={editData.quantity}
                  onkeydown={handleEditKeydown}
                  class="edit-qty"
                  min="1"
                />
                <button class="save-btn" onclick={saveEdit}>Save</button>
                <button class="cancel-btn" onclick={() => editingId = null}>Cancel</button>
              </div>
            </div>
          {:else}
            <button class="item-main" onclick={() => toggleExpanded(item.id)}>
              <div class="item-info">
                <span class="item-name">{item.name}</span>
                <span class="item-details">
                  {formatCurrency(item.price)} × {item.quantity}
                </span>
              </div>
              <div class="item-right">
                <span class="item-total">{formatCurrency(item.total_price)}</span>
                <div class="split-avatars">
                  {#each item.splits as split}
                    <div
                      class="avatar"
                      style="background-color: {split.participant_color}"
                      title="{split.participant_name} ({(parseFloat(split.share) * 100).toFixed(0)}%)"
                    >
                      {split.participant_name.charAt(0).toUpperCase()}
                    </div>
                  {/each}
                  {#if item.splits.length === 0}
                    <span class="no-split">Unassigned</span>
                  {/if}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chevron">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </button>
            
            {#if expandedItem === item.id}
              <div class="item-expanded">
                <div class="split-section">
                  <span class="split-label">Split among:</span>
                  <div class="participant-toggles">
                    {#if billStore.bill?.participants}
                      {#each billStore.bill.participants as participant}
                        {@const isSelected = getSplitParticipants(item).includes(participant.id)}
                        <button
                          class="participant-toggle"
                          class:selected={isSelected}
                          style="--participant-color: {participant.color}"
                          onclick={() => toggleParticipantSplit(item.id, participant.id)}
                        >
                          <span
                            class="toggle-dot"
                            style="background-color: {participant.color}"
                          ></span>
                          {participant.name}
                        </button>
                      {/each}
                    {/if}
                  </div>
                  <button class="split-all-btn" onclick={() => splitEqually(item.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    Split equally among all
                  </button>
                </div>
                
                <div class="item-actions">
                  <button class="edit-btn" onclick={() => startEdit(item)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                    </svg>
                    Edit
                  </button>
                  <button class="delete-btn" onclick={() => removeItem(item.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            {/if}
          {/if}
        </li>
      {/each}
    {/if}
  </ul>
  
  {#if !billStore.bill?.items?.length}
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z"/>
        <path d="M6 9.01V9"/>
        <path d="m15 5 6.3 6.3a2.4 2.4 0 0 1 0 3.4L17 19"/>
      </svg>
      <p>Add items from your bill</p>
      <span class="hint">Enter item name, price, and quantity</span>
    </div>
  {/if}
</section>

<style>
  .items-card {
    background: white;
    border-radius: 16px;
    padding: 1.25rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid #e5e7eb;
  }
  
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
    color: #f97316;
  }
  
  .count {
    background: #f3f4f6;
    color: #6b7280;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
  }
  
  .add-item {
    margin-bottom: 1rem;
  }
  
  .add-row {
    display: flex;
    gap: 0.5rem;
    align-items: stretch;
  }
  
  .name-input {
    flex: 2;
    padding: 0.625rem 0.875rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
  }
  
  .name-input:focus {
    border-color: #f97316;
  }
  
  .price-input-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
  }
  
  .price-input-wrapper.small {
    flex: none;
    width: 100px;
  }
  
  .currency-symbol {
    position: absolute;
    left: 0.75rem;
    color: #9ca3af;
    font-size: 0.875rem;
    pointer-events: none;
  }
  
  .price-input {
    width: 100%;
    padding: 0.625rem 0.875rem 0.625rem 1.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
  }
  
  .price-input:focus {
    border-color: #f97316;
  }
  
  .qty-input {
    width: 60px;
    padding: 0.625rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    font-size: 0.875rem;
    outline: none;
    text-align: center;
    transition: border-color 0.2s;
  }
  
  .qty-input:focus {
    border-color: #f97316;
  }
  
  .add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .add-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
  }
  
  .add-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .spinner-small {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .items-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .item-card {
    background: #f9fafb;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s;
    border: 2px solid transparent;
  }
  
  .item-card:hover {
    background: #f3f4f6;
  }
  
  .item-card.expanded {
    border-color: #f97316;
    background: #fff7ed;
  }
  
  .item-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.875rem;
    cursor: pointer;
    width: 100%;
    background: none;
    border: none;
    text-align: left;
  }
  
  .item-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }
  
  .item-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: #1f2937;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .item-details {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .item-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .item-total {
    font-size: 0.95rem;
    font-weight: 600;
    color: #1f2937;
  }
  
  .split-avatars {
    display: flex;
    margin-left: 0.25rem;
  }
  
  .avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    font-weight: 600;
    color: white;
    border: 2px solid white;
    margin-left: -8px;
    text-transform: uppercase;
  }
  
  .avatar:first-child {
    margin-left: 0;
  }
  
  .no-split {
    font-size: 0.7rem;
    color: #9ca3af;
    font-style: italic;
  }
  
  .chevron {
    color: #9ca3af;
    transition: transform 0.2s;
  }
  
  .expanded .chevron {
    transform: rotate(180deg);
  }
  
  .item-expanded {
    padding: 0 0.875rem 0.875rem;
    border-top: 1px solid #fed7aa;
  }
  
  .split-section {
    padding-top: 0.75rem;
  }
  
  .split-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    display: block;
    margin-bottom: 0.5rem;
  }
  
  .participant-toggles {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-bottom: 0.75rem;
  }
  
  .participant-toggle {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.625rem;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .participant-toggle:hover {
    border-color: var(--participant-color);
  }
  
  .participant-toggle.selected {
    background: var(--participant-color);
    border-color: var(--participant-color);
    color: white;
  }
  
  .toggle-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  
  .participant-toggle.selected .toggle-dot {
    background-color: white !important;
  }
  
  .split-all-btn {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.5rem 0.75rem;
    background: #fef3c7;
    border: 1px solid #fcd34d;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    color: #92400e;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
    justify-content: center;
  }
  
  .split-all-btn:hover {
    background: #fde68a;
  }
  
  .item-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #fed7aa;
  }
  
  .edit-btn, .delete-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.5rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .edit-btn {
    background: #e0e7ff;
    border: 1px solid #a5b4fc;
    color: #4338ca;
  }
  
  .edit-btn:hover {
    background: #c7d2fe;
  }
  
  .delete-btn {
    background: #fee2e2;
    border: 1px solid #fca5a5;
    color: #dc2626;
  }
  
  .delete-btn:hover {
    background: #fecaca;
  }
  
  .edit-form {
    padding: 0.875rem;
  }
  
  .edit-name {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 2px solid #f97316;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    outline: none;
  }
  
  .edit-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  
  .edit-price {
    width: 100%;
    padding: 0.5rem 0.75rem 0.5rem 1.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    outline: none;
  }
  
  .edit-price:focus {
    border-color: #f97316;
  }
  
  .edit-qty {
    width: 60px;
    padding: 0.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 0.875rem;
    text-align: center;
    outline: none;
  }
  
  .edit-qty:focus {
    border-color: #f97316;
  }
  
  .save-btn, .cancel-btn {
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .save-btn {
    background: #10b981;
    border: none;
    color: white;
  }
  
  .save-btn:hover {
    background: #059669;
  }
  
  .cancel-btn {
    background: white;
    border: 1px solid #e5e7eb;
    color: #6b7280;
  }
  
  .cancel-btn:hover {
    background: #f3f4f6;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem;
    color: #9ca3af;
    text-align: center;
  }
  
  .empty-state svg {
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  .empty-state p {
    font-size: 0.95rem;
    margin: 0 0 0.25rem;
    color: #6b7280;
  }
  
  .hint {
    font-size: 0.8rem;
  }
</style>
