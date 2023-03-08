import React, { Suspense, useState } from 'react';
import './index.less';
import T1 from './components/T1';
import T2 from './components/T2';
import T3 from './components/T3';
import T4 from './components/T4';
import T5 from './components/T5';
import T6 from './components/T6';
import T7 from './components/T7';

export default () => {
    const [state, setState] = useState(0);
    return (
        <div className="box">
            <T1 />

            <T2 />

            <T7 />
            <T3 />

            <Suspense fallback={<div className="child">loading</div>}>
                <T4 c={1} />
            </Suspense>
            <Suspense fallback={<div className="child">loading</div>}>
                <T4 c={2} />
            </Suspense>
            <Suspense fallback={<div className="child">loading</div>}>
                <T6 c={3} />
            </Suspense>
            <Suspense fallback={<div className="child">loading</div>}>
                <T5 c={3} />
            </Suspense>
            <Suspense fallback={<div className="child">loading</div>}>
                <T5 c={2} />
            </Suspense>
            <div className="child">
                <button onClick={() => setState(pre => pre + 1)}>refresh</button>
            </div>
        </div>
    )
};
