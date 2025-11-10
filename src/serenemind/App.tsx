
import React from 'react';
import VoiceCall from './components/VoiceCall';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="bg-slate-800 shadow-md p-4">
        <h1 className="text-2xl font-bold text-center text-sky-400">SereneMind AI Companion</h1>
        <p className="text-center text-slate-400 mt-1">Your empathetic partner for mental well-being</p>
      </header>

      <main className="flex-1 flex flex-col p-2 sm:p-4 md:p-6 overflow-hidden">
        <div className="w-full max-w-4xl mx-auto flex flex-col flex-1 bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            <VoiceCall />
          </div>
        </div>
      </main>

      <footer className="text-center p-4 text-xs text-slate-500">
        <p>This is an AI-powered tool and not a substitute for professional medical advice. If you are in crisis, please contact a healthcare professional or a crisis hotline immediately.</p>
      </footer>
    </div>
  );
};

export default App;
