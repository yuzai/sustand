import React, { useState } from 'react';
import { useStore } from '../store';
import { useRenderTimes } from '../hook';

export default () => {
    const renderTimes = useRenderTimes();

    const [count, setCount] = useStore('count');

    const refresh = useStore(state => state.refresh);

    const res = useStore('count');

    return (
        <div>
            <h1>case1</h1>
            <p>component renderTimes: { renderTimes }</p>
            <p>count: {count}</p>
            <button onClick={() => setCount(pre => pre + 1)}>{`setCount(pre => pre + 1)`}</button>
            <div onClick={refresh}>refresh</div>
        </div>
    )
}