import React from 'react';
import { useStore } from '@store';
import { useRenderTimes } from '../hook';

export default () => {
    const renderTimes = useRenderTimes();
    const [countd, setCountD] = useStore((state) => [state.countd, state.setCountD]);

    return (
        <div>
            <h1>case3</h1>
            <p>component renderTimes: { renderTimes }</p>
            <p>count: {countd}</p>
            <button onClick={() => setCountD((pre) => (pre + 1))}>{`setCountD(pre => pre + 1)`}</button>
        </div>
    )
}