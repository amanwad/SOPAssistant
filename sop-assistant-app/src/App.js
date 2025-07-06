import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import FileUploadComponent from './components/FileUploadComponent';
import SearchPage from './components/SearchPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FileUploadComponent />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Router>
  );
}

export default App;
