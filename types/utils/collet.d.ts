import { StateCreator, Convert, StateCreatorMiddware } from '../types';
declare const collect: <T extends {}>(func: StateCreator<T, T>, computedCaches: any, suspenseCaches: any) => StateCreatorMiddware<Convert<T>>;
export default collect;
