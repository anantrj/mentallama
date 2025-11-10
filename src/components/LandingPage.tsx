import React from 'react';

interface LandingPageProps {
  onSelectProject: (project: 'mentallama' | 'serenemind') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSelectProject }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            AI Mental Health Companion
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose your preferred AI companion platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* MentaLLaMA Card */}
          <div 
            onClick={() => onSelectProject('mentallama')}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 overflow-hidden border-2 border-transparent hover:border-teal-500"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                MentaLLaMA
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                An empathetic AI mental health companion focused on emotional support, 
                chat history, and personalized coping strategies.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Chat with history & sessions
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Emotion analysis
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Coping strategies
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-200">
                Launch MentaLLaMA
              </button>
            </div>
          </div>

          {/* SereneMind Card */}
          <div 
            onClick={() => onSelectProject('serenemind')}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 overflow-hidden border-2 border-transparent hover:border-sky-500"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                SereneMind
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
                Your empathetic AI companion with voice call, text chat, 
                and text-to-speech capabilities for mental well-being.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5 mr-2 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Voice call support
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5 mr-2 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Text chat interface
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5 mr-2 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Text-to-speech
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-sky-600 hover:to-sky-700 transition-all duration-200">
                Launch SereneMind
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>Both platforms are AI-powered tools and not substitutes for professional medical advice.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

