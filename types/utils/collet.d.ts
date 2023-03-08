import { StateCreatorTs, Convert, SetState, GetState, StoreApi } from '../types';
declare const collect: <T extends {}>(func: StateCreatorTs<T, T>, computedCaches: any, suspenseCaches: any) => (set: SetState<Convert<T>>, get: GetState<Convert<T>>, api: StoreApi<Convert<T>>) => Convert<T>;
export default collect;
