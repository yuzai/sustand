import { PersistOptions } from 'zustand/middleware';
import { SetState, GetState, StoreCreateApi } from '../types';
export { PersistOptions };
export type Persist = {
    <T>(create: (set: SetState, get: GetState, api: StoreCreateApi) => T, options?: PersistOptions<T>): (set: SetState, get: GetState, api: StoreCreateApi) => T;
};
declare const persist: Persist;
export default persist;
