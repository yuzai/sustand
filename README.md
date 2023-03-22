---
title: 状态管理
order: 2
group:
  title: 基础
---

# 状态管理

## 介绍

 ```zustand-with-suspense``` 简称 ```sustand``` 采用 集中式的状态管理，同时 **移除了 reducer、action 等概念**，且内部状态无相互依赖，采用 react 的思维模式做状态更新，整体使用心智负担为 0。

内部状态保存默认 **不依赖 context**，带来的好处就是可以在 **任何地方** 进行状态的使用，最常见的场景：动态 modal、im 消息监听，再也不存在 root，动态 model 创建前传全局 props 进去的场景，想用什么，在组件里里直接拿就是了

同时状态库支持 ```suspense``` 的用法，可以方便的管理 loading 态，向更好的用户体验迈进

## 基本用法

### 第一步：创建一个 store

先创建一个 store, 可以把任意的数据放在 store 中，可以是 原始类型的数据、对象、数组，以及 函数。在函数中，通过 immutably 的方式去 set 新的 state，从而触发使用了该状态的组件的 re-render。set 函数内部做了 merge，故只需要更新期望的状态即可。

```js
import create from 'zustand-with-suspense';

const { useStore } = create((set) => ({
    count: 0,
    addCount: () => set((state) => ({ count: state.count + 1 })),
    resetCount: () => set({ count: 0 }),
}));

export { useStore };
```

### 第二步：组件中使用

在 react 任意组件中使用 ``` useStore ```，选择想要使用的状态，组件只会在该状态变化时发生 re-render.

```js
import { useStore } from './store';

function App() {
    const count = useStore((state) => state.count);
    const [addCount, resetCount] = useStore((state) => [state.addCount, state.resetCount]);

    return (
        <div>
            <div>{count}</div>
            <button onClick={addCount}>addCount<button>
            <button onClick={resetCount}>resetCount</button>
        </div>
    )
}
```

## 详细指南

### 获取所有状态

在组件中，可以获取 store 中的所有状态，但是要注意，任何状态的变更都会导致该组件 re-render

```js
const state = useStore(); // 获取到所有状态，但是任何状态变更，都会导致 当前 组件渲染
```

### 选择多个自定义状态

除了通过传递 key 获取 状态 + set 方法外，用户也可自行选取想要的状态。

```js
const [state1, action1] = useStore((state) => [state.state1, state.action1], compareFn || shallow);
```

默认比较函数会是浅比较，故，即便返回的是 [state1, state2] 这样的结构，也无需担心 re-render。除此之外，可自定义比较函数，当状态发生变更时，将会根据该比较函数的结果，来判定当前组件是否重新渲染。

同时返回值并不局限于原 state 的某个属性，也并不局限于数组。比如可以做如下返回：

```js
// 返回原 state 的衍生状态
const sum2 = useStore((state) => state.a + state.b);

// 返回 对象形式的状态
const { state1, action1 } = useStore((state) => ({ state1: state.state1, action1: state.action1 }));
```

当 state 改变时，均会执行该函数，如果返回的结果没有变化，则不触发当前组件的渲染，否则才会渲染当前组件。如果要在这个函数中执行计算较重的逻辑或者多个组件均要使用该结果的话，可以考虑使用下一节介绍的计算属性。

### 计算属性（版本需要大于 0.2.0）

在 store 中，可以这样定义一个计算属性：

```js
import create, { compute } from 'zustand-with-suspense';
const store = create((set, get) => ({
  a: 1,
  b: 2,
  // 定义计算属性
  sumAB: compute((state) => state.a + state.b),
}));

const App = () => {
  // 使用计算属性
  const sumAB = useStore((state) => state.sumAB);
};
```

上述 sumAB 的计算，会在 state 更新时，判断其依赖 state.a 和 state.b 是否发生变更，如果发生变更，则重新计算，同时在使用时，会判断两次计算的结果是否一致，从而确定组件是否需要更新。

这种场景适用于：

1. 计算较重想要降低计算频次
2. 这一计算过程被多个组件频繁使用

此时可以通过该上述方案定义和使用计算属性，需要注意的是，计算属性不可被 set，即使 set 也会无效。

### 以 key 的方式选择状态

