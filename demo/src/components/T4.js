import React, { useCallback, useState } from 'react';
import { useStore, useStoreSuspense, store } from '@store';
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
    } = useStore('suspense1', {
        // loadable: true,
        // manual: true,
        // args: {
        //     a: 1,
        //     b: 2 + c,
        // }
    });

    return (
        <div className="child">
            <h1>case4-{c}</h1>
            <p>component renderTimes: { renderTimes }</p>
            <p>data: {JSON.stringify(data)}</p>
            <p>status: {JSON.stringify(status)}</p>
            <button onClick={() => {
                console.log(store.getState('suspense1')['default'].refresh(true));
            }}>refresh</button>
            <button onClick={() => setState(pre => pre + 1)}>+1</button>
        </div>
    )

}