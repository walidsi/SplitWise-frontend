import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Receipt,
  Users,
  ShoppingBag,
  Trash2,
  ChevronRight,
  Copy,
  Calendar,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { billsApi } from '../api/client';
import type { Bill } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBillName, setNewBillName] = useState('');

  const { data: billsData, isLoading } = useQuery({
    queryKey: ['bills'],
    queryFn: billsApi.list,
  });

  const createBillMutation = useMutation({
    mutationFn: (name: string) => billsApi.create({ name }),
    onSuccess: (bill) => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Bill created!');
      setShowCreateModal(false);
      setNewBillName('');
      navigate(`/bill/${bill.id}`);
    },
    onError: () => {
      toast.error('Failed to create bill');
    },
  });

  const deleteBillMutation = useMutation({
    mutationFn: billsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Bill deleted');
    },
    onError: () => {
      toast.error('Failed to delete bill');
    },
  });

  const cloneBillMutation = useMutation({
    mutationFn: (id: string) => billsApi.clone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      toast.success('Bill cloned!');
    },
    onError: () => {
      toast.error('Failed to clone bill');
    },
  });

  const bills = billsData?.results ?? [];

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newBillName.trim() || 'New Bill';
    createBillMutation.mutate(name);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-midnight-900 mb-4">
          Split bills the{' '}
          <span className="text-terracotta-500">smart</span> way
        </h1>
        <p className="text-lg text-midnight-600 max-w-2xl mx-auto mb-8">
          No more awkward calculations. Add items, assign participants, and let us handle the math.
          Everyone pays their fair share.
        </p>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary btn-lg group"
        >
          <Plus className="w-5 h-5" />
          Create New Bill
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>

      {/* Bills List */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold text-midnight-900">
            Your Bills
          </h2>
          {bills.length > 0 && (
            <span className="badge-midnight">{bills.length} bills</span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-terracotta-500 animate-spin" />
          </div>
        ) : bills.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-12 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-sand-100 flex items-center justify-center">
              <Receipt className="w-8 h-8 text-sand-400" />
            </div>
            <h3 className="font-display text-xl font-semibold text-midnight-800 mb-2">
              No bills yet
            </h3>
            <p className="text-midnight-500 mb-6">
              Create your first bill to get started splitting expenses
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-secondary"
            >
              <Plus className="w-4 h-4" />
              Create Bill
            </button>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {bills.map((bill, index) => (
                <BillCard
                  key={bill.id}
                  bill={bill}
                  index={index}
                  onDelete={() => deleteBillMutation.mutate(bill.id)}
                  onClone={() => cloneBillMutation.mutate(bill.id)}
                  formatDate={formatDate}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-900/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-xl font-semibold text-midnight-900 mb-4">
                Create New Bill
              </h3>
              <form onSubmit={handleCreateBill}>
                <label className="label">Bill Name</label>
                <input
                  type="text"
                  className="input mb-4"
                  placeholder="Dinner at Mario's..."
                  value={newBillName}
                  onChange={(e) => setNewBillName(e.target.value)}
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createBillMutation.isPending}
                    className="btn-primary flex-1"
                  >
                    {createBillMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface BillCardProps {
  bill: Bill;
  index: number;
  onDelete: () => void;
  onClone: () => void;
  formatDate: (date: string) => string;
}

function BillCard({ bill, index, onDelete, onClone, formatDate }: BillCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="card-hover group"
    >
      <div
        className="p-5 cursor-pointer"
        onClick={() => navigate(`/bill/${bill.id}`)}
      >
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display text-lg font-semibold text-midnight-900 group-hover:text-terracotta-600 transition-colors">
            {bill.name}
          </h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClone();
              }}
              className="p-1.5 rounded-lg hover:bg-sand-100 text-midnight-400 hover:text-midnight-600"
              title="Clone bill"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-lg hover:bg-red-50 text-midnight-400 hover:text-red-500"
              title="Delete bill"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-midnight-500 mb-4">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{bill.participants_count}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            <span>{bill.items_count}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(bill.created_at)}</span>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-midnight-400 mb-0.5">Total</p>
            <p className="font-display text-2xl font-bold text-midnight-900">
              ${parseFloat(bill.total).toFixed(2)}
            </p>
          </div>
          {bill.is_fully_split ? (
            <span className="badge-forest">Fully split</span>
          ) : bill.items_count > 0 ? (
            <span className="badge-terracotta">Needs splitting</span>
          ) : (
            <span className="badge-midnight">Empty</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