通过传递 key 的方式且该 key 值对应的是普通状态： ```const [count, setCount] = useStore('count')``` 获取状态，会自动返回一个 set 原状态的方法，该方法用法同 react 的 useState 返回的方法用法一致。可以直接 set 新值或 使用 ```setState(pre => pre + 1)``` 这样的用法。

该 setState 方法是惰性的且缓存于整个 store 之外，故无需担心同已有的状态键值冲突。

同时 setCount 本身是个静态函数，不会发生改变。

只有 'key' 对应的状态经过浅比较后发生状态变更，才会触发当前组件更新。

```js
import { useStore } from './store';

function App() {
    const [count, setCount] = useStore('count');

    return (
        <div>
            <div>{count}</div>
            <button onClick={() => setCount(9)}>setCount(9)<button>
            <button onClick={() => setCount(pre => pre + 1)}>setCount(pre => pre + 1)</button>
        </div>
    )
}
```

如果对应的值是计算属性(0.2.* 之后的版本支持)，那么会直接返回属性的值，并不会返回 set 该计算属性的方法，如果是 suspense 属性，等同于 useStoreSuspense(0.2.* 之后的版本支持)，具体查看使用 suspense 一节。如下：

```js
const App = () => {
  // sumAB 是计算属性，那么返回的就是值，这一点编辑器会根据推导出的类型做相应提示
  const sumAB = useStore('sumAB');
  // a 是普通属性，那么返回的就是值和set值的方法，这一点编辑器会根据推导出的类型做相应提示
  const [a, setA] = useStore('a');
  // suspenseA，是 suspense 属性，那么就等同于 useStoreSuspense('suspenseA')，具体可以查看使用 suspense 一节
  const {data, status, error} = useStore('suspenseA');
}
```

### 异步 actions 

一般来讲，如果在 create 中定义了一个状态，该状态是个函数，我们称之为 action。将全局的 action 统一管理，这是一些原子化的状态管理不容易做到的(在原子化的方案中，全局的action 一般通过 自定义 hooks 实现)。sustand 本身其实并不关心 action 是否是异步，当数据准备好了，调用 set 方法即可。

```js
import create from 'zustand-with-suspense';

const { useStore } = create((set) => ({
    useInfo: {},
    getUserInfo: async (uid) => {
        const userInfo = await Fetch('xxx', {
            data: {
                uid,
            }
        });
        set({
            useInfo,
        })
    }
}))
```

### 在 action 中获取状态

```set``` 操作本身允许函数的写法 ```set(state => result)```，但是本身也可以通过 ```get``` 方法获取其他状态

```js
import create from 'zustand-with-suspense';

const { useStore } = create((set, get) => ({
    uid: 'xxx',
    useInfo: {},
    action: () => {
        // 也可以直接从所有状态中 pick 出来
        // const uid = get().uid;
        const uid = get('uid');
        // ...
    }
}))
```

### 使用 suspense

suspense 状态本身是一个特殊的状态，使用提供的 ```suspense``` 方法进行生成。

该方法接收一个返回 Promise 的函数，该 Promise 返回的值，便是该状态对应的 data

```js
import create, { suspense } from 'zustand-with-suspense';

const { useStore, useStoreSuspense } = create((set, get) => ({
  // 定义状态
  count: 0,
  userInfo: suspense(
    (args) => {
      const count = get('count');
      // 返回 promise 即可，该值便是 userInfo 的值
      return fetch('');
    },
  )
}));

export {
  useStore,
  useStoreSuspense,
}
```

定义好之后，可以直接通过 ```useStoreSuspense``` 获取该状态的值，注意：需要在外层包裹 ```React.suspense``` 和 ```ErrorBoundary```。默认提供的 ```refresh``` 函数，在执行时会走 loadable 逻辑，如需依旧触发 ```suspense```，那么只需要 ```refresh(true)``` 即可。 

```js
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useStoreSuspense } from '../store';

const Child = () => {
  // 必须指定 key
  // 默认首次抛出 suspense, 后续 refresh 及 组件 re-render 会是 loadable
  // 同时有 options 支持配置，具体见 api 定义处
  const { data, refresh, status } = useStoreSuspense('userInfo');

  return (
    <div>
      <div>{JSON.stringify(data)}</div>
      <div onClick={refresh}>refresh</div>
    </div>
  )
}

const App = () => {

  return (
    // 包一层 errorboundary，catch promise error 的场景
    <ErrorBoundary FallbackComponent={({error} => <div>error.message</div>)}>
      // 包一层 suspensen，catch promise loading 的情况
      <React.Suspense fallback={<div>loading</div>}>
        <Child />
      </React.Suspense>
    </ErrorBoundary>
  )
}
```

