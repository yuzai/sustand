import React, { useState } from 'react';
import { useStore } from '../store';
import { useRenderTimes } from '../hook';

export default () => {
    const renderTimes = useRenderTimes();

    const [gameInfo, changeUserAGender] = useStore(state => [state.gameInfo, state.changeUserAGender]);

    // console.log(gameInfo);

    return (
        <div className="child">
            <h1>case7</h1>
            <p>component renderTimes: { renderTimes }</p>
            <p>count: {gameInfo.userA.baseInfo.gender}</p>
            <button onClick={() => changeUserAGender('hhh')}>{`changeUserAGender('hhh')`}</button>
        </div>
    )
}