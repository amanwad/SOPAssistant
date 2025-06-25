import React from 'react';
import './App.css';
import FileUploadComponent from './components/FileUploadComponent';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>SOP Assistant - File Upload</h1>
        <p>Upload your Standard Operating Procedure documents</p>
      </header>
      <main>
        <FileUploadComponent />
      </main>
    </div>
  );
}

export default App;
