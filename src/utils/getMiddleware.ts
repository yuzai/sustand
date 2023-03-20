import { GetWrapper } from '../types';

// 增强原来的 get 方法的能力，支持 'key' 和 函数的 形式
const getWrapper: GetWrapper = (get: any) => (param?: any) => {
    if (typeof param === 'string') {
        return get()[param];
    }
    if (typeof param === 'function') {
        return param(get());
    }
    return get();
};

//@ts-ignore
const getMiddleware = (func) => (_, get, api) => {
    const originGetState = api.getState;

    // eslint-disable-next-line
    api.getState = getWrapper(originGetState);

    const states = func(_, api.getState, api);

    return states;
};

export default getMiddleware;

