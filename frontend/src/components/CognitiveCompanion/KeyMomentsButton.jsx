import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { KeyMomentsDrawer } from './KeyMomentsDrawer';

export function KeyMomentsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-36 right-24 z-30 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl border border-white/20 transition"
        title="Momentos clave"
      >
        <BookOpen size={18} />
      </button>
      <KeyMomentsDrawer isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
