import React from 'react';

const VOICES = [
  { id: 'Rachel', name: 'Emma', type: 'Féminine • Chaleureuse', sample: 'https://storage.googleapis.com/elevenlabs-public/premade/voices/Rachel/3b13e6a9-de10-46b5-88c3-ab9bd08b8529.mp3' },
  { id: 'Adam', name: 'Thomas', type: 'Masculine • Professionnelle', sample: 'https://storage.googleapis.com/elevenlabs-public/premade/voices/Adam/cjVigY5qzO86Huf0OWal.mp3' },
  { id: 'Domi', name: 'Sarah', type: 'Féminine • Narrative', sample: 'https://storage.googleapis.com/elevenlabs-public/premade/voices/Domi/3b13e6a9-de10-46b5-88c3-ab9bd08b8529.mp3' },
  { id: 'Josh', name: 'Antoine', type: 'Masculine • Dramatique', sample: 'https://storage.googleapis.com/elevenlabs-public/premade/voices/Josh/cjVigY5qzO86Huf0OWal.mp3' }
];

export const VoiceSection = ({ selectedVoice, onVoiceSelect }) => {
  const playVoiceSample = (voiceId) => {
    const voice = VOICES.find(v => v.id === voiceId);
    if (voice?.sample) {
      const audio = new Audio(voice.sample);
      audio.play().catch(console.error);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm border-2 border-blue-300 rounded-3xl p-8 shadow-lg shadow-blue-500/20">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">
        Choisir la voix narratrice
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {VOICES.map((voice) => (
          <div
            key={voice.id}
            onClick={() => onVoiceSelect(voice.id)}
            className={`border-2 rounded-2xl p-5 text-center cursor-pointer transition-all hover:scale-105 ${
              selectedVoice === voice.id
                ? 'border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100'
                : 'border-blue-300 hover:border-blue-600 hover:bg-blue-50/50'
            }`}
          >
            <div className="font-semibold text-gray-800 mb-1">
              {voice.name}
            </div>
            <div className="text-gray-600 text-sm mb-3">
              {voice.type}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                playVoiceSample(voice.id);
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-xs font-medium transition-colors"
            >
              ▶ Écouter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
