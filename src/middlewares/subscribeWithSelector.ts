import { shallow } from 'zustand/shallow';
import { StateCreatorMiddware } from '../types';

type SubscribeMiddware = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    <T extends {}>(create: StateCreatorMiddware<T>): StateCreatorMiddware<T>,
};

const subscribeWithSelector: SubscribeMiddware = (fn) => (
    set,
    get,
    api
) => {
    type S = ReturnType<typeof fn>;
    type Listener = (state: S, previousState: S) => void;
    const origSubscribe = api.subscribe as (listener: Listener) => () => void;
    // eslint-disable-next-line
    api.subscribeWithSelector = ((selector: any, optListener: any, options: any) => {
        let listener: Listener = selector; // if no selector
        if (optListener) {
            const equalityFn = options?.equalityFn || shallow;
            let currentSlice = selector(api.getState());
            listener = (state) => {
                const nextSlice = selector(state);
                if (!equalityFn(currentSlice, nextSlice)) {
                    const previousSlice = currentSlice;
                    optListener((currentSlice = nextSlice), previousSlice);
                }
            };
            if (options?.fireImmediately) {
                optListener(currentSlice, currentSlice);
            }
        }
        return origSubscribe(listener);
    }) as any;
    const initialState = fn(set, get, api);
    return initialState;
};

export default subscribeWithSelector;
