import React from 'react';
import { useStore } from '../store';
import { useRenderTimes } from '../hook';

export default () => {
    const renderTimes = useRenderTimes();
    const [title, setTitle] = useStore((state) => {
        return [state.title, state.changeTitle];
    });

    return (
        <div>
            <h1>case2</h1>
            <p>component renderTimes: { renderTimes }</p>
            <p>count: {title}</p>
            <button onClick={() => setTitle('newTitle' + new Date().getTime())}>{`setTitle(newTitle + new Date().getTime())`}</button>
        </div>
    )
}