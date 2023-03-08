import { PersistOptions } from 'zustand/middleware';
import { StateCreatorMiddware } from '../types';
export type { PersistOptions };
export type Persist = {
    <T extends {}>(create: StateCreatorMiddware<T>, options?: PersistOptions<T>): StateCreatorMiddware<T>;
};
declare const wrapper: (options: PersistOptions<any>) => (fn: any) => StateCreatorMiddware<any>;
export default wrapper;
