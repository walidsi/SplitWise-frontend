import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { billsApi } from '../api/client';
import type { Bill, BillSummaryParticipant } from '../types';

interface SummarySectionProps {
  billId: string;
  bill: Bill;
}

export default function SummarySection({ billId, bill }: SummarySectionProps) {
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['bill-summary', billId],
    queryFn: () => billsApi.getSummary(billId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-terracotta-500 animate-spin" />
      </div>
    );
  }

  if (!summary || summary.participants.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-sand-100 flex items-center justify-center">
          <Receipt className="w-6 h-6 text-sand-400" />
        </div>
        <p className="text-midnight-500">
          Add participants and items to see the split summary.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bill Overview */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-semibold text-midnight-900 mb-4">
          Bill Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-sand-50">
            <p className="text-sm text-midnight-500 mb-1">Subtotal</p>
            <p className="font-display text-xl font-bold text-midnight-900">
              ${parseFloat(summary.bill_subtotal).toFixed(2)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-sand-50">
            <p className="text-sm text-midnight-500 mb-1">Tip</p>
            <p className="font-display text-xl font-bold text-midnight-900">
              ${parseFloat(summary.bill_tip).toFixed(2)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-sand-50">
            <p className="text-sm text-midnight-500 mb-1">Tax</p>
            <p className="font-display text-xl font-bold text-midnight-900">
              ${parseFloat(summary.bill_tax).toFixed(2)}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-terracotta-50">
            <p className="text-sm text-terracotta-600 mb-1">Total</p>
            <p className="font-display text-xl font-bold text-terracotta-700">
              ${parseFloat(summary.bill_total).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Individual Splits */}
      <div className="card">
        <div className="p-5 border-b border-sand-100">
          <h3 className="font-display text-lg font-semibold text-midnight-900">
            Who Owes What
          </h3>
        </div>
        <ul className="divide-y divide-sand-100">
          <AnimatePresence>
            {summary.participants.map((participant, index) => (
              <ParticipantSummaryItem
                key={participant.participant_id}
                participant={participant}
                index={index}
                isExpanded={expandedParticipant === participant.participant_id}
                onToggle={() =>
                  setExpandedParticipant(
                    expandedParticipant === participant.participant_id
                      ? null
                      : participant.participant_id
                  )
                }
                billTotal={parseFloat(bill.total)}
              />
            ))}
          </AnimatePresence>
        </ul>
      </div>

      {/* Visual Split */}
      <div className="card p-6">
        <h3 className="font-display text-lg font-semibold text-midnight-900 mb-4">
          Visual Split
        </h3>
        <div className="flex rounded-xl overflow-hidden h-8">
          {summary.participants.map((p) => {
            const amount = parseFloat(p.total_owed);
            const total = parseFloat(summary.bill_total);
            const percentage = total > 0 ? (amount / total) * 100 : 0;
            
            return (
              <motion.div
                key={p.participant_id}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-full flex items-center justify-center text-xs text-white font-medium overflow-hidden"
                style={{ backgroundColor: p.participant_color }}
                title={`${p.participant_name}: $${amount.toFixed(2)} (${percentage.toFixed(1)}%)`}
              >
                {percentage > 10 && p.participant_name.charAt(0)}
              </motion.div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {summary.participants.map((p) => (
            <div key={p.participant_id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: p.participant_color }}
              />
              <span className="text-sm text-midnight-600">
                {p.participant_name}: ${parseFloat(p.total_owed).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ParticipantSummaryItemProps {
  participant: BillSummaryParticipant;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  billTotal: number;
}

function ParticipantSummaryItem({
  participant,
  index,
  isExpanded,
  onToggle,
  billTotal,
}: ParticipantSummaryItemProps) {
  const amount = parseFloat(participant.total_owed);
  const percentage = billTotal > 0 ? (amount / billTotal) * 100 : 0;

  return (
    <motion.li
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-4 hover:bg-sand-50 transition-colors text-left"
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
          style={{ backgroundColor: participant.participant_color }}
        >
          {participant.participant_name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-midnight-900">
              {participant.participant_name}
            </p>
            <p className="font-display text-xl font-bold text-midnight-900">
              ${amount.toFixed(2)}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-midnight-500">
            <span>{participant.items.length} items</span>
            <span>·</span>
            <span>{percentage.toFixed(1)}% of total</span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-sand-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              className="h-full rounded-full"
              style={{ backgroundColor: participant.participant_color }}
            />
          </div>
        </div>

        <div className="text-midnight-400">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4"
          >
            <div className="ml-16 p-4 rounded-xl bg-sand-50 space-y-3">
              {/* Items breakdown */}
              {participant.items.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-midnight-500 uppercase tracking-wide mb-2">
                    Items
                  </p>
                  <ul className="space-y-1">
                    {participant.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-midnight-700">
                          {item.item_name}
                          {parseFloat(item.share) < 1 && (
                            <span className="text-midnight-400 ml-1">
                              ({(parseFloat(item.share) * 100).toFixed(0)}%)
                            </span>
                          )}
                        </span>
                        <span className="font-medium text-midnight-900">
                          ${parseFloat(item.amount).toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Subtotals */}
              <div className="pt-3 border-t border-sand-200 space-y-1 text-sm">
                <div className="flex justify-between text-midnight-600">
                  <span>Items subtotal</span>
                  <span>${parseFloat(participant.items_total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-midnight-600">
                  <span>Tip share</span>
                  <span>${parseFloat(participant.tip_share).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-midnight-600">
                  <span>Tax share</span>
                  <span>${parseFloat(participant.tax_share).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-midnight-900 pt-2 border-t border-sand-200">
                  <span>Total</span>
                  <span>${parseFloat(participant.total_owed).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
