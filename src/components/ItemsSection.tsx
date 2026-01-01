import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  ShoppingBag,
  Loader2,
  Users,
  Divide,
  X,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { itemsApi } from '../api/client';
import type { BillItem, Participant } from '../types';

interface ItemsSectionProps {
  billId: string;
  items: BillItem[];
  participants: Participant[];
}

export default function ItemsSection({
  billId,
  items,
  participants,
}: ItemsSectionProps) {
  const queryClient = useQueryClient();
  const [newItem, setNewItem] = useState({ name: '', price: '', quantity: '1' });
  const [splittingItem, setSplittingItem] = useState<string | null>(null);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const createMutation = useMutation({
    mutationFn: (data: { name: string; price: string; quantity?: number }) =>
      itemsApi.create(billId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', billId] });
      setNewItem({ name: '', price: '', quantity: '1' });
      toast.success('Item added!');
    },
    onError: () => {
      toast.error('Failed to add item');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => itemsApi.delete(billId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', billId] });
      toast.success('Item removed');
    },
    onError: () => {
      toast.error('Failed to remove item');
    },
  });

  const splitMutation = useMutation({
    mutationFn: ({ itemId, participantIds }: { itemId: string; participantIds?: string[] }) =>
      itemsApi.splitEqually(billId, itemId, participantIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', billId] });
      setSplittingItem(null);
      setSelectedParticipants([]);
      toast.success('Item split!');
    },
    onError: () => {
      toast.error('Failed to split item');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.price) return;
    createMutation.mutate({
      name: newItem.name.trim(),
      price: newItem.price,
      quantity: parseInt(newItem.quantity) || 1,
    });
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSplit = (itemId: string) => {
    if (selectedParticipants.length > 0) {
      splitMutation.mutate({ itemId, participantIds: selectedParticipants });
    } else {
      splitMutation.mutate({ itemId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Item Form */}
      <div className="card p-5">
        <h3 className="font-display text-lg font-semibold text-midnight-900 mb-4">
          Add Item
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              className="input"
              placeholder="Item name..."
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>
          <div className="w-28">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-midnight-400">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input pl-7"
                placeholder="0.00"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              />
            </div>
          </div>
          <div className="w-20">
            <input
              type="number"
              min="1"
              className="input text-center"
              placeholder="Qty"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={!newItem.name.trim() || !newItem.price || createMutation.isPending}
            className="btn-primary"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add
              </>
            )}
          </button>
        </form>
      </div>

      {/* Items List */}
      <div className="card">
        <div className="p-5 border-b border-sand-100">
          <h3 className="font-display text-lg font-semibold text-midnight-900">
            Bill Items ({items.length})
          </h3>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-sand-100 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-sand-400" />
            </div>
            <p className="text-midnight-500">
              No items yet. Add what you ordered!
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-sand-100">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-sand-50 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-midnight-900">
                          {item.name}
                        </p>
                        {item.quantity > 1 && (
                          <span className="badge-midnight">×{item.quantity}</span>
                        )}
                      </div>

                      {/* Assigned participants */}
                      {item.splits.length > 0 ? (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex -space-x-2">
                            {item.splits.map((split) => (
                              <div
                                key={split.id}
                                className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs text-white font-medium"
                                style={{ backgroundColor: split.participant_color }}
                                title={`${split.participant_name}: ${(parseFloat(split.share) * 100).toFixed(0)}%`}
                              >
                                {split.participant_name.charAt(0)}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-midnight-500">
                            Split {item.splits.length} way{item.splits.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-terracotta-500 mt-1">
                          Not assigned yet
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-display text-lg font-semibold text-midnight-900">
                        ${parseFloat(item.total_price).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs text-midnight-400">
                          ${parseFloat(item.price).toFixed(2)} each
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setSplittingItem(item.id);
                          setSelectedParticipants(
                            item.splits.map((s) => s.participant)
                          );
                        }}
                        className="p-2 rounded-lg hover:bg-midnight-100 text-midnight-400 hover:text-midnight-600"
                        title="Assign to participants"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => splitMutation.mutate({ itemId: item.id })}
                        disabled={participants.length === 0}
                        className="p-2 rounded-lg hover:bg-forest-50 text-midnight-400 hover:text-forest-600"
                        title="Split equally among all"
                      >
                        <Divide className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(item.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-midnight-400 hover:text-red-500"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Split Selection Modal (inline) */}
                  <AnimatePresence>
                    {splittingItem === item.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-sand-200"
                      >
                        <p className="text-sm text-midnight-600 mb-3">
                          Select who's sharing this item:
                        </p>
                        {participants.length === 0 ? (
                          <p className="text-sm text-terracotta-500">
                            Add participants first to assign items.
                          </p>
                        ) : (
                          <>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {participants.map((p) => (
                                <button
                                  key={p.id}
                                  onClick={() => toggleParticipant(p.id)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                                    selectedParticipants.includes(p.id)
                                      ? 'border-forest-500 bg-forest-50'
                                      : 'border-sand-200 hover:border-sand-300'
                                  }`}
                                >
                                  <div
                                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs text-white"
                                    style={{ backgroundColor: p.color }}
                                  >
                                    {p.name.charAt(0)}
                                  </div>
                                  <span className="text-sm font-medium text-midnight-800">
                                    {p.name}
                                  </span>
                                  {selectedParticipants.includes(p.id) && (
                                    <Check className="w-4 h-4 text-forest-600" />
                                  )}
                                </button>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSplittingItem(null);
                                  setSelectedParticipants([]);
                                }}
                                className="btn-ghost btn-sm"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSplit(item.id)}
                                disabled={splitMutation.isPending}
                                className="btn-success btn-sm"
                              >
                                {splitMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" />
                                    {selectedParticipants.length === 0
                                      ? 'Split Among All'
                                      : `Split (${selectedParticipants.length})`}
                                  </>
                                )}
                              </button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
