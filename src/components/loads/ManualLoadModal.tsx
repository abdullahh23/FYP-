import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Load } from '../../types';

interface ManualLoadModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (load: Omit<Load, 'id'>) => void;
}

const empty = {
  loadNumber: '',
  brokerName: '',
  pickupDate: '',
  grossAmount: 0,
  originCity: '',
  originState: '',
  destinationCity: '',
  destinationState: '',
};

export function ManualLoadModal({ open, onClose, onSubmit }: ManualLoadModalProps) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof empty) => (v: string) =>
    setForm(prev => ({ ...prev, [k]: k === 'grossAmount' ? Number(v) || 0 : v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.loadNumber.trim()) {
      setError('Load number is required');
      return;
    }
    onSubmit(form);
    setForm(empty);
    setError(null);
    onClose();
  };

  const field = (label: string, key: keyof typeof empty, type = 'text') => (
    <div>
      <label className="block text-xs font-semibold text-steel uppercase tracking-wide mb-1">{label}</label>
      <input
        type={type}
        value={key === 'grossAmount' ? (form.grossAmount || '') : form[key]}
        onChange={e => set(key)(e.target.value)}
        className="w-full border border-steel/25 rounded-lg px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-signal/40 focus:border-signal"
      />
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-panel w-full max-w-lg p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-ink mb-1">Manual Load Entry</h2>
            <p className="text-steel text-sm mb-4">Enter the same fields as rate confirmation extraction.</p>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
              {field('Load #', 'loadNumber')}
              {field('Broker Name', 'brokerName')}
              {field('Pickup Date', 'pickupDate', 'date')}
              {field('Gross Amount', 'grossAmount', 'number')}
              {field('Origin City', 'originCity')}
              {field('Origin State', 'originState')}
              {field('Destination City', 'destinationCity')}
              {field('Destination State', 'destinationState')}
              {error && <p className="col-span-2 text-red-600 text-sm">{error}</p>}
              <div className="col-span-2 flex gap-3 justify-end mt-2">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-steel hover:text-ink">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-signal text-white rounded-xl text-sm font-semibold hover:bg-signal/90">Add Load</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
