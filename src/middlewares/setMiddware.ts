const setMiddleware = (func) => (_, get, api) => {
    const originSetState = api.setState;

    // eslint-disable-next-line
    api.setState = (partial, desc: string) => {
        return originSetState(partial, false, desc);
    };

    const states = func(api.setState, get, api);

    return states;
};

export default setMiddleware;
