import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { StoreProvider } from './contexts/StoreContext.tsx';
import { RpcProvider } from './contexts/RpcContext.tsx';
import { SocketProvider } from './contexts/SocketContext.tsx';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreProvider>
      <RpcProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </RpcProvider>
    </StoreProvider>
  </StrictMode>,
);