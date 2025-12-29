<script lang="ts">
  import { billStore } from '$lib/stores/bill.svelte';
  
  let isEditing = $state(false);
  let editName = $state('');
  
  function startEdit() {
    editName = billStore.bill?.name || 'New Bill';
    isEditing = true;
  }
  
  async function saveName() {
    if (editName.trim()) {
      await billStore.updateBill({ name: editName.trim() });
    }
    isEditing = false;
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      saveName();
    } else if (e.key === 'Escape') {
      isEditing = false;
    }
  }
</script>

<header class="header">
  <div class="header-content">
    <div class="logo">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="M7 15h0M2 9.5h20"/>
      </svg>
      <span class="logo-text">SplitWise</span>
    </div>
    
    {#if billStore.bill}
      <div class="bill-name">
        {#if isEditing}
          <input
            type="text"
            bind:value={editName}
            onblur={saveName}
            onkeydown={handleKeydown}
            class="name-input"
            autofocus
          />
        {:else}
          <button class="name-button" onclick={startEdit}>
            <span>{billStore.bill.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            </svg>
          </button>
        {/if}
      </div>
    {/if}
    
    <div class="header-right">
      {#if billStore.bill}
        <span class="bill-id">ID: {billStore.bill.id.slice(0, 8)}...</span>
      {/if}
    </div>
  </div>
</header>

<style>
  .header {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    color: white;
    padding: 1rem 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  .header-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
  }
  
  .logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #22d3ee;
  }
  
  .logo-text {
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, #22d3ee 0%, #a78bfa 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .bill-name {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  
  .name-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 1.125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .name-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
  
  .name-button svg {
    opacity: 0.6;
    transition: opacity 0.2s;
  }
  
  .name-button:hover svg {
    opacity: 1;
  }
  
  .name-input {
    background: rgba(255, 255, 255, 0.15);
    border: 2px solid #22d3ee;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 1.125rem;
    font-weight: 500;
    outline: none;
    min-width: 200px;
    text-align: center;
  }
  
  .header-right {
    display: flex;
    align-items: center;
  }
  
  .bill-id {
    font-family: 'SF Mono', 'Fira Code', monospace;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.1);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
  }
  
  @media (max-width: 768px) {
    .header-content {
      flex-wrap: wrap;
    }
    
    .bill-name {
      order: 3;
      width: 100%;
      justify-content: center;
      margin-top: 0.5rem;
    }
    
    .header-right {
      display: none;
    }
  }
</style>
