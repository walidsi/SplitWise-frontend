// Core types matching the Django backend models

export interface ItemSplit {
  id: string;
  participant: string;
  participant_name: string;
  participant_color: string;
  share: string;
  amount: string;
}

export interface BillItem {
  id: string;
  name: string;
  price: string;
  quantity: number;
  total_price: string;
  splits: ItemSplit[];
  assigned_count: number;
  total_assigned_share: string;
  created_at: string;
}

export interface Participant {
  id: string;
  name: string;
  color: string;
  total_owed: string;
  items_count: number;
  created_at: string;
}

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
  participants_count: number;
  items_count: number;
  is_fully_split: boolean;
  created_at: string;
  updated_at: string;
}

export interface BillSummaryItem {
  item_name: string;
  item_price: string;
  share: string;
  amount: string;
}

export interface BillSummaryParticipant {
  participant_id: string;
  participant_name: string;
  participant_color: string;
  items_total: string;
  tip_share: string;
  tax_share: string;
  total_owed: string;
  items: BillSummaryItem[];
}

export interface BillSummary {
  bill_name: string;
  bill_subtotal: string;
  bill_tip: string;
  bill_tax: string;
  bill_total: string;
  participants: BillSummaryParticipant[];
}

// Request types
export interface CreateBillRequest {
  name: string;
  tip_type?: 'percentage' | 'fixed';
  tip_value?: string;
  tax_amount?: string;
}

export interface CreateParticipantRequest {
  name: string;
  color?: string;
}

export interface CreateItemRequest {
  name: string;
  price: string;
  quantity?: number;
}

export interface UpdateSplitsRequest {
  splits: Array<{
    participant_id: string;
    share: string;
  }>;
}

export interface AssignmentRequest {
  assignments: Array<{
    participant_id: string;
    share: number;
  }>;
}

// Paginated response
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Predefined colors for participants
export const PARTICIPANT_COLORS = [
  '#e2714d', // terracotta
  '#498c64', // forest
  '#636fa6', // midnight
  '#c19f5c', // sand
  '#8b5cf6', // violet
  '#0891b2', // cyan
  '#db2777', // pink
  '#ea580c', // orange
  '#65a30d', // lime
  '#7c3aed', // purple
];

export function getRandomColor(): string {
  return PARTICIPANT_COLORS[Math.floor(Math.random() * PARTICIPANT_COLORS.length)];
}
