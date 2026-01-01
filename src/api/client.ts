import axios from 'axios';
import type {
  Bill,
  BillItem,
  BillSummary,
  CreateBillRequest,
  CreateItemRequest,
  CreateParticipantRequest,
  Participant,
  PaginatedResponse,
  UpdateSplitsRequest,
  AssignmentRequest,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bill endpoints
export const billsApi = {
  list: async (): Promise<PaginatedResponse<Bill>> => {
    const { data } = await api.get<PaginatedResponse<Bill>>('/bills/');
    return data;
  },

  get: async (id: string): Promise<Bill> => {
    const { data } = await api.get<Bill>(`/bills/${id}/`);
    return data;
  },

  create: async (bill: CreateBillRequest): Promise<Bill> => {
    const { data } = await api.post<Bill>('/bills/', bill);
    return data;
  },

  update: async (id: string, bill: Partial<CreateBillRequest>): Promise<Bill> => {
    const { data } = await api.patch<Bill>(`/bills/${id}/`, bill);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/bills/${id}/`);
  },

  getSummary: async (id: string): Promise<BillSummary> => {
    const { data } = await api.get<BillSummary>(`/bills/${id}/summary/`);
    return data;
  },

  recalculate: async (id: string): Promise<Bill> => {
    const { data } = await api.post<Bill>(`/bills/${id}/recalculate/`);
    return data;
  },

  clone: async (id: string, name?: string, includeSplits = false): Promise<Bill> => {
    const { data } = await api.post<Bill>(`/bills/${id}/clone/`, {
      name,
      include_splits: includeSplits,
    });
    return data;
  },

  clearSplits: async (id: string): Promise<Bill> => {
    const { data } = await api.post<Bill>(`/bills/${id}/clear_splits/`);
    return data;
  },

  reset: async (id: string): Promise<Bill> => {
    const { data } = await api.post<Bill>(`/bills/${id}/reset/`);
    return data;
  },

  splitAllEqually: async (id: string): Promise<Bill> => {
    const { data } = await api.post<Bill>(`/bills/${id}/split_all_equally/`);
    return data;
  },
};

// Participant endpoints
export const participantsApi = {
  list: async (billId: string): Promise<Participant[]> => {
    const { data } = await api.get<PaginatedResponse<Participant>>(`/bills/${billId}/participants/`);
    return data.results ?? data;
  },

  get: async (billId: string, id: string): Promise<Participant> => {
    const { data } = await api.get<Participant>(`/bills/${billId}/participants/${id}/`);
    return data;
  },

  create: async (billId: string, participant: CreateParticipantRequest): Promise<Participant> => {
    const { data } = await api.post<Participant>(`/bills/${billId}/participants/`, participant);
    return data;
  },

  bulkCreate: async (billId: string, participants: CreateParticipantRequest[]): Promise<Participant[]> => {
    const { data } = await api.post<Participant[]>(`/bills/${billId}/participants/bulk_create/`, {
      participants,
    });
    return data;
  },

  update: async (billId: string, id: string, participant: Partial<CreateParticipantRequest>): Promise<Participant> => {
    const { data } = await api.patch<Participant>(`/bills/${billId}/participants/${id}/`, participant);
    return data;
  },

  delete: async (billId: string, id: string): Promise<void> => {
    await api.delete(`/bills/${billId}/participants/${id}/`);
  },

  deleteAll: async (billId: string): Promise<{ deleted: number }> => {
    const { data } = await api.delete<{ deleted: number }>(`/bills/${billId}/participants/delete_all/`);
    return data;
  },

  getSplits: async (billId: string, id: string) => {
    const { data } = await api.get(`/bills/${billId}/participants/${id}/splits/`);
    return data;
  },
};

// Item endpoints
export const itemsApi = {
  list: async (billId: string): Promise<BillItem[]> => {
    const { data } = await api.get<PaginatedResponse<BillItem>>(`/bills/${billId}/items/`);
    return data.results ?? data;
  },

  get: async (billId: string, id: string): Promise<BillItem> => {
    const { data } = await api.get<BillItem>(`/bills/${billId}/items/${id}/`);
    return data;
  },

  create: async (billId: string, item: CreateItemRequest): Promise<BillItem> => {
    const { data } = await api.post<BillItem>(`/bills/${billId}/items/`, item);
    return data;
  },

  bulkCreate: async (billId: string, items: CreateItemRequest[]): Promise<BillItem[]> => {
    const { data } = await api.post<BillItem[]>(`/bills/${billId}/items/bulk_create/`, { items });
    return data;
  },

  update: async (billId: string, id: string, item: Partial<CreateItemRequest>): Promise<BillItem> => {
    const { data } = await api.patch<BillItem>(`/bills/${billId}/items/${id}/`, item);
    return data;
  },

  delete: async (billId: string, id: string): Promise<void> => {
    await api.delete(`/bills/${billId}/items/${id}/`);
  },

  deleteAll: async (billId: string): Promise<{ deleted: number }> => {
    const { data } = await api.delete<{ deleted: number }>(`/bills/${billId}/items/delete_all/`);
    return data;
  },

  splitEqually: async (billId: string, itemId: string, participantIds?: string[]): Promise<BillItem> => {
    const { data } = await api.post<BillItem>(`/bills/${billId}/items/${itemId}/split_equally/`, {
      participant_ids: participantIds,
    });
    return data;
  },

  updateSplits: async (billId: string, itemId: string, splits: UpdateSplitsRequest): Promise<BillItem> => {
    const { data } = await api.post<BillItem>(`/bills/${billId}/items/${itemId}/update_splits/`, splits);
    return data;
  },

  assignTo: async (billId: string, itemId: string, assignments: AssignmentRequest): Promise<BillItem> => {
    const { data } = await api.post<BillItem>(`/bills/${billId}/items/${itemId}/assign_to/`, assignments);
    return data;
  },

  clearSplits: async (billId: string, itemId: string): Promise<{ deleted: number; item: BillItem }> => {
    const { data } = await api.delete<{ deleted: number; item: BillItem }>(`/bills/${billId}/items/${itemId}/clear_splits/`);
    return data;
  },
};

export default api;
