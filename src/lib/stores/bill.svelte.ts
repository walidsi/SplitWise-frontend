import { api, type Bill, type Participant, type BillItem, type BillSummary } from '$lib/api/client';

// Svelte 5 runes-based store
function createBillStore() {
  let bill = $state<Bill | null>(null);
  let summary = $state<BillSummary | null>(null);
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function createBill(name?: string): Promise<Bill | null> {
    loading = true;
    error = null;
    try {
      const newBill = await api.createBill({ name });
      bill = newBill;
      return newBill;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to create bill';
      return null;
    } finally {
      loading = false;
    }
  }

  async function loadBill(id: string): Promise<Bill | null> {
    loading = true;
    error = null;
    try {
      const loadedBill = await api.getBill(id);
      bill = loadedBill;
      await refreshSummary();
      return loadedBill;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load bill';
      throw e;
    } finally {
      loading = false;
    }
  }

  async function updateBill(
    data: Partial<Pick<Bill, 'name' | 'tip_type' | 'tip_value' | 'tax_amount'>>
  ): Promise<Bill | null> {
    if (!bill) return null;
    error = null;
    try {
      const updatedBill = await api.updateBill(bill.id, data);
      bill = updatedBill;
      await refreshSummary();
      return updatedBill;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to update bill';
      return null;
    }
  }

  async function addParticipant(name: string, color?: string): Promise<Participant | null> {
    if (!bill) return null;
    error = null;
    try {
      const participant = await api.addParticipant(bill.id, { name, color });
      // Reload bill to get updated participants with correct totals
      await loadBill(bill.id);
      return participant;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to add participant';
      return null;
    }
  }

  async function updateParticipant(
    participantId: string,
    data: Partial<Pick<Participant, 'name' | 'color'>>
  ): Promise<Participant | null> {
    if (!bill) return null;
    error = null;
    try {
      const participant = await api.updateParticipant(bill.id, participantId, data);
      await loadBill(bill.id);
      return participant;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to update participant';
      return null;
    }
  }

  async function removeParticipant(participantId: string): Promise<boolean> {
    if (!bill) return false;
    error = null;
    try {
      await api.deleteParticipant(bill.id, participantId);
      await loadBill(bill.id);
      return true;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to remove participant';
      return false;
    }
  }

  async function addItem(
    name: string,
    price: string,
    quantity: number = 1
  ): Promise<BillItem | null> {
    if (!bill) return null;
    error = null;
    try {
      const item = await api.addItem(bill.id, { name, price, quantity });
      await loadBill(bill.id);
      return item;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to add item';
      return null;
    }
  }

  async function updateItem(
    itemId: string,
    data: Partial<Pick<BillItem, 'name' | 'price' | 'quantity'>>
  ): Promise<BillItem | null> {
    if (!bill) return null;
    error = null;
    try {
      const item = await api.updateItem(bill.id, itemId, data);
      await loadBill(bill.id);
      return item;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to update item';
      return null;
    }
  }

  async function removeItem(itemId: string): Promise<boolean> {
    if (!bill) return false;
    error = null;
    try {
      await api.deleteItem(bill.id, itemId);
      await loadBill(bill.id);
      return true;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to remove item';
      return false;
    }
  }

  async function splitItemEqually(
    itemId: string,
    participantIds?: string[]
  ): Promise<BillItem | null> {
    if (!bill) return null;
    error = null;
    try {
      const item = await api.splitItemEqually(bill.id, itemId, participantIds);
      await loadBill(bill.id);
      return item;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to split item';
      return null;
    }
  }

  async function updateItemSplits(
    itemId: string,
    splits: { participant_id: string; share: string }[]
  ): Promise<BillItem | null> {
    if (!bill) return null;
    error = null;
    try {
      const item = await api.updateItemSplits(bill.id, itemId, splits);
      await loadBill(bill.id);
      return item;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to update item splits';
      return null;
    }
  }

  async function refreshSummary(): Promise<void> {
    if (!bill) return;
    try {
      summary = await api.getBillSummary(bill.id);
    } catch (e) {
      // Summary fetch failed, continue without it
      console.warn('Failed to fetch summary:', e);
    }
  }

  return {
    get bill() { return bill; },
    get summary() { return summary; },
    get loading() { return loading; },
    get error() { return error; },
    createBill,
    loadBill,
    updateBill,
    addParticipant,
    updateParticipant,
    removeParticipant,
    addItem,
    updateItem,
    removeItem,
    splitItemEqually,
    updateItemSplits,
    refreshSummary,
  };
}

export const billStore = createBillStore();
