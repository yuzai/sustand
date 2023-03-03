import React, { useCallback, useState } from 'react';
import { useStore, useStoreLoadable } from '../store';
import { useRenderTimes } from '../hook';

export default ({
    c
}) => {
    // const [count] = useStore('count');
    const renderTimes = useRenderTimes();

    const {
        data,
        status,
        refresh,
    } = useStoreLoadable('loadingValue', {
        args: {
            a: 1,
            b: 2,
        }
    });

    return (
        <div>
            <h1>case4</h1>
            <p>component renderTimes: { renderTimes }</p>
            <p>data: {JSON.stringify(data)}</p>
            <p>status: {JSON.stringify(status)}</p>
            <button onClick={refresh}>refresh</button>
        </div>
    )

}