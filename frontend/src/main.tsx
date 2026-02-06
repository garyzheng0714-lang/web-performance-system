import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import 'antd/dist/reset.css';
import './styles/global.css';
import { App } from './App';
import { store } from './store';
import { setToken } from './slices/authSlice';

const url = new URL(window.location.href);
const token = url.searchParams.get('token');
if (token) {
  localStorage.setItem('token', token);
  store.dispatch(setToken(token));
  url.searchParams.delete('token');
  window.history.replaceState({}, '', url.toString());
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
