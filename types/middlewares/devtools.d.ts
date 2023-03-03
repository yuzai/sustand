import { DevtoolsOptions } from 'zustand/middleware';
import { SetState, GetState, StoreCreateApi } from '../types';
type Devtools = {
    <T>(create: (set: SetState, get: GetState, api: StoreCreateApi) => T, options?: DevtoolsOptions): (set: SetState, get: GetState, api: StoreCreateApi) => T;
};
declare const devtools: Devtools;
export default devtools;
export { DevtoolsOptions, };
