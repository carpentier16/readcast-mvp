import React from 'react';

const SimpleTest = () => {
  const handleClick = () => {
    console.log('🔍 Simple button clicked!');
    alert('Simple button works!');
  };

  return (
    <div className="bg-red-100 border border-red-400 rounded-lg p-6 m-4">
      <h2 className="text-xl font-bold text-red-800 mb-4">
        🚨 Test Ultra-Simple
      </h2>
      
      <div className="space-y-4">
        <p className="text-red-700">
          Si vous voyez ce texte, React fonctionne.
        </p>
        
        <button
          onClick={handleClick}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Cliquez-moi (Test Simple)
        </button>
        
        <div className="bg-white p-3 rounded border">
          <p className="text-sm text-gray-700">
            <strong>React Version:</strong> {React.version}
          </p>
          <p className="text-sm text-gray-700">
            <strong>Timestamp:</strong> {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleTest; 