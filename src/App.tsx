import React from 'react';
import { FileUploader } from './components/FileUploader';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">File Hosting</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-12 px-4">
        <FileUploader />
      </main>
    </div>
  );
}

export default App;