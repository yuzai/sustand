import React, { useState } from 'react';
import { useStore, useStoreSuspense } from '@store';
import { useRenderTimes } from '../hook';

export default ({
    c
}) => {
    const [count, setCount] = useState(0);
    const renderTimes = useRenderTimes();
    const { data, status, refresh } = useStoreSuspense('suspense2', {
        args: {
            count,
            c,
        },
        manual: false,
        loadable: true,
    });

    return (
        <div className="child">
            <h1>case6</h1>
            <p>component renderTimes: { renderTimes }</p>
            <p>data: {data}</p>
            <p>status: {status}</p>
            <button onClick={() => 
                refresh().then(res => console.log(res)).catch(e => console.log(e))}>refresh</button>
            <button onClick={() => setCount(pre => pre + 1)}>count: { count }</button>
        </div>
    )

}