import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/login';
import Main from './pages/main';
import { useAuth } from './utils/use-auth';
import { Toaster } from 'react-hot-toast';

function App() {
  const { isLoggedIn } = useAuth();
  return (
    <Router>
      <div>
        {/* <button onClick={login}>Login</button>
        <button onClick={logout}>Logout</button> */}

        <Routes>
          {/* Public Route */}
          <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />

          {/* Protected Route: Main Page */}
          <Route path="/" element={isLoggedIn ? <Main /> : <Navigate to="/login" />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
