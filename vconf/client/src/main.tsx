import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { SearchProvider } from './contexts/SearchContext';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <WebSocketProvider>
        <SearchProvider>
          <App />
        </SearchProvider>
      </WebSocketProvider>
    </BrowserRouter>
  </StrictMode>,
);