### 使用 suspense loadable

同 ```suspense``` 一致，因为本身 ```loadable``` 便是 ```suspense``` 的一种特殊场景，内部也仅仅是通过一个 ```option``` 进行了控制。

```js
import create, { suspense } from 'zustand-with-suspense';

const { useStore, useStoreLoadable } = create((set, get) => ({
  // 定义状态
  count: 0,
  userInfo: suspense(
    (args) => {
      const count = get('count');
      // 返回 promise 即可，该值便是 userInfo 的值
      return fetch('');
    },
    {
      // 定义初始值，可选
      initialValue: {},
    }
  )
}));

export {
  useStore,
  useStoreLoadable,
}
```

组件内使用 ```loadable```。

```js
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useStoreLoadable } from '../store';

const Child = () => {
  // 必须指定 key
  // 默认首次抛出 suspense, 后续 refresh 及 组件 re-render 会是 loadable
  // 同时有 options 支持配置，具体见 api 定义处
  const { data, refresh, status } = useStoreLoadable('userInfo');

  useEffect(() => {
    // 需要自行根据 statue 处理数据的返回
    // status: 'pending' | 'fullfilled' | 'rejected',
    console.log(status);
  }, [status]);

  return (
    <div>
      <div>{JSON.stringify(data)}</div>
      <div onClick={refresh}>refresh</div>
    </div>
  )
}

const App = () => {

  return (
    // loadable 无需包裹
    <Child />
  )
}
```

### 在组件外读取状态、更新状态，监听状态变化

```js
const { store } = create(() => ({
    count: 0,
    addCount: () => {
        set(state => ({
            count: state.count + 1,
        }))
    }
}));

// 获取全部状态
const states = store.getState();
// 通过 key 获取状态
const count = store.getState('count');
// 通过函数自行选择状态
const addCount = store.getState((state) => state.addCount);

// 监听所有变化，state 发生变化，就执行变更
const unsub = store.subscribe(console.log);

// 更新状态
store.setState({
    count: 100,
});

// 移除监听
unsub();

// 摧毁 store (移除监听者)
store.destroy()
```

### 在 actions 中返回数据

除了在 actions 中 set 来修改状态外，actions 本身就是一个普通的函数，只是通过闭包保留了 store 的 get, set 方法，所以本身 actions 也可以有返回值，这个值可以是任何类型。

```js
import create from 'zustand-with-suspense';

const { useStore, store } = create((set, get) => ({
    uid: 'xxx',
    useInfo: {},
    action: () => {
        // 也可以直接从所有状态中 pick 出来
        // const uid = get().uid;
        const uid = get('uid');
        // ...
        return uid;
        // 返回 promise
        // return Promise.resolve(uid);
    }
}))

// 在组件中使用 
const App = () => {
  const action = useStore(state => state.action);
  const dataRef = useRef(store.getState('uid'));
  const [uid, setUid] = useState(store.getState('uid'));

  return (
    <div onClick={() => {
      const uid = action();
      // 干些事情
      dataRef.current = uid; // 不触发组件更新的情况下同步数据
      // 也可以 setState 触发本组件的更新
      setUid(uid);
    }}>action</div>
  )
}
```

由于在 action 没有 使用 set (也可以使用 set)，故执行该 action 其实不会触发任何 组件的更新，有些场景下，这就是期望的行为，也可以通过这种方式来避免组件的 re-render。

## context 模式、SSR 用法支持

### context 模式

支持了 context 的方案，用户可以通过如下方式进行 context 定义：

