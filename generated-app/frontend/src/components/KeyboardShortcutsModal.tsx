import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SHORTCUT_SECTIONS = [
  {
    title: 'Global',
    shortcuts: [
      { keys: ['⌘', 'K'], label: 'Open search' },
      { keys: ['⌘', '['], label: 'Toggle sidebar' },
      { keys: ['C'], label: 'Create issue' },
      { keys: ['?'], label: 'Show keyboard shortcuts' },
      { keys: ['/'], label: 'Focus filter input' },
      { keys: ['Esc'], label: 'Close panel / modal' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['G', 'B'], label: 'Go to Board' },
      { keys: ['G', 'L'], label: 'Go to Backlog' },
      { keys: ['G', 'R'], label: 'Go to Roadmap' },
      { keys: ['G', 'S'], label: 'Go to Settings' },
    ],
  },
  {
    title: 'Issue Detail',
    shortcuts: [
      { keys: ['E'], label: 'Edit summary' },
      { keys: ['A'], label: 'Change assignee' },
      { keys: ['L'], label: 'Change labels' },
      { keys: ['P'], label: 'Change priority' },
      { keys: ['M'], label: 'Assign to me' },
      { keys: ['⌘', 'Enter'], label: 'Save and close' },
    ],
  },
  {
    title: 'Board',
    shortcuts: [
      { keys: ['←', '→'], label: 'Navigate columns' },
      { keys: ['↑', '↓'], label: 'Navigate cards' },
      { keys: ['Enter'], label: 'Open issue detail' },
      { keys: ['Space'], label: 'Select card' },
    ],
  },
];

export default function KeyboardShortcutsModal() {
  const { state, dispatch } = useApp();

  if (!state.showShortcutsModal) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={() => dispatch({ type: 'SET_SHORTCUTS_MODAL', show: false })}>
      <div className="fixed inset-0 bg-black/50 animate-fade-in" />
      <div
        className="relative bg-card-bg rounded-xl shadow-xl w-full max-w-2xl p-6 animate-scale-in z-10 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-semibold">Keyboard Shortcuts</h2>
          <button
            onClick={() => dispatch({ type: 'SET_SHORTCUTS_MODAL', show: false })}
            className="p-1.5 rounded hover:bg-hover-bg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {SHORTCUT_SECTIONS.map(section => (
            <div key={section.title}>
              <h3 className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-3">{section.title}</h3>
              <div className="space-y-2">
                {section.shortcuts.map(shortcut => (
                  <div key={shortcut.label} className="flex items-center justify-between">
                    <span className="text-sm text-text-secondary">{shortcut.label}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <span key={i}>
                          <kbd className="inline-block px-1.5 py-0.5 text-[11px] font-mono bg-page-bg border border-border rounded shadow-sm text-text-primary min-w-[24px] text-center">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && shortcut.keys.length > 1 && key !== '←' && key !== '↑' && (
                            <span className="text-text-tertiary text-[10px] mx-0.5">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-xs text-text-tertiary">Press <kbd className="px-1 py-0.5 text-[10px] font-mono bg-page-bg border border-border rounded">?</kbd> to toggle this dialog</p>
        </div>
      </div>
    </div>
  );
}
