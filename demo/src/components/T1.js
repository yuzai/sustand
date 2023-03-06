import React, { useState } from 'react';
import { useStore } from '@store';
import { useRenderTimes } from '../hook';

export default () => {
    const renderTimes = useRenderTimes();

    const [count, setCount] = useStore('counta');

    const sumAB = useStore((state) => state.sumCountAB);

    return (
        <div className="child">
            <h1>case1</h1>
            <p>component renderTimes: { renderTimes }</p>
            <p>counta: {count}</p>
            <p>sumAB: {sumAB}</p>
            <button onClick={() => setCount(pre => pre + 1)}>{`setCountA(pre => pre + 1)`}</button>
        </div>
    )
}