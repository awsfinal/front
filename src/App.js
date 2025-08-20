import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import CameraPage from './pages/CameraPage';
import ToiletPage from './pages/ToiletPage';
import StampPage from './pages/StampPage';
import DetailPage from './pages/DetailPage';
import HeritagePage from './pages/HeritagePage';
import CommunityPage from './pages/CommunityPage';
import BoardDetailPage from './pages/BoardDetailPage';
import WritePostPage from './pages/WritePostPage';
import PostDetailPage from './pages/PostDetailPage';
import SettingsPage from './pages/SettingsPage';
import TouristSpotDetailPage from './pages/TouristSpotDetailPage';
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
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/board/:boardId" element={<BoardDetailPage />} />
          <Route path="/board/:boardId/write" element={<WritePostPage />} />
          <Route path="/board/:boardId/post/:postId" element={<PostDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/tourist-spot/:contentId" element={<TouristSpotDetailPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
