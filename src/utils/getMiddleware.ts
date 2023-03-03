import getWrapper from './getWrapper';

const getCache = (get: any, suspenseCaches: any) => (key, inputs = null) => {
    const res = get(key);

    if (res && res.sustand_internal_issuspense) {
        return suspenseCaches.get(JSON.stringify([key, inputs]))?.getState();
    }

    return res;
};

const getMiddleware = (func: any, suspenseCaches: any) => (set: any, get: any, api: any) => {
    const states = func(set, getCache(getWrapper(get), suspenseCaches), api);

    return states;
};

export default getMiddleware;
