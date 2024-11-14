import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';

// import { io } from 'socket.io-client';


// const SERVER_URL = `https://${window.location.hostname}:5000`;

// const socket = io(SERVER_URL);

// socket.on("connect", () => {
//   console.log("Connected to socket server at:", SERVER_URL);
// });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
