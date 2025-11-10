import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import MentaLLaMAApp from './mentallama/App';
import SereneMindApp from './serenemind/App';

type Project = 'landing' | 'mentallama' | 'serenemind';

const App: React.FC = () => {
  const [currentProject, setCurrentProject] = useState<Project>('landing');

  const handleSelectProject = (project: 'mentallama' | 'serenemind') => {
    setCurrentProject(project);
  };

  const handleBackToLanding = () => {
    setCurrentProject('landing');
  };

  // Add back button to both apps
  const BackButton = () => (
    <button
      onClick={handleBackToLanding}
      className="fixed top-4 left-4 z-50 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center gap-2"
      title="Back to project selection"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span className="hidden sm:inline">Back</span>
    </button>
  );

  switch (currentProject) {
    case 'mentallama':
      return (
        <>
          <BackButton />
          <MentaLLaMAApp />
        </>
      );
    case 'serenemind':
      return (
        <>
          <BackButton />
          <SereneMindApp />
        </>
      );
    default:
      return <LandingPage onSelectProject={handleSelectProject} />;
  }
};

export default App;

