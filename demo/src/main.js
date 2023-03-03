import React, { Suspense, useState } from 'react';
import T1 from './components/T1';
import T2 from './components/T2';
import T3 from './components/T3';
import T4 from './components/T4';
import T5 from './components/T5';
import T6 from './components/T6';
import T7 from './components/T7';

import T1_1 from './components/store2/T1';
import T2_1 from './components/store2/T2';
// import T1_2 from './components/zustandstore/T1_2';

export default () => {
    const [state, setState] = useState(0);
    return (
        <div>
            <Suspense fallback={<div>loading</div>}>
                <T1_1 />
                <T2_1 />
            </Suspense>
            {/* <T1_2 /> */}
            {/* <T1 /> */}
            {/* <T2 /> */}
            {/* <T7 /> */}
            {/* <T3 /> */}
            {/* <T4 c={1} /> */}
            {/* <T4 c={2} /> */}
            {/* <T4 c={3} /> */}
            <Suspense fallback={<div>loading</div>}>
                {/* <T6 c={1} /> */}
                {/* <T5 c={3} /> */}
            </Suspense>
            <Suspense fallback={<div>loading</div>}>
                {/* <T5 c={2} /> */}
            </Suspense>
            <button onClick={() => setState(pre => pre + 1)}>refresh</button>
        </div>
    )
};
