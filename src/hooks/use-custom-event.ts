import { useRef } from 'react';

export enum CustomEventKey {
    SyncMail = 'sync-mail',
    RefreshView = 'refresh-view',
    UserLoggedIn = 'user-logged-in',

}


type Callback<T> = (data: T) => void;

const debounce = (fn: Function, delay: number) => {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

/**
 * Hooks for emitting and listening to custom events.
 *
 * @param {CustomEventKey} eventKey - The key of the custom event.
 * @param {Callback<T>} [handler] - The handler function for the event.
 * @returns {{
 *   emit: (payload?: T) => void,
 *   emitOnce: (payload?: T) => void,
 *   emitDebounce: (delay: number) => (payload: T) => void,
 *   listen: (handler: Callback<T>) => () => void,
 *   listenOnce: (handler: Callback<T>) => void
 * }}
 */
export function useCustomEvent<T = any>(eventKey: CustomEventKey, handler?: Callback<T>) {
    const onceFired = useRef(false);

    // Emit the event
    const emit = (payload?: T) => {
        window.dispatchEvent(new CustomEvent(eventKey, { detail: payload }));
    };

    // Emit only once
    const emitOnce = (payload?: T) => {
        if (!onceFired.current) {
            emit(payload);
            onceFired.current = true;
        }
    };

    // Debounced emit
    const emitDebounce = (delay: number) => {
        const debounced = debounce((payload: T) => {
            emit(payload);
        }, delay);
        return debounced;
    };

    // Listener
    const listen = (handler: Callback<T>) => {
        const wrapper = (e: Event) => handler((e as CustomEvent<T>).detail);
        window.addEventListener(eventKey, wrapper);
        return () => window.removeEventListener(eventKey, wrapper); // unsubscribe
    };

    const listenOnce = (handler: Callback<T>) => {
        const wrapper = (e: Event) => {
            handler((e as CustomEvent<T>).detail);
            window.removeEventListener(eventKey, wrapper); // auto-remove
        };
        window.addEventListener(eventKey, wrapper);
    };

    return {
        emit,
        emitOnce,
        emitDebounce,
        listen,
        listenOnce

    };
}