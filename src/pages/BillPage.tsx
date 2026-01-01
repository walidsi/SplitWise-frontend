import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  ShoppingBag,
  PieChart,
  Settings,
  Loader2,
  Check,
  Pencil,
  RotateCcw,
  Divide,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { billsApi } from '../api/client';
import ParticipantsSection from '../components/ParticipantsSection';
import ItemsSection from '../components/ItemsSection';
import SummarySection from '../components/SummarySection';
import BillSettingsModal from '../components/BillSettingsModal';

type TabType = 'participants' | 'items' | 'summary';

export default function BillPage() {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('participants');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const { data: bill, isLoading, error } = useQuery({
    queryKey: ['bill', billId],
    queryFn: () => billsApi.get(billId!),
    enabled: !!billId,
  });

  const updateBillMutation = useMutation({
    mutationFn: (data: { name?: string; tip_type?: 'fixed' | 'percentage'; tip_value?: string; tax_amount?: string }) =>
      billsApi.update(billId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', billId] });
      setIsEditingName(false);
      toast.success('Bill updated');
    },
    onError: () => {
      toast.error('Failed to update bill');
    },
  });

  const splitAllMutation = useMutation({
    mutationFn: () => billsApi.splitAllEqually(billId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', billId] });
      toast.success('All items split equally!');
    },
    onError: () => {
      toast.error('Failed to split items. Make sure you have participants.');
    },
  });

  const clearSplitsMutation = useMutation({
    mutationFn: () => billsApi.clearSplits(billId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', billId] });
      toast.success('All splits cleared');
    },
    onError: () => {
      toast.error('Failed to clear splits');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-terracotta-500 animate-spin" />
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="text-center py-20">
        <h2 className="font-display text-2xl font-semibold text-midnight-900 mb-2">
          Bill not found
        </h2>
        <p className="text-midnight-500 mb-6">
          This bill doesn't exist or has been deleted.
        </p>
        <button onClick={() => navigate('/')} className="btn-primary">
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== bill.name) {
      updateBillMutation.mutate({ name: editedName.trim() });
    } else {
      setIsEditingName(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: 'participants',
      label: 'People',
      icon: <Users className="w-4 h-4" />,
      count: bill.participants_count,
    },
    {
      id: 'items',
      label: 'Items',
      icon: <ShoppingBag className="w-4 h-4" />,
      count: bill.items_count,
    },
    {
      id: 'summary',
      label: 'Summary',
      icon: <PieChart className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-xl hover:bg-sand-200 text-midnight-500 transition-colors mt-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                className="input text-2xl font-display font-bold py-1"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="p-2 rounded-xl bg-forest-500 text-white"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-midnight-900 truncate">
                {bill.name}
              </h1>
              <button
                onClick={() => {
                  setEditedName(bill.name);
                  setIsEditingName(true);
                }}
                className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-sand-200 text-midnight-400 transition-all"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-4 mt-1 text-sm text-midnight-500">
            <span>Subtotal: ${parseFloat(bill.subtotal).toFixed(2)}</span>
            <span>Tip: ${parseFloat(bill.tip_amount).toFixed(2)}</span>
            <span>Tax: ${parseFloat(bill.tax_amount).toFixed(2)}</span>
            <span className="font-semibold text-midnight-900">
              Total: ${parseFloat(bill.total).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => splitAllMutation.mutate()}
            disabled={splitAllMutation.isPending || bill.participants_count === 0 || bill.items_count === 0}
            className="btn-secondary btn-sm hidden sm:flex"
            title="Split all items equally"
          >
            {splitAllMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Divide className="w-4 h-4" />
            )}
            Split All
          </button>
          <button
            onClick={() => clearSplitsMutation.mutate()}
            disabled={clearSplitsMutation.isPending}
            className="btn-ghost btn-sm hidden sm:flex"
            title="Clear all splits"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="btn-ghost btn-sm"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </motion.div>

      {/* Status Bar */}
      {bill.items_count > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`p-3 rounded-xl flex items-center justify-between ${
            bill.is_fully_split
              ? 'bg-forest-100 text-forest-700'
              : 'bg-terracotta-100 text-terracotta-700'
          }`}
        >
          <span className="text-sm font-medium">
            {bill.is_fully_split
              ? '✓ All items have been assigned to participants'
              : 'Some items still need to be assigned to participants'}
          </span>
          {!bill.is_fully_split && bill.participants_count > 0 && (
            <button
              onClick={() => splitAllMutation.mutate()}
              className="text-sm font-semibold hover:underline"
            >
              Split all equally →
            </button>
          )}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-sand-100 rounded-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-midnight-900 shadow-sm'
                : 'text-midnight-500 hover:text-midnight-700'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-terracotta-100 text-terracotta-700'
                    : 'bg-sand-200 text-midnight-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'participants' && (
            <ParticipantsSection billId={billId!} participants={bill.participants} />
          )}
          {activeTab === 'items' && (
            <ItemsSection billId={billId!} items={bill.items} participants={bill.participants} />
          )}
          {activeTab === 'summary' && (
            <SummarySection billId={billId!} bill={bill} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Settings Modal */}
      <BillSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        bill={bill}
        onSave={(data) => updateBillMutation.mutate(data)}
        isLoading={updateBillMutation.isPending}
      />
    </div>
  );
}
