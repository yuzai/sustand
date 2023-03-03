import ReactDOM from 'react-dom';
import { createStore, Provider } from './store2';
import Main from './main';

const store = createStore();

ReactDOM.render(
    <Provider value={store}>
        <Main />
    </Provider>,
    document.getElementById('root'),
);

