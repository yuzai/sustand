import { createRoot } from 'react-dom/client';
import { Provider, createStore } from './contextstore';
import Main from './main';

const root = createRoot(document.getElementById('root'));

const store = createStore();

root.render(
    <Provider value={store}>
        <Main />
    </Provider>
);

