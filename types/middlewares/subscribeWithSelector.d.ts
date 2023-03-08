import { StateCreatorMiddware } from '../types';
type SubscribeMiddware = {
    <T extends {}>(create: StateCreatorMiddware<T>): StateCreatorMiddware<T>;
};
declare const subscribeWithSelector: SubscribeMiddware;
export default subscribeWithSelector;
