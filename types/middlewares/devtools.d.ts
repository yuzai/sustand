import { DevtoolsOptions } from 'zustand/middleware';
import { StateCreatorMiddware } from '../types';
declare const wrapper: (options: DevtoolsOptions) => (func: any) => StateCreatorMiddware<{}>;
export default wrapper;
export type { DevtoolsOptions, };
