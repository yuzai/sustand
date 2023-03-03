import React from 'react';
import { useStore } from '../store';
import { useRenderTimes } from '../hook';

export default () => {
    const renderTimes = useRenderTimes();
    const obj = useStore((state) => state.obj);
    const setObj = useStore((state) => state.setObj);

    return (
        <div>
            <h1>case3</h1>
            <p>component renderTimes: { renderTimes }</p>
            <p>count: {JSON.stringify(obj)}</p>
            <button onClick={() => setObj((pre) => ({a: pre.a + 1, b: 2}))}>{`setObj({a: 1, b: 2})`}</button>
        </div>
    )
}