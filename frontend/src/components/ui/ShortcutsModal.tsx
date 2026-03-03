import { HOTKEY_LABELS } from "../../lib/hotkeys";
import { Modal } from "./Modal";

interface ShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  const groups = new Map<string, { keys: string; description: string }[]>();
  for (const entry of Object.values(HOTKEY_LABELS)) {
    if (!groups.has(entry.group)) groups.set(entry.group, []);
    groups.get(entry.group)!.push(entry);
  }

  return (
    <Modal open={open} onClose={onClose} title="Keyboard Shortcuts" size="md">
      <div className="space-y-5">
        {Array.from(groups.entries()).map(([group, shortcuts]) => (
          <div key={group}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {group}
            </h3>
            <div className="space-y-1">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.description}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50"
                >
                  <span className="text-gray-700">{shortcut.description}</span>
                  <kbd className="rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 font-mono text-xs text-gray-500">
                    {shortcut.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
