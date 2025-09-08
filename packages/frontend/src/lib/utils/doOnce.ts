/**
 * Decorator that ensures an asynchronous operation runs only once at a time per key.
 * Prevents overlapping execution of action.
 *
 * ## Motivation
 *
 * Rapid user actions (like double-clicking a button) can cause duplicate
 * requests and unexpected state changes. `doOnce` acts as a client-side lock
 * until the operation resolves or rejects.
 *
 * ## Example
 *
 * ```svelte
 * <button on:click={doOnce("create-lesson", () => createLesson())}>Create</button>
 * ```
 */
export function doOnce<T>(key: string, fn: () => Promise<T>) {
    return async (): Promise<T | typeof isInflight> => {
        if (inflight.has(key)) {
            return isInflight;
        }

        inflight.add(key);
        try {
            return await fn();
        } catch (e) {
            throw e;
        } finally {
            inflight.delete(key);
        }
    };
}

const inflight = new Set<string>();

export const isInflight: unique symbol = Symbol();
