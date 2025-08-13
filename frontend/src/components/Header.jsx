import React from 'react';

export const Header = ({ userCredits = 2 }) => {
  return (
    <div className="bg-white/95 backdrop-blur-sm border-2 border-blue-300 rounded-3xl p-6 mb-8 shadow-lg shadow-blue-500/20">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🎧</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-800 bg-clip-text text-transparent">
            ReadCast
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-red-400 to-orange-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
            {userCredits} crédits restants
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-800 flex items-center justify-center text-white font-semibold">
            MA
          </div>
        </div>
      </div>
    </div>
  );
};
