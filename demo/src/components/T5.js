import React, { useState } from 'react';
import { useStore, useStoreLoadable, useStoreSuspense } from '@store';
import { useRenderTimes } from '../hook';

// useRecoilValue()
// Suspense. 
// Loadable
// Suspense -> Normal.

// Suspense -> Loadable

export default ({
    c
}) => {
    const [count, setCount] = useState(0);
    const renderTimes = useRenderTimes();
    const { data, status, refresh } = useStoreLoadable('suspense2', {
        args: {
            count,
            c: c,
        }
    });

    return (
        <div className="child">
            <h1>case5</h1>
            <p>component renderTimes: { renderTimes }</p>
            <p>data: {data}</p>
            <p>status: {status}</p>
            <button onClick={() => 
                refresh().then(res => console.log(res)).catch(e => console.log(e))}>refresh</button>
            <button onClick={() => setCount(pre => pre + 1)}>count: { count }</button>
            <button onClick={() => refresh(true)}>refresh(true)</button>
        </div>
    )

}