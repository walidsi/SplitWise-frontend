<script lang="ts">
  import { billStore } from '$lib/stores/bill.svelte';
  
  let newParticipantName = $state('');
  let isAdding = $state(false);
  let editingId = $state<string | null>(null);
  let editName = $state('');
  
  const COLORS = [
    '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6',
    '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6',
    '#10b981', '#22c55e', '#84cc16', '#eab308', '#f97316',
  ];
  
  function getRandomColor(): string {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }
  
  async function addParticipant() {
    if (!newParticipantName.trim()) return;
    
    isAdding = true;
    await billStore.addParticipant(newParticipantName.trim(), getRandomColor());
    newParticipantName = '';
    isAdding = false;
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      addParticipant();
    }
  }
  
  function startEdit(id: string, name: string) {
    editingId = id;
    editName = name;
  }
  
  async function saveEdit() {
    if (editingId && editName.trim()) {
      await billStore.updateParticipant(editingId, { name: editName.trim() });
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
  
  async function changeColor(id: string) {
    const newColor = getRandomColor();
    await billStore.updateParticipant(id, { color: newColor });
  }
  
  async function removeParticipant(id: string) {
    await billStore.removeParticipant(id);
  }
  
  function formatCurrency(amount: string): string {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }
</script>

<section class="participants-card">
  <div class="card-header">
    <h2>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
      Participants
    </h2>
    <span class="count">{billStore.bill?.participants?.length || 0}</span>
  </div>
  
  <div class="add-participant">
    <input
      type="text"
      placeholder="Add participant..."
      bind:value={newParticipantName}
      onkeydown={handleKeydown}
      disabled={isAdding}
    />
    <button onclick={addParticipant} disabled={isAdding || !newParticipantName.trim()}>
      {#if isAdding}
        <span class="spinner-small"></span>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <line x1="19" y1="8" x2="19" y2="14"/>
          <line x1="22" y1="11" x2="16" y2="11"/>
        </svg>
      {/if}
    </button>
  </div>
  
  <ul class="participants-list">
    {#if billStore.bill?.participants}
      {#each billStore.bill.participants as participant (participant.id)}
        <li class="participant-item">
          <button
            class="color-dot"
            style="background-color: {participant.color}"
            onclick={() => changeColor(participant.id)}
            title="Click to change color"
          ></button>
          
          <div class="participant-info">
            {#if editingId === participant.id}
              <input
                type="text"
                bind:value={editName}
                onblur={saveEdit}
                onkeydown={handleEditKeydown}
                class="edit-input"
                autofocus
              />
            {:else}
              <button class="name" onclick={() => startEdit(participant.id, participant.name)}>
                {participant.name}
              </button>
            {/if}
            <span class="amount" style="color: {participant.color}">
              {formatCurrency(participant.total_owed)}
            </span>
          </div>
          
          <button
            class="remove-btn"
            onclick={() => removeParticipant(participant.id)}
            title="Remove participant"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </li>
      {/each}
    {/if}
  </ul>
  
  {#if !billStore.bill?.participants?.length}
    <div class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
      <p>Add people to split the bill</p>
    </div>
  {/if}
</section>

<style>
  .participants-card {
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
    color: #6366f1;
  }
  
  .count {
    background: #f3f4f6;
    color: #6b7280;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
  }
  
  .add-participant {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .add-participant input {
    flex: 1;
    padding: 0.625rem 0.875rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.2s;
  }
  
  .add-participant input:focus {
    border-color: #6366f1;
  }
  
  .add-participant button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .add-participant button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }
  
  .add-participant button:disabled {
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
  
  .participants-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .participant-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 10px;
    transition: background 0.2s;
  }
  
  .participant-item:hover {
    background: #f3f4f6;
  }
  
  .color-dot {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: transform 0.2s;
    flex-shrink: 0;
  }
  
  .color-dot:hover {
    transform: scale(1.15);
  }
  
  .participant-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }
  
  .name {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: #1f2937;
    text-align: left;
    cursor: pointer;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .name:hover {
    color: #6366f1;
  }
  
  .edit-input {
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.25rem 0.5rem;
    border: 2px solid #6366f1;
    border-radius: 6px;
    outline: none;
    width: 100%;
  }
  
  .amount {
    font-size: 0.8rem;
    font-weight: 600;
  }
  
  .remove-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
  }
  
  .remove-btn:hover {
    background: #fee2e2;
    color: #ef4444;
  }
  
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    color: #9ca3af;
    text-align: center;
  }
  
  .empty-state svg {
    margin-bottom: 0.75rem;
    opacity: 0.5;
  }
  
  .empty-state p {
    font-size: 0.875rem;
    margin: 0;
  }
</style>
