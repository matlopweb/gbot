import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import { SavedItemsDrawer } from './SavedItemsDrawer';

export function SavedItemsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-36 right-6 z-30 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700"
        title="Elementos guardados"
      >
        <Bookmark className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>
      <SavedItemsDrawer isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
