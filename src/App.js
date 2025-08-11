import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import CameraPage from './pages/CameraPage';
import ToiletPage from './pages/ToiletPage';
import StampPage from './pages/StampPage';
import DetailPage from './pages/DetailPage';
import HeritagePage from './pages/HeritagePage';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function App() {
  return (
    <Router future={{ 
      v7_relativeSplatPath: true,
      v7_startTransition: true 
    }}>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/camera" element={<CameraPage />} />
          <Route path="/toilet" element={<ToiletPage />} />
          <Route path="/stamp" element={<StampPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
          <Route path="/heritage/:id" element={<HeritagePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
