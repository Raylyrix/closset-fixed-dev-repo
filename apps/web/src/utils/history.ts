// Simple history manager for undo/redo with batched transactions
// Stores generic patches with apply() and revert() functions.

export type HistoryEntry = {
  label?: string;
  apply: () => void;       // redo
  revert: () => void;      // undo
};

class HistoryManager {
  private past: HistoryEntry[] = [];
  private future: HistoryEntry[] = [];
  private batching: boolean = false;
  private batch: HistoryEntry[] = [];

  begin(label?: string) {
    if (this.batching) return; // nested not supported yet
    this.batching = true;
    this.batch = [];
  }

  push(entry: HistoryEntry) {
    if (this.batching) {
      this.batch.push(entry);
    } else {
      this.past.push(entry);
      this.future = [];
    }
  }

  end(label?: string) {
    if (!this.batching) return;
    const entries = this.batch.slice();
    this.batch = [];
    this.batching = false;
    if (!entries.length) return;
    const grouped: HistoryEntry = {
      label,
      apply: () => entries.forEach(e => e.apply()),
      revert: () => {
        // revert in reverse order
        for (let i = entries.length - 1; i >= 0; i--) entries[i].revert();
      }
    };
    this.past.push(grouped);
    this.future = [];
  }

  clear() {
    this.past = [];
    this.future = [];
    this.batch = [];
    this.batching = false;
  }

  canUndo() { return this.past.length > 0; }
  canRedo() { return this.future.length > 0; }

  undo() {
    const e = this.past.pop();
    if (!e) return false;
    e.revert();
    this.future.push(e);
    return true;
  }

  redo() {
    const e = this.future.pop();
    if (!e) return false;
    e.apply();
    this.past.push(e);
    return true;
  }
}

export const history = new HistoryManager();
