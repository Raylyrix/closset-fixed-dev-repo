const listeners = new Set();
const state = {
    shapes: [],
    selected: [],
    currentPath: null,
    tool: 'pen',
};
export const vectorStore = {
    getState() { return state; },
    set(key, value) {
        // @ts-expect-error intentional mutation for simple store
        state[key] = value;
        listeners.forEach(fn => fn());
    },
    setAll(next) {
        Object.assign(state, next);
        listeners.forEach(fn => fn());
    },
    subscribe(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
    }
};
