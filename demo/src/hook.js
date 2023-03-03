import { useRef } from 'react';

export const useRenderTimes = () => {
    const renderTimesRef = useRef(0);

    renderTimesRef.current = renderTimesRef.current + 1;

    return renderTimesRef.current;
}