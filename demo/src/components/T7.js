import React, { useState } from 'react';
import { useStore } from '../contextstore';
import { useRenderTimes } from '../hook';

export default () => {
    const renderTimes = useRenderTimes();

    const count = useStore((state) => state);

    return (
        <div className="child">
            <h1>case7</h1>
            <p>component renderTimes: { renderTimes }</p>
            <p>count: {JSON.stringify(count)}</p>
            {/* <button onClick={() => changeUserAGender('hhh')}>{`changeUserAGender('hhh')`}</button> */}
        </div>
    )
}