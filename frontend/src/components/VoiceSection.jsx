import React, { useState } from 'react';

const VoiceSection = () => {
  const [selectedVoice, setSelectedVoice] = useState('default');

  const voices = [
    { id: 'default', name: 'Default Voice' },
    { id: 'male', name: 'Male Voice' },
    { id: 'female', name: 'Female Voice' }
  ];

  return (
    <div className="voice-section">
      <h2>Voice Settings</h2>
      <div className="voice-options">
        <label htmlFor="voice-select">Select Voice:</label>
        <select 
          id="voice-select"
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
        >
          {voices.map(voice => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default VoiceSection;
