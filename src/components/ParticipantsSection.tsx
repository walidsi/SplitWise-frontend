import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  UserCircle,
  Loader2,
  Palette,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { participantsApi } from '../api/client';
import type { Participant } from '../types';
import { PARTICIPANT_COLORS, getRandomColor } from '../types';

interface ParticipantsSectionProps {
  billId: string;
  participants: Participant[];
}

export default function ParticipantsSection({
  billId,
  participants,
}: ParticipantsSectionProps) {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [selectedColor, setSelectedColor] = useState(getRandomColor());
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: { name: string; color: string }) =>
      participantsApi.create(billId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', billId] });
      setNewName('');
      setSelectedColor(getRandomColor());
      toast.success('Participant added!');
    },
    onError: () => {
      toast.error('Failed to add participant');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => participantsApi.delete(billId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', billId] });
      toast.success('Participant removed');
    },
    onError: () => {
      toast.error('Failed to remove participant');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, color }: { id: string; color: string }) =>
      participantsApi.update(billId, id, { color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill', billId] });
      setShowColorPicker(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate({ name: newName.trim(), color: selectedColor });
  };

  return (
    <div className="space-y-6">
      {/* Add Participant Form */}
      <div className="card p-5">
        <h3 className="font-display text-lg font-semibold text-midnight-900 mb-4">
          Add Participant
        </h3>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              className="input pl-12"
              placeholder="Enter name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setSelectedColor(getRandomColor())}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
              style={{ backgroundColor: selectedColor }}
              title="Click to change color"
            />
          </div>
          <button
            type="submit"
            disabled={!newName.trim() || createMutation.isPending}
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

        {/* Quick Add Suggestions */}
        <div className="flex flex-wrap gap-2 mt-4">
          {['Alice', 'Bob', 'Charlie', 'Diana'].map((name) => (
            <button
              key={name}
              onClick={() => setNewName(name)}
              className="px-3 py-1 text-sm rounded-full bg-sand-100 text-midnight-600 hover:bg-sand-200 transition-colors"
            >
              + {name}
            </button>
          ))}
        </div>
      </div>

      {/* Participants List */}
      <div className="card">
        <div className="p-5 border-b border-sand-100">
          <h3 className="font-display text-lg font-semibold text-midnight-900">
            Participants ({participants.length})
          </h3>
        </div>

        {participants.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-sand-100 flex items-center justify-center">
              <UserCircle className="w-6 h-6 text-sand-400" />
            </div>
            <p className="text-midnight-500">
              No participants yet. Add someone to split the bill with!
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-sand-100">
            <AnimatePresence>
              {participants.map((participant, index) => (
                <motion.li
                  key={participant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 flex items-center gap-4 hover:bg-sand-50 transition-colors group"
                >
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-sm"
                      style={{ backgroundColor: participant.color }}
                    >
                      {participant.name.charAt(0).toUpperCase()}
                    </div>
                    <button
                      onClick={() =>
                        setShowColorPicker(
                          showColorPicker === participant.id ? null : participant.id
                        )
                      }
                      className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white shadow-sm border border-sand-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Palette className="w-3 h-3 text-midnight-400" />
                    </button>

                    {/* Color Picker */}
                    <AnimatePresence>
                      {showColorPicker === participant.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="absolute top-full left-0 mt-2 p-2 bg-white rounded-xl shadow-lg border border-sand-200 z-10"
                        >
                          <div className="grid grid-cols-5 gap-1">
                            {PARTICIPANT_COLORS.map((color) => (
                              <button
                                key={color}
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: participant.id,
                                    color,
                                  })
                                }
                                className="w-6 h-6 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-midnight-900 truncate">
                      {participant.name}
                    </p>
                    <p className="text-sm text-midnight-500">
                      {participant.items_count} item{participant.items_count !== 1 ? 's' : ''} assigned
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-midnight-500">Owes</p>
                    <p className="font-display text-lg font-semibold text-midnight-900">
                      ${parseFloat(participant.total_owed).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteMutation.mutate(participant.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-midnight-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </div>
  );
}
