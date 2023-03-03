import { SetState, GetState, StoreCreateApi } from '../types';
type SubscribeMiddware = {
    <T>(create: (set: SetState, get: GetState, api: StoreCreateApi) => T): (set: SetState, get: GetState, api: StoreCreateApi) => T;
};
declare const subscribeWithSelector: SubscribeMiddware;
export default subscribeWithSelector;
