import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Layout from './Components/Layout/Layout';
import reportWebVitals from './reportWebVitals';
import appConfig from './Utils/Config';

import './index.css';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <BrowserRouter basename={appConfig.publicUrl}>
    <Layout />
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