```js
import create, { createContext } from "zustand-with-suspense";

const createFn = (set, get) => ({
    a: 1,
    b: 2,
    count: 0,
    setA: (a) => {
      set(
        a,
      )
    },
    computedValue: compute((state) => {
        return state.a + state.count
    }),
});

const {
    Provider,
    useStore,
    // store 变成了 getStore
    getStore,
// 此处 createFn 的传入，仅仅是为了在 js 下，利用编辑器的类型推断，提供使用时更好的类型声明，实际内部并未调用 createFn
} = createContext(createFn);

const createStore = () => create(createFn);

export {
    Provider,
    useStore,
    createStore,
    getStore,
}
```

具体使用时，如下：

```js
import { Provider, createStore } from './store';

const store = createStore();

const App = () => {
  return (
    <Provider value={store}>
     {
      // 子组件中可以使用 useStore, useStoreSuspense 等方法。
     }
    </Provider>
  )
}
```

### renderToPipableStream ssr 支持

借助本状态管理库内置的 suspense 方案，开发者可以用两行代码完成分批次注水的逻辑，使用如下：

```js
// app.js
const App = () => (
    <Suspense>
        <Comp />
    </Suspense>
);

// component.js
export default () => {
    // loadScript 即是分批次注水的逻辑，开发者仅仅需要将该字段渲染在 dom 结构中即可
    const { data, refresh, loadScript } = useStoreSuspense('compData');
    
    return (
        <div>
            <div>{data.xxx}</div>

            /* 通过该脚本对数据进行注入，内部在注水完成后进行清理 */
            {loadScript}
        </div>
    )
}
```

完整的 ssr demo: todo;

## 中间件

### 自定义中间件

中间件的本质就是一个高阶函数，其接受 create 函数作为入参，返回一个新的 create 方法，这个方法中，可以通过修改 get, set 参数来达到想要的中间件效果。

比如一个常见的自定义的 log 中间件：

```js
const logMiddware = (fn) => (set, get, ...args) => fn(
  (...args) => {
    console.log('applying', args);
    set(...args);
    console.log('new state', get());
  },
  get,
  ...args,
);
```

### redux devtools

库本身也有一些中间件，比如 redux-devtools。该中间件将数据同步给 redux-devtools  chrome 插件，从而可以更方便的查看状态的变迁。使用方法如下：

```js
import create, { devtools } from 'zustand-with-suspense';

const { useStore } = create(
  (set, get) => (
    count: 0,
    setCount: () => {
      set(
        {
          count: 1,
        },
        // 此时 set 的第二个参数，将会被作为 action name 展示在 redux-devtools 面板上
        'setCount 1',
        // 对于通过 const [count, setCount] = useStore('count') 拿到的返回值，会统一增加内部的 action name，包括 suspense value 对应的状态改变
      );
    }
  ),
  {
    middwares: [
      devtools({
        // 是否启动，可以根据是否生产环境进行变更
        enable: true,
        // redux-devtools 的 store name
        name: 'xxx',
        // 更多的参数可以去 DevtoolsOptions 的定义查看，最常用的就是上述两个参数
      })
    ],
  }
);
```

0.1.x 版本使用方法如下：建议升级。

```js
import create, { devtools } from 'zustand-with-suspense';

const { useStore } = create(devtools(
  (set, get) => (
    count: 0,
    setCount: () => {
      set(
        {
          count: 1,
        },
        // 此时 set 的第二个参数，将会被作为 action name 展示在 redux-devtools 面板上
        'setCount 1',
        // 对于通过 const [count, setCount] = useStore('count') 拿到的返回值，会统一增加内部的 action name，包括 suspense value 对应的状态改变
      );
    }
  ),
  {
    // 是否启动，可以根据是否生产环境进行变更
    enable: true,
    // redux-devtools 的 store name
    name: 'xxx',
    // 更多的参数可以去 DevtoolsOptions 的定义查看，最常用的就是上述两个参数
  }
));
```

### subscribeWithSelector

注意：0.2.x 版本之后废弃，直接进行了内置，开发者可以直接通过 store.scribeWithSelector 进行使用

subscribeWithSelector 中间件，增强了原本 store 中的 subscribe 方法，可以监听部分 state 的变化来触发监听器，用法如下。

```js
import create, { subscribeWithSelector } from 'zustand-with-suspense';

const { store } = create(subscribeWithSelector((set, get) => (
  count: 0,
  setCount: () => {
    set({
      count: 1,
    })
  }
)));

// 使用了该中间件后， store 会多出来一个 subscribeWithSelector 方法
store.subscribeWithSelector(
  // 选择想要监听的属性，当属性发生变更时，就会触发 listener
  (state) => state.count,
  // listener，会拿到选择器中返回的新旧数据
  (curCount, preCount) => {
    console.log(curCount, preCount);
  },
  // 可选，默认会进行浅比较
  equalityfn?
);
```

