const setMiddleware = (func) => (set, get, api) => {
    const originSetState = api.setState;
    console.log(originSetState, set);

    // eslint-disable-next-line
    api.setState = (partial, desc: string) => {
        console.log(partial, desc);
        return originSetState(partial, false, desc);
    };

    const states = func(api.setState, get, api);

    return states;
};

export default setMiddleware;
