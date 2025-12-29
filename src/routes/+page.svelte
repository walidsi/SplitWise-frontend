<script lang="ts">
  import { onMount } from 'svelte';
  import { billStore } from '$lib/stores/bill.svelte';
  import Header from '$lib/components/Header.svelte';
  import ParticipantsList from '$lib/components/ParticipantsList.svelte';
  import ItemsList from '$lib/components/ItemsList.svelte';
  import TipCalculator from '$lib/components/TipCalculator.svelte';
  import Summary from '$lib/components/Summary.svelte';

  let mounted = $state(false);

  onMount(async () => {
    // Check for existing bill ID in URL or localStorage
    const params = new URLSearchParams(window.location.search);
    const billId = params.get('bill');
    const storedBillId = localStorage.getItem('currentBillId');

    if (billId) {
      try {
        await billStore.loadBill(billId);
        localStorage.setItem('currentBillId', billId);
      } catch {
        // Bill not found, create new one
        const bill = await billStore.createBill();
        if (bill) {
          localStorage.setItem('currentBillId', bill.id);
          updateURL(bill.id);
        }
      }
    } else if (storedBillId) {
      try {
        await billStore.loadBill(storedBillId);
      } catch {
        // Stored bill not found, create new one
        const bill = await billStore.createBill();
        if (bill) {
          localStorage.setItem('currentBillId', bill.id);
          updateURL(bill.id);
        }
      }
    } else {
      // Create new bill
      const bill = await billStore.createBill();
      if (bill) {
        localStorage.setItem('currentBillId', bill.id);
        updateURL(bill.id);
      }
    }

    mounted = true;
  });

  function updateURL(billId: string) {
    const url = new URL(window.location.href);
    url.searchParams.set('bill', billId);
    window.history.replaceState({}, '', url.toString());
  }

  async function createNewBill() {
    const bill = await billStore.createBill();
    if (bill) {
      localStorage.setItem('currentBillId', bill.id);
      updateURL(bill.id);
    }
  }

  function shareBill() {
    if (billStore.bill) {
      const url = `${window.location.origin}?bill=${billStore.bill.id}`;
      navigator.clipboard.writeText(url);
      alert('Bill link copied to clipboard!');
    }
  }
</script>

<svelte:head>
  <title>SplitWise - Split Bills Easily</title>
  <meta name="description" content="Split bills easily among friends with SplitWise" />
</svelte:head>

<div class="app">
  <Header />

  <main class="main-content">
    {#if billStore.loading && !mounted}
      <div class="loading">
        <div class="spinner"></div>
        <p>Loading your bill...</p>
      </div>
    {:else if billStore.error}
      <div class="error-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{billStore.error}</p>
        <button class="retry-btn" onclick={createNewBill}>Create New Bill</button>
      </div>
    {:else}
      <div class="actions-bar">
        <button class="action-btn" onclick={createNewBill}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Bill
        </button>
        <button class="action-btn" onclick={shareBill}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share Bill
        </button>
      </div>

      <div class="grid-layout">
        <div class="left-column">
          <ParticipantsList />
          <TipCalculator />
        </div>
        <div class="center-column">
          <ItemsList />
        </div>
        <div class="right-column">
          <Summary />
        </div>
      </div>
    {/if}
  </main>

  <footer class="footer">
    <p>SplitWise &copy; {new Date().getFullYear()} — Split bills easily among friends</p>
  </footer>
</div>

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: #f3f4f6;
    color: #1f2937;
    line-height: 1.5;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    max-width: 1400px;
    margin: 0 auto;
    padding: 1.5rem;
    width: 100%;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: #6b7280;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
    color: #ef4444;
    text-align: center;
  }

  .error-state svg {
    margin-bottom: 1rem;
  }

  .retry-btn {
    margin-top: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  .actions-bar {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    justify-content: flex-end;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
    border: 2px solid #e5e7eb;
    padding: 0.625rem 1rem;
    border-radius: 10px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4b5563;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn:hover {
    border-color: #667eea;
    color: #667eea;
    background: #f8faff;
  }

  .grid-layout {
    display: grid;
    grid-template-columns: 1fr 1.5fr 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  .left-column,
  .center-column,
  .right-column {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .footer {
    text-align: center;
    padding: 1.5rem;
    color: #9ca3af;
    font-size: 0.875rem;
  }

  /* Responsive Design */
  @media (max-width: 1200px) {
    .grid-layout {
      grid-template-columns: 1fr 1fr;
    }

    .right-column {
      grid-column: span 2;
    }
  }

  @media (max-width: 768px) {
    .main-content {
      padding: 1rem;
    }

    .grid-layout {
      grid-template-columns: 1fr;
    }

    .right-column {
      grid-column: span 1;
    }

    .actions-bar {
      justify-content: center;
    }
  }
</style>
