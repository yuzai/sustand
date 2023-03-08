import create, { createContext, suspense } from "sustand";

const { useStore, Provider } = createContext();

const createStore = () => create(() => ({
    count: 1,
    delayNValue: suspense(({
        delay,
    }) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(Math.random());
            }, delay * 1000);
        })
    }),
    rejectNValue: suspense(({
        delay,
    }) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(Math.random());
            }, delay * 1000);
        })
    })
}));

export {
    createStore,
    useStore,
    Provider,
};
