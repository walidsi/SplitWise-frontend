// API Client for Bill Split App
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Bill {
  id: string;
  name: string;
  subtotal: string;
  tip_type: 'percentage' | 'fixed';
  tip_value: string;
  tip_amount: string;
  tax_amount: string;
  total: string;
  participants: Participant[];
  items: BillItem[];
  created_at: string;
  updated_at: string;
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  total_owed: string;
  created_at: string;
}

export interface ItemSplit {
  id: string;
  participant: string;
  participant_name: string;
  participant_color: string;
  share: string;
}

export interface BillItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  total_price: string;
  splits: ItemSplit[];
  created_at: string;
}

export interface BillSummary {
  bill_name: string;
  bill_subtotal: string;
  bill_tip: string;
  bill_tax: string;
  bill_total: string;
  participants: ParticipantSummary[];
}

export interface ParticipantSummary {
  participant_id: string;
  participant_name: string;
  participant_color: string;
  items_total: string;
  tip_share: string;
  tax_share: string;
  total_owed: string;
  items: {
    item_name: string;
    item_price: string;
    share: string;
    amount: string;
  }[];
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    // Handle empty responses (like DELETE)
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  // Bills
  async createBill(data?: { name?: string }): Promise<Bill> {
    return this.request<Bill>('/bills/', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async getBill(id: string): Promise<Bill> {
    return this.request<Bill>(`/bills/${id}/`);
  }

  async updateBill(
    id: string,
    data: Partial<Pick<Bill, 'name' | 'tip_type' | 'tip_value' | 'tax_amount'>>
  ): Promise<Bill> {
    return this.request<Bill>(`/bills/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBill(id: string): Promise<void> {
    return this.request<void>(`/bills/${id}/`, {
      method: 'DELETE',
    });
  }

  async getBillSummary(id: string): Promise<BillSummary> {
    return this.request<BillSummary>(`/bills/${id}/summary/`);
  }

  // Participants
  async addParticipant(
    billId: string,
    data: { name: string; color?: string }
  ): Promise<Participant> {
    return this.request<Participant>(`/bills/${billId}/participants/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateParticipant(
    billId: string,
    participantId: string,
    data: Partial<Pick<Participant, 'name' | 'color'>>
  ): Promise<Participant> {
    return this.request<Participant>(
      `/bills/${billId}/participants/${participantId}/`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteParticipant(billId: string, participantId: string): Promise<void> {
    return this.request<void>(
      `/bills/${billId}/participants/${participantId}/`,
      {
        method: 'DELETE',
      }
    );
  }

  // Items
  async addItem(
    billId: string,
    data: { name: string; price: string; quantity?: number }
  ): Promise<BillItem> {
    return this.request<BillItem>(`/bills/${billId}/items/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateItem(
    billId: string,
    itemId: string,
    data: Partial<Pick<BillItem, 'name' | 'price' | 'quantity'>>
  ): Promise<BillItem> {
    return this.request<BillItem>(`/bills/${billId}/items/${itemId}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteItem(billId: string, itemId: string): Promise<void> {
    return this.request<void>(`/bills/${billId}/items/${itemId}/`, {
      method: 'DELETE',
    });
  }

  async splitItemEqually(
    billId: string,
    itemId: string,
    participantIds?: string[]
  ): Promise<BillItem> {
    return this.request<BillItem>(
      `/bills/${billId}/items/${itemId}/split_equally/`,
      {
        method: 'POST',
        body: JSON.stringify({ participant_ids: participantIds || [] }),
      }
    );
  }

  async updateItemSplits(
    billId: string,
    itemId: string,
    splits: { participant_id: string; share: string }[]
  ): Promise<BillItem> {
    return this.request<BillItem>(
      `/bills/${billId}/items/${itemId}/update_splits/`,
      {
        method: 'POST',
        body: JSON.stringify({ splits }),
      }
    );
  }
}

export const api = new ApiClient();
