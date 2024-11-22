import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/login';
import Main from './pages/main';
import { useStore } from './utils/use-store';
import { Toaster } from 'react-hot-toast';

function App() {
  const { isLoggedIn } = useStore();
  return (
    <Router>
      <div>


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
