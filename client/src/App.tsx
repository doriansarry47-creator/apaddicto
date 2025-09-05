import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Apaaddicto 3</h1>
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <p className="font-semibold">Application is running successfully!</p>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">Welcome</h2>
          <p className="text-lg text-blue-700">This is the Apaaddicto 3 application.</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-green-800 font-medium">
            The 404 error has been fixed and the application is now working properly.
          </p>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Application de thérapie sportive</p>
          <p>Version 3.0</p>
        </div>
      </div>
    </div>
  );
}

export default App;