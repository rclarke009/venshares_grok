import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import RegisterPage from './RegisterPage';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import ProjectPage from './ProjectPage';
import ContactPage from './ContactPage';  
import './styles/main.css';

function App() {
  return (
    <BrowserRouter basename="/proposedSite">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/project/:id" element={<ProjectPage />} /> {/* <-- Add this */}
        <Route path="/contact" element={<ContactPage />} />
        {/* Add more routes as needed */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
