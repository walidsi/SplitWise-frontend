import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Percent, DollarSign } from 'lucide-react';
import type { Bill } from '../types';

interface BillSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill;
  onSave: (data: {
    name?: string;
    tip_type?: 'fixed' | 'percentage';
    tip_value?: string;
    tax_amount?: string;
  }) => void;
  isLoading: boolean;
}

export default function BillSettingsModal({
  isOpen,
  onClose,
  bill,
  onSave,
  isLoading,
}: BillSettingsModalProps) {
  const [formData, setFormData] = useState({
    name: bill.name,
    tip_type: bill.tip_type,
    tip_value: bill.tip_value,
    tax_amount: bill.tax_amount,
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: bill.name,
        tip_type: bill.tip_type,
        tip_value: bill.tip_value,
        tax_amount: bill.tax_amount,
      });
    }
  }, [isOpen, bill]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tipPresets = [0, 15, 18, 20, 25];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-900/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="card p-6 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-xl font-semibold text-midnight-900">
                Bill Settings
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-sand-100 text-midnight-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bill Name */}
              <div>
                <label className="label">Bill Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {/* Tip Settings */}
              <div>
                <label className="label">Tip</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, tip_type: 'percentage' })
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      formData.tip_type === 'percentage'
                        ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                        : 'border-sand-200 text-midnight-600 hover:border-sand-300'
                    }`}
                  >
                    <Percent className="w-4 h-4" />
                    Percentage
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, tip_type: 'fixed' })
                    }
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                      formData.tip_type === 'fixed'
                        ? 'border-terracotta-500 bg-terracotta-50 text-terracotta-700'
                        : 'border-sand-200 text-midnight-600 hover:border-sand-300'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    Fixed Amount
                  </button>
                </div>

                {formData.tip_type === 'percentage' && (
                  <div className="flex gap-2 mb-3">
                    {tipPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            tip_value: preset.toString(),
                          })
                        }
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          parseFloat(formData.tip_value) === preset
                            ? 'bg-terracotta-500 text-white'
                            : 'bg-sand-100 text-midnight-600 hover:bg-sand-200'
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-midnight-400">
                    {formData.tip_type === 'percentage' ? '%' : '$'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input pl-8"
                    value={formData.tip_value}
                    onChange={(e) =>
                      setFormData({ ...formData, tip_value: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Tax Amount */}
              <div>
                <label className="label">Tax Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-midnight-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="input pl-8"
                    value={formData.tax_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, tax_amount: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Calculated Summary */}
              <div className="p-4 rounded-xl bg-sand-50">
                <p className="text-sm text-midnight-500 mb-2">Estimated Total</p>
                <p className="font-display text-2xl font-bold text-midnight-900">
                  $
                  {(
                    parseFloat(bill.subtotal) +
                    (formData.tip_type === 'percentage'
                      ? (parseFloat(bill.subtotal) *
                          parseFloat(formData.tip_value || '0')) /
                        100
                      : parseFloat(formData.tip_value || '0')) +
                    parseFloat(formData.tax_amount || '0')
                  ).toFixed(2)}
                </p>
                <p className="text-xs text-midnight-400 mt-1">
                  Subtotal ${parseFloat(bill.subtotal).toFixed(2)} + Tip + Tax
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
