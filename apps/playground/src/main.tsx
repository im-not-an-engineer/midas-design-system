import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// 소비 제품이 하는 일은 이 두 줄이 전부다.
import '@ax/react/styles.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
