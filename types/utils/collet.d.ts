import { StateCreatorTs, Convert, StateCreatorMiddware } from '../types';
declare const collect: <T extends {}>(func: StateCreatorTs<T, T>, computedCaches: any, suspenseCaches: any) => StateCreatorMiddware<Convert<T>>;
export default collect;
