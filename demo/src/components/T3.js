import React, { useCallback } from 'react';
import { useStore } from '@store';
import { useRenderTimes } from '../hook';

export default () => {
    const renderTimes = useRenderTimes();
    const [countd, setCountD] = useStore((state) => {
        return [state.countd, state.setCountD]
    });

    return (
        <div className="child">
            <h1>case3</h1>
            <p>component renderTimes: { renderTimes }</p>
            <p>count: {countd}</p>
            <button onClick={() => setCountD((pre) => (pre + 1))}>{`setCountD(pre => pre + 1)`}</button>
        </div>
    )
}