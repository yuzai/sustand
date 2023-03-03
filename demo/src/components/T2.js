import React from 'react';
import { useStore } from '@store';
import { useRenderTimes } from '../hook';

export default () => {
    const renderTimes = useRenderTimes();
    const [count, setCount] = useStore('countb');

    const sumABCD = useStore((state) => state.sumCountABCD);

    return (
        <div>
            <h1>case2</h1>
            <p>component renderTimes: { renderTimes }</p>
            <p>countb: {count}</p>
            <p>sumABCD: {sumABCD}</p>
            <button onClick={() => setCount(pre => pre + 1)}>{`setCountB(pre => pre + 1)`}</button>
        </div>
    )
}