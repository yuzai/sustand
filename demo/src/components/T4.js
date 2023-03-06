import React, { useCallback, useState } from 'react';
import { useStore, useStoreSuspense } from '@store';
import { useRenderTimes } from '../hook';

export default ({
    c
}) => {
    const renderTimes = useRenderTimes();
    const [state, setState] = useState(0);

    const {
        data,
        status,
        refresh,
    } = useStoreSuspense('suspense1', {
        // loadable: true,
        // manual: true,
        args: {
            a: 1,
            b: 2 + c,
        }
    });

    return (
        <div className="child">
            <h1>case4-{c}</h1>
            <p>component renderTimes: { renderTimes }</p>
            <p>data: {JSON.stringify(data)}</p>
            <p>status: {JSON.stringify(status)}</p>
            <button onClick={() => refresh()}>refresh</button>
            <button onClick={() => setState(pre => pre + 1)}>+1</button>
        </div>
    )

}