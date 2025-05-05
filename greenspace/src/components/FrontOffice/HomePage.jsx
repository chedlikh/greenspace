import { useState } from 'react';
import CreatePublicationForm from './Publication/CreatePublicationForm';
import PublicationList from './Publication/PublicationList';

const HomePage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePublicationCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="main-content bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Home</h1>
        
        <CreatePublicationForm onSuccess={handlePublicationCreated} />
        
        <PublicationList key={refreshKey} />
      </div>
    </div>
  );
};

export default HomePage;