### persist storage 中间件

这个中间件可以在 storage 中缓存全局数据，默认 storage 指向 localStorage，用法如下：

```js
import create, { persist } from 'zustand-with-suspense';

const { useStore } = create(
  (set, get) => ({
  }),
  {
    middwares: [
      persist({
        name: 'test-name',
        storage: () => sessionStorage, // 默认指向 localStorage
        // 选择部分状态进行持久化
        partialize: (state) => ({
            autoStart: state.autoStart,
        }),
        // 更多选项可以查看 PersistOptions 的定义
      }),
    ],
  }
);
```

0.1.x 版本使用方法如下：(ps: 建议升级，除了中间件不兼容，其他均兼容)。

```js
import create, { persist } from 'zustand-with-suspense';

const { useStore } = create(persist((set, get) => ({

}), {
  name: 'test-name', // 存入 storage 中的 key，此时可以通过 storage.getItem('test-name') 获取缓存的值,
  storage: () => sessionStorage, // 默认指向 localStorage
  merge: (persistState, currentState) => ({
    ...currentState,
    ...persistState,
  }), // 可选，缓存值与初始值的合并规则,
  // 更多选项可以查看 PersistOptions 的定义
}));
```


## 最佳实践

### 多 store 使用

我们的 h5 项目一般以多页的方式去组织，此时页面间 store 也互不干扰，故一般情况下，每个页面单独使用 ```create``` 创建一个 store 即可。

但是在后台项目中，存在一些公共的全局状态（比如 登陆状态，用户信息等），所有页面都要使用，对于这种情况，推荐的用法是创建一个或多个全局的 ```store```，在组件内使用的时候通过 ```useStoreA```, ```useStoreB``` 的方式进行区分，示例写法如下：

```js
// 创建存放用户登陆状态的 store
// store/loginStore.js
const { useStore, loginStore } = create(() => ({
  login: true,
  getLogin: () => {
    fetch('').then((res) => set({ login: res }))
  }
}));

export { loginStore };

export default useStore;

// 创建存放页面 权限、白名单 等信息
// store/permissions.js
const { useStore, permissionsStore } = create(() => ({
  permissions: ['pageA', 'pageB', 'pageC'],
  getPermissions: () => {
    fetch('').then((res) => set({ permissions: res }})
  }
}));

export default permissionStore;

export default useStore;
```

在某个组件中使用:

```js
// pageA/index.js
import useLoginStore from 'store/loginStore.js';
import usePermissionStore from 'store/permissions';
// 也可以引入 页面自己的store
import useStore from './store';

const App = () => {
  const login = useLoginStore(state => state.login);
  const [permissions] = usePermissionStore('permissions');
  const localStore = useStore();

  // ... some react components render
}
```

在一个项目中，可以存在多个全局的 store，而每个页面也可以存在自己的 store，通过 useXXStore 即可将状态进行区分，从而将全局状态独立出来管理，降低全局状态维护的重复性。

### 状态数量太多，如何更好的维护 --- split slices

在我们开发 h5 或者 运营后台的页面时，对于同一个页面，也会存在很多相互独立、但是整体状态数量很多的情况，比如多个 tab 下不同子 tab 的状态，其实相互之间关联度并不高，此时一方面可以通过上述的 多 store 进行拆分，但是有可能写着写着，状态之间可能会衍生出会相互的关联（此时也有操作方法，将在下文的[多 store 间的交互](#多-store-下相互之间的状态交互处理)介绍），故此时更推荐另一种方案：将状态生成打散成不同的 createXXSlice，示例如下：

```js
// 页面中 tab1 相关的逻辑
// store/tab1.js
const createTab1Slice = (set, get, api) => ({
  stateA: 0,
  addStateA: () => set((state) => ({ stateA: state.stateA + 1 })),
});

export default createTab1Slice;

// 页面中 tab2 相关的逻辑
// store/tab2.js
const createTab2Slice = (set, get, api) => ({
  stateB: 100,
  decreaseB: () => {
    const stateB = get('stateB');
    set({
      stateB: stateB + 1;
    })
  }
});

export default createTab2Slice;

// 合并 slices
// store/index.js
import create from 'zustand-with-suspense';

const { useStore } = create((...params) => ({
  ...createTab1Slice(...params),
  ...createTab2Slice(...params),
}));

export default useStore;
```

在组件中使用：

```js
// pageA/index.js
import useStore from 'store/index.js';

const App = () => {
  const [stateA, addStateA] = useStore((state) => [state.stateA, state.addStateA]);
  const { stateB, decreaseB } = useStore((state) => ({
    stateB: state.stateB,
    decreaseB: state.decreaseB,
  }))

  // some react components render
}
```

通过上述代码，可以看出来，其实 ```store``` 本质还是一个，只是把 ```store``` 的创建函数，在代码组织上打散成了多个文件，而在 ```store/index.js``` 中，通过解构同时进行了多个创建函数的执行。

所以，按照这种写法，其实在 ```addStateA``` 中，是能够通过 ```get('stateB')``` 获取到 ```store/tab2.js``` 中定义的 ```stateB```，故也为后续可能存在的状态关联留下简单的修改空间。

但是如果后期这样的操作变多，就需要思考状态的 slice 划分是否存在不合理的情况，同时也可以单独新建一个 ```store/tab1tab2.js``` 的 slice，来专门处理这种耦合的操作。如下：

```js
// 处理需要同时操作 tab1, tab2 状态的耦合逻辑
// store/tab1tab2.js
const createTab1Tab2Slice = (set, get, api) => ({
  addStateADelStateB() {
    const addStateA = get('addStateA');
    const decreaseB = get('decreaseB');
    addStateA();
    decreaseB();
  },
});

export default createTab1Tab2Slice;

// 修改 store/index.js
import create from 'zustand-with-suspense';

const { useStore } = create((...params) => ({
  ...createTab1Slice(...params),
  ...createTab2Slice(...params),
  ...createTab1Tab2Slice(...params),
}));

export default useStore;
```

可以看出来，这种方法背后其实框架层面没有做什么额外的操作，此章节也仅仅是推荐的一种维护方法，方便降低在过多状态下代码的维护成本。

### 多 store 下，相互之间的状态交互处理

如前文 [多 store](#多-store-使用) 使用场景中描述的，在后台这种需要维护一些全局状态的情况下，拆出了多个独立的全局 store，刚开始使用没什么问题，但是后期几个全局 store 状态间产生了相互依赖，比如 getPermission 方法先检查 login 状态再做后续操作。

遇到这种场景，应该思考下，两个全局 store 是否应该合并成一个？如果合并后状态数量太多的话，可以考虑[上一节](#状态数量太多如何更好的维护-----split-slices)讲述的 slice 写法。

但是业务需求紧张的情况下，不想改造，也有简单的写法，一个简单示例如下：

```js
// 创建存放用户登陆状态的 store
// store/loginStore.js
const { useStore, loginStore } = create(() => ({
  login: true,
  getLogin: () => {
    fetch('').then((res) => set({ login: res }))
  }
}));

export { loginStore };

export default useStore;

// 创建存放页面 权限、白名单 等信息
import { loginStore } from './loginStore';
// store/permissions.js
const { useStore, permissionsStore } = create(() => ({
  permissions: ['pageA', 'pageB', 'pageC'],
  getPermissions: () => {
    // 通过 loginStore 的 getState 方法获取
    const login =  loginStore.getState('login');
    fetch('', {
      data: {
        login,
      }
    }).then((res) => set({ permissions: res }})
  }
}));

export default permissionStore;

export default useStore;
```

上述代码在 getPermissions 中获取了 loginStore 中的 login 状态，从而打破了两者之间的信息的独立。

同时，也可以通过 loginStore.subscribe, loginStore.setState 监听及修改原 store 的状态，具体可以参考 [在组件外读取状态更新状态监听状态变化](#在组件外读取状态更新状态监听状态变化)。

但是这种写法存在一个天然的缺陷：循环引用。当 loginStore 也需要获取 permissionStore 中的状态时，此时两个文件便会存在循环引用的场景，此时不论是 elint, 还是实际执行，都会出错。

出现这样的场景，除了可以通过 slice 写法或者直接合并 create 方法的手段将两个 store 整合成一个 store 外，也可以通过新建第三个 store，将相互之间的操作均放在 第三个 store 中即可解决循环引用的问题。实际遇到这样的场景，建议第一考虑状态合并，如果状态数量太多，建议通过 slice 的方案处理，时间紧张的情况下，可以通过新建 store 的方案处理

### 批量更新

在使用 react 旧版本的过程中，经常会出现异步情况下，setState 多次导致同步组件多次渲染的场景，react 新版本底层已经默认处理了该场景。本状态管理库同 react 的行为始终保持一致，并不会内部自动进行自动批量的操作，同 react 普通 state 的行为完全一致。具体到实际场景，分为以下几种情况：

1. 在 同步的 action 中，多次 set，只会导致相关组件渲染一次，会被自动合并，同 普通的 react state 表现一致
2. 在 异步的 action 中，多次 set，会根据 react 的版本不同而出现 多次渲染 or 被合并渲染 (react 新版)，同普通的 react state 表现一致。此时，一方面可以通过 ```ReactDOM.unstable_batchedUpdates``` 包裹多次 set 执行，也可以选择将多个 set 合并到 一个 set 中。具体改法如下：

```js
const { useStore } = create((set, get) => ({
  stateA: 0,
  stateB: 1,
  stateC: 2,
  setCountAsync: () => {
    setTimeout(() => {
      // 方法一：unstable_batchedUpdates 合并异步操作
      ReactDOM.unstable_batchedUpdates(() => {
        set(state => ({
          stateA: state.stateA + 1,
        }));

        set(state => ({
          stateB: state.stateB + 1,
        }));

        set(state => ({
          stateC: state.stateC + 1,
        }));
      });

      // 方法二：合并到一次 set 中
      set(state => ({
        stateA: state.stateA + 1,
        stateB: state.stateB + 1,
        stateC: state.stateC + 1,
      }))
    }, 1000);
  }
}));
```

### immer 配合使用

在简单的场景下，```set({ count: 1 })```  这样的写法还能够接受，但是对于嵌套较深的 state，每次修改的解构略显麻烦，比如一个嵌套较深的数据结构：

```js
import create from 'zustand-with-suspense';

const { useStore } = create((set, get) => ({
  gameInfo: {
    userA: {
      baseInfo: {
        gender: 'boy',
        nickname: 'hhboy',
      },
      extraInfo: {
        name: 'A',
        age: 12,
      }
    },
    useB: {
      baseInfo: {
        gender: 'girl',
        nickname: 'hhgirl',
      },
      extraInfo: {
        name: 'B',
        age: 12,
      }
    }
  },
  changeUserAGender: (gender) => {
    set(state => ({
      // 疯狂解构
      gameInfo: {
        ...state.gameInfo,
        userA: {
          ...state.gameInfo.userA,
          baseInfo: {
            ...state.gameInfo.userA.baseInfo,
            gender,
          }
        }
      }
    }))
  },
}))
```

上述的疯狂解构操作还是很可怕的，此时可以使用 immer 来解决该问题，修改如下：

```js
import create from 'zustand-with-suspense';
import produce from 'immer'

const { useStore } = create((set, get) => ({
  gameInfo: {
    userA: {
      baseInfo: {
        gender: 'boy',
        nickname: 'hhboy',
      },
      extraInfo: {
        name: 'A',
        age: 12,
      }
    },
    useB: {
      baseInfo: {
        gender: 'girl',
        nickname: 'hhgirl',
      },
      extraInfo: {
        name: 'B',
        age: 12,
      }
    }
  },
  changeUserAGender: (gender) => {
    set(produce(state => {
      state.gameInfo.userA.baseInfo.gender = gender;
    }))
  },
}))
```

可以看到，去除了解构的代码非常简便，虽然写法上不符合 react 不可变的写法，但是实际 immer 帮我们做了不可变的操作。

对于复杂解构的情况，使用 immer 可以大幅简化代码。


## 核心内部原理

核心代码除去换行，空格应该不到 40 行，故直接上代码

```js
import { useState, useEffect } from 'react';

const create = (createStore) => {
  let state = {};
  const listeners = new Set();

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  // 省略了传 key，传 function 获取 state 的场景
  const getState = () => state;

  const setState = (partial) => {
    let nextState = partial;
    if (typeof partial === 'function') {
      nextState = partial(state);
    }
    const previousState = state;

    state = Object.assign({}, state, nextState);

    listeners.forEach((listener) => listener(state, previousState));
  };

  const destroy = () => listeners.clear();

  const api = { setState, getState, destroy, subscribe };

  state = createStore(setState, getState, api);

  // useStore 省略了 key 的场景，仅处理 选择器的场景, 默认的 比较函数是 shallow 浅比较,此处仅为示意
  const useStore = (selector, equalityFn = Object.is) => {
    // 为了方便使用了 forceUpdate，实际内部使用了 react 提供的 useSyncExternalStoreExports
    const [, forceUpdate] = useState(0);
    useEffect(
      () =>
        subscribe((curState, nextState) => {
          if (!equalityFn(selector(curState), selector(nextState))) {
            forceUpdate((pre) => pre + 1);
          }
        }),
      []
    );

    return selector(state);
  };

  return {
    useStore,
    store: api,
  };
};

export default create;
```

从代码中，可以看出，其本质便是借助了发布订阅模式，每次 useStore 相当于增加了一次订阅，内部通过比较 selector 的结果来判断是否进行 forceUpdate，当 setState 的时候，触发所有的监听器，而组件内部通过 selector 来避免了 re-render。

## ts 使用

本项目对 ts 做了深度的支持，使用 ts 可以得到更完善的类型支持。同时由于使用了 Awaited 这样的新增工具类型，需要 typescript 版本大于等于 4.5。

### 基本使用

```ts
import create, {
    compute,
    Computed,
    Suspensed,
    suspense,
} from 'zustand-with-suspense';

interface Store {
  counta: number,
  countb: number,
  sumAB: Computed<Store, number>,
  suspenseV1: Suspensed<Store, string>,
};

const { useStore } = create<Store>()((set, get) => ({
  counta: 1,
  countb: 2,
  sumAB: compute((state) => state.counta + state.countb),
  suspenseV1: suspense(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('1');
      }, 1000);
    })
  })
}))
```

要注意的是 ```create<Store>()()``` 中的括号，因为 ts 中类型推导存在的一些问题，必须通过上述方式主动进行类型的注入，而不能依赖其返回值，同时需要增加一次调用来实现部分类型的推导。这一点同 zustand 保持一致，更深层次的原因可以查看 [此文档](https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md)。

### slice store模式

slice 模式下的写法如下：

```ts
import create, {
    devtools,
    compute,
    Computed,
    StateCreator,
    createContext,
} from 'zustand-with-suspense';

interface StoreA {
  a: number,
  b: number,
  // 注意此处是 StoreA & StoreB，因为在 compute 属性中，是能够访问到 store 的所有属性的
  sumAB: Computed<Store, number>
}

interface StoreB {
  c: number,
  d: number,
  sumCD: Computed<Store, number>
}

type Store = StoreA & StoreB;

const createSliceA: StateCreator<Store, StoreA> = (set, get) => ({
  a: 1,
  b: 2,
  sumAB: compute((state) => state.a + state.b),
})

const createSliceB: StateCreator<Store, StoreB> = (set, get) => ({
  c: 1,
  d: 2,
  sumCD: compute((state) => state.c + state.d),
})

const { useStore, useStoreSuspense, useStoreLoadable } = create<Store>()((...a) => ({
    ...createSliceA(...a),
    ...createSliceB(...a),
}));
```

## 为什么不直接使用 zustand

本状态库在 zustand 基础上，各方面进行了增强，功能上是 zustand 的超集，主要包含了一下两个方面的提升：

1. 用法上的提升
    1. 状态获取更简洁
    2. commit 参数移动
    3. js 下，编辑器对类型的提示尽可能的完善
    4. 更加贴近 useState 的用法
    5. 用浅比较作为默认的比较器
2. 功能上的提升
    1. 衍生状态 compute
    2. Suspense 支持
    3. renderToPipeableStream 支持

相信我，sustand 在各方面，都会比 zustand 更加顺手，且 suspense 的支持能够用更少的代码完成 loading 态的维护。