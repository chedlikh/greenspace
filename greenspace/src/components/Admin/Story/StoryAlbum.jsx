import { useStories, useDeleteStory } from '../../../services/storyService';
import { getStoryMediaUrl } from '../../../services/storyService';
import { useState, useEffect, useRef } from 'react';
import { 
  FiTrash2, FiHeart, FiMessageSquare, 
  FiShare2, FiMoreVertical, FiX, 
  FiChevronLeft, FiChevronRight, FiClock
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from "react-redux";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

const AuthMedia = ({ src, alt, className, type = 'IMAGE', ...props }) => {
  const [objectUrl, setObjectUrl] = useState(null);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    let isMounted = true;
    
    const loadMedia = async () => {
      try {
        if (!src) return;
        
        const response = await fetch(src, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch media');
        
        const blob = await response.blob();
        if (isMounted) {
          setObjectUrl(URL.createObjectURL(blob));
        }
      } catch (error) {
        console.error('Error loading media:', error);
      }
    };

    loadMedia();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src, token]);

  if (type === 'VIDEO') {
    return (
      <div className="relative w-full h-full">
        <video
          src={objectUrl}
          className={className}
          controls
          autoPlay
          {...props}
        />
        {!objectUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="bg-black bg-opacity-50 rounded-full p-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={objectUrl || `${API_BASE_URL}/images/default-profile.jpg`}
      alt={alt}
      className={className}
      onError={(e) => {
        e.target.src = `${API_BASE_URL}/images/default-profile.jpg`;
      }}
      {...props}
    />
  );
};

const StoriesAlbum = () => {
  const token = useSelector((state) => state.auth.token);
  const { data: stories = [], isLoading, isError, error } = useStories();
  const { mutate: deleteStory } = useDeleteStory();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(null);
  const [isViewingStories, setIsViewingStories] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'active', or 'expired'
  const [progress, setProgress] = useState(0);
  const storyViewerRef = useRef(null);
  const progressInterval = useRef(null);

  // Filter stories based on current filter
  const filteredStories = stories.filter(story => {
    const now = new Date();
    const expiresAt = new Date(story.expiresAt);
    
    if (filter === 'active') return expiresAt > now;
    if (filter === 'expired') return expiresAt <= now;
    return true; // 'all' filter
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this story?')) {
      deleteStory(id);
    }
  };

  const openStoryViewer = (index) => {
    setCurrentStoryIndex(index);
    setIsViewingStories(true);
    document.body.style.overflow = 'hidden';
    startProgressTimer();
  };

  const closeStoryViewer = () => {
    setIsViewingStories(false);
    document.body.style.overflow = 'auto';
    clearProgressTimer();
  };

  const navigateStory = (direction) => {
    clearProgressTimer();
    setProgress(0);
    setCurrentStoryIndex(prev => {
      if (direction === 'next') {
        return prev < filteredStories.length - 1 ? prev + 1 : 0;
      } else {
        return prev > 0 ? prev - 1 : filteredStories.length - 1;
      }
    });
    startProgressTimer();
  };

  const startProgressTimer = () => {
    clearProgressTimer();
    setProgress(0);
    
    progressInterval.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearProgressTimer();
          navigateStory('next');
          return 0;
        }
        return prev + (100 / 50); // 5 seconds total (100%/50 = 2% per 100ms)
      });
    }, 100);
  };

  const clearProgressTimer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isViewingStories) return;
      
      if (e.key === 'Escape') {
        closeStoryViewer();
      } else if (e.key === 'ArrowRight') {
        navigateStory('next');
      } else if (e.key === 'ArrowLeft') {
        navigateStory('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearProgressTimer();
    };
  }, [isViewingStories, filteredStories]);

  const currentStory = filteredStories[currentStoryIndex] || {};

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (      
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">Error loading stories: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Stories Album</h1>
        
        {/* Filter Controls */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            All Stories
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-full ${filter === 'active' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Active Stories
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-4 py-2 rounded-full ${filter === 'expired' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Expired Stories
          </button>
        </div>
        
        {/* Story Viewer */}
        {isViewingStories && (
          <div 
            ref={storyViewerRef}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            onClick={(e) => e.target === storyViewerRef.current && closeStoryViewer()}
          >
            <div className="relative w-full h-full max-w-2xl max-h-screen flex items-center">
              {/* Navigation Arrows */}
              <button 
                className="absolute left-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateStory('prev');
                }}
              >
                <FiChevronLeft size={24} />
              </button>
              
              <button 
                className="absolute right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateStory('next');
                }}
              >
                <FiChevronRight size={24} />
              </button>
              
              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeStoryViewer();
                }}
                className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-70 transition-all"
              >
                <FiX size={24} />
              </button>
              
              {/* Story Content */}
              <div className="w-full h-full flex flex-col">
                {/* Progress Bar */}
                <div className="w-full h-1 bg-gray-700 mb-2">
                  <div 
                    className="h-full bg-white transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                
                {/* User Info */}
                <div className="flex items-center p-4">
                  <img
                    src={currentStory.user?.photoProfile 
                      ? `${API_BASE_URL}/images/${currentStory.user.photoProfile}` 
                      : `${API_BASE_URL}/images/default-profile.jpg`}
                    alt={currentStory.user?.username}
                    className="w-10 h-10 rounded-full mr-3 object-cover"
                    onError={(e) => {
                      e.target.src = `${API_BASE_URL}/images/default-profile.jpg`;
                    }}
                  />
                  <div>
                    <p className="font-semibold text-white">{currentStory.user?.username}</p>
                    <p className="text-gray-300 text-sm">
                      {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
                    </p>
                    {new Date(currentStory.expiresAt) <= new Date() && (
                      <div className="flex items-center mt-1 text-yellow-400 text-xs">
                        <FiClock className="mr-1" size={12} />
                        Expired
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Story Media */}
                <div className="flex-1 flex items-center justify-center">
                  <AuthMedia
                    src={getStoryMediaUrl(currentStory.mediaUrl, token).url}
                    alt={currentStory.caption || 'Story'}
                    className="w-full h-full object-contain"
                    type={currentStory.mediaType}
                  />
                </div>
                
                {/* Story Actions */}
                <div className="p-4 bg-black bg-opacity-50">
                  {currentStory.caption && (
                    <p className="text-white mb-4">{currentStory.caption}</p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <button className="flex items-center text-white hover:text-red-500">
                        <FiHeart className="mr-1" size={20} />
                      </button>
                      <button className="flex items-center text-white hover:text-blue-500">
                        <FiMessageSquare className="mr-1" size={20} />
                      </button>
                      <button className="flex items-center text-white hover:text-green-500">
                        <FiShare2 className="mr-1" size={20} />
                      </button>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(currentStory.id);
                      }}
                      className="text-white hover:text-red-500"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {filter === 'active' 
                ? 'No active stories available' 
                : filter === 'expired' 
                  ? 'No expired stories available' 
                  : 'No stories available yet'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredStories.map((story, index) => (
              <div 
                key={story.id} 
                className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white group cursor-pointer"
                onClick={() => openStoryViewer(index)}
              >
                {/* Expired indicator */}
                {new Date(story.expiresAt) <= new Date() && (
                  <div className="absolute top-2 left-2 z-10 flex items-center bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                    <FiClock className="mr-1" size={12} />
                    Expired
                  </div>
                )}
                
                <AuthMedia
                  src={getStoryMediaUrl(story.mediaUrl, token).url}
                  alt={story.caption || 'Story'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  type={story.mediaType}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <div className="flex items-center">
                    <img
                      src={story.user?.photoProfile 
                        ? `${API_BASE_URL}/images/${story.user.photoProfile}` 
                        : `${API_BASE_URL}/images/default-profile.jpg`}
                      alt={story.user?.username}
                      className="w-6 h-6 rounded-full border-2 border-white mr-2 object-cover"
                      onError={(e) => {
                        e.target.src = `${API_BASE_URL}/images/default-profile.jpg`;
                      }}
                    />
                    <span className="text-white font-medium text-sm truncate">
                      {story.user?.username}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoriesAlbum;