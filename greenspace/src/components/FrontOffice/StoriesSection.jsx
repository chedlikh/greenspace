import React, { useState, useEffect, useRef } from 'react';
import { useStories, useCreateStory, getStoryMediaUrl } from '../../services/storyService';
import { useSelector } from 'react-redux';
import { FiPlus, FiSend } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import AuthMedia from './../Admin/Story/AuthMedia';
import { TiTimes } from 'react-icons/ti';

const StoriesSection = () => {
  const { data: stories = [], isLoading, error } = useStories();
  const createStoryMutation = useCreateStory();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(null);
  const [isViewingStories, setIsViewingStories] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewedStories, setViewedStories] = useState(new Set());
  const [comment, setComment] = useState('');
  const progressInterval = useRef(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

  // Filter active stories
  const activeStories = stories.filter(story => new Date(story.expiresAt) > new Date());

  // Group active stories by user
  const groupedStories = activeStories.reduce((acc, story) => {
    const username = story.user?.username || 'Unknown';
    if (!acc[username]) {
      acc[username] = [];
    }
    acc[username].push(story);
    return acc;
  }, {});

  // Progress timer for story viewer
  const startProgressTimer = () => {
    clearProgressTimer();
    setProgress(0);
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearProgressTimer();
          navigateStory('next');
          return 0;
        }
        return prev + (100 / 50); // 5 seconds total
      });
    }, 100);
  };

  const clearProgressTimer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const navigateStory = (direction) => {
    clearProgressTimer();
    setProgress(0);
    setCurrentStoryIndex((prev) => {
      if (prev === null) return prev;
      const usernames = Object.keys(groupedStories);
      const currentUserIndex = Math.floor(prev / 100);
      const currentStoryInUser = prev % 100;
      const userStories = groupedStories[usernames[currentUserIndex]] || [];

      if (direction === 'next') {
        if (currentStoryInUser < userStories.length - 1) {
          return prev + 1;
        }
        const nextUserIndex = (currentUserIndex + 1) % usernames.length;
        if (nextUserIndex === 0 && currentUserIndex === usernames.length - 1) {
          setIsViewingStories(false);
          document.body.style.overflow = 'auto';
          return null;
        }
        return nextUserIndex * 100;
      } else {
        if (currentStoryInUser > 0) {
          return prev - 1;
        }
        const prevUserIndex = (currentUserIndex - 1 + usernames.length) % usernames.length;
        return prevUserIndex * 100 + (groupedStories[usernames[prevUserIndex]].length - 1);
      }
    });
    if (isViewingStories) startProgressTimer();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isViewingStories) return;
      if (e.key === 'Escape') {
        setIsViewingStories(false);
        document.body.style.overflow = 'auto';
        clearProgressTimer();
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
  }, [isViewingStories]);

  const openStoryViewer = (username, index) => {
    const userIndex = Object.keys(groupedStories).indexOf(username);
    const newIndex = userIndex * 100 + index;
    setCurrentStoryIndex(newIndex);
    setIsViewingStories(true);
    document.body.style.overflow = 'hidden';
    const story = groupedStories[username][index];
    setViewedStories((prev) => new Set(prev).add(story.id));
    startProgressTimer();
  };

  const getCurrentStory = () => {
    if (currentStoryIndex === null) return null;
    const username = Object.keys(groupedStories)[Math.floor(currentStoryIndex / 100)];
    const index = currentStoryIndex % 100;
    return groupedStories[username]?.[index] || null;
  };

  const handleCreateStory = (storyData) => {
    createStoryMutation.mutate(
      { ...storyData, username: user?.username },
      {
        onSuccess: () => {
          setShowCreateModal(false);
        },
        onError: (error) => {
          console.error('Error creating story:', error);
          alert('Failed to create story: ' + error.message);
        },
      }
    );
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    // Handle comment submission
    setComment('');
  };

  if (isLoading) {
    return (
      <div className="card w-100 shadow-none bg-transparent bg-transparent-card border-0 p-0 mb-0">
        <div className="d-flex align-items-center p-3 bg-light">
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
          <span className="text-grey-900 font-xsss">Loading stories...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card w-100 shadow-none bg-transparent bg-transparent-card border-0 p-0 mb-0">
        <div className="alert alert-warning m-3">
          Failed to load stories: {error.message}
        </div>
      </div>
    );
  }

  const currentStory = getCurrentStory();
  const currentUserStories = currentStory ? groupedStories[currentStory.user?.username] || [] : [];
  const isTextStory = (story) => !story.mediaUrl && story.textContent;

  return (
    <>
      <div className="card w-100 shadow-none bg-transparent bg-transparent-card border-0 p-0 mb-0">
        <div className="d-flex align-items-start overflow-auto" style={{ gap: '12px' }}>
          {/* Add Story Button */}
          {user && (
            <div 
              className="card w125 h200 d-block border-0 shadow-none rounded-xxxl bg-dark overflow-hidden mb-3 mt-3"
              onClick={() => setShowCreateModal(true)}
              style={{ cursor: 'pointer' }}
            >
              <div className="card-body d-block p-3 w-100 position-absolute bottom-0 text-center">
                <div className="btn-round-lg bg-white">
                  <FiPlus className="font-lg text-dark" />
                </div>
                <div className="clearfix"></div>
                <h4 className="fw-700 position-relative z-index-1 ls-1 font-xssss text-white mt-2 mb-1">Add Story</h4>
              </div>
            </div>
          )}

          {/* User Stories */}
          {Object.entries(groupedStories).map(([username, userStories]) => {
            const latestStory = userStories[0];
            const hasUnviewedStories = userStories.some((story) => !viewedStories.has(story.id));

            return (
              <div
                key={username}
                className="card w125 h200 d-block border-0 shadow-xss rounded-xxxl overflow-hidden cursor-pointer mb-3 mt-3"
                onClick={() => openStoryViewer(username, 0)}
                style={{
                  backgroundImage: isTextStory(latestStory) 
                    ? `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8)), ${latestStory.backgroundColor || '#1877F2'}` 
                    : `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8))`,
                  border: hasUnviewedStories ? '2px solid #1877F2' : '2px solid #BEC3C9'
                }}
              >
                {!isTextStory(latestStory) && latestStory.mediaUrl && (
                  <AuthMedia
                    src={getStoryMediaUrl(latestStory.mediaUrl, token)}
                    alt={latestStory.caption || 'Story'}
                    className="w-100 h-100 object-cover"
                    mediaType={latestStory.mediaType || 'IMAGE'}
                  />
                )}
                
                <div className="card-body d-block p-3 w-100 position-absolute bottom-0 text-center">
                  <figure className="avatar ms-auto me-auto mb-0 position-relative w50 z-index-1">
                    <img
                      src={
                        latestStory.user?.photoProfile
                          ? `${API_BASE_URL}/images/${latestStory.user.photoProfile}`
                          : `${API_BASE_URL}/images/default-profile.jpg`
                      }
                      alt={username}
                      className="p-0 bg-white rounded-circle w-100 shadow-xss"
                      onError={(e) => {
                        e.target.src = `${API_BASE_URL}/images/default-profile.jpg`;
                      }}
                    />
                  </figure>
                  <div className="clearfix"></div>
                  <h4 className="fw-600 position-relative z-index-1 ls-1 font-xssss text-white mt-2 mb-1">
                    {username.length > 12 ? username.substring(0, 12) + '...' : username}
                  </h4>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Story Modal */}
      {showCreateModal && (
        <CreateStoryModal
          onClose={() => setShowCreateModal(false)}
          onCreateStory={handleCreateStory}
          isLoading={createStoryMutation.isLoading}
        />
      )}

      {/* Story Viewer Modal */}
      {isViewingStories && currentStory && (
        <div className="modal bottom side show" style={{ display: 'block', overflowY: 'auto', backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '100%', margin: 0 }}>
            <div className="modal-content border-0 bg-transparent">
              <button 
                type="button" 
                className="close mt-0 position-absolute top-0 right-0 m-3" 
                onClick={() => {
                  setIsViewingStories(false);
                  document.body.style.overflow = 'auto';
                  clearProgressTimer();
                }}
              >
                <TiTimes className="text-white font-xssss" />
              </button>
              
              <div className="modal-body p-0">
                <div className="card w-100 border-0 rounded-3 overflow-hidden bg-gradiant-bottom bg-gradiant-top">
                  <div className="position-relative" style={{ height: '80vh' }}>
                    {/* Progress Bars */}
                    <div className="d-flex w-100 px-4 pt-2 gap-1 position-absolute top-0 z-index-2">
                      {currentUserStories.map((story, index) => (
                        <div key={story.id} className="flex-1 h-2 bg-grey rounded-full">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-100"
                            style={{
                              width: currentStoryIndex % 100 === index ? `${progress}%` : viewedStories.has(story.id) ? '100%' : '0%',
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Story Content */}
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                      {isTextStory(currentStory) ? (
                        <div
                          className="w-100 h-100 d-flex align-items-center justify-content-center text-white text-center p-8"
                          style={{
                            backgroundColor: currentStory.backgroundColor || '#1877F2',
                            fontFamily: currentStory.fontStyle || 'Arial',
                            fontSize: '24px',
                            fontWeight: '600',
                          }}
                        >
                          {currentStory.textContent}
                        </div>
                      ) : (
                        <div className="w-100 h-100">
                          <AuthMedia
                            src={getStoryMediaUrl(currentStory.mediaUrl, token)}
                            alt={currentStory.caption || 'Story'}
                            className="w-100 h-100 object-contain"
                            mediaType={currentStory.mediaType}
                          />
                        </div>
                      )}
                    </div>

                    {/* Header */}
                    <div className="position-absolute top-3 left-0 w-100 p-3 d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <figure className="avatar me-2 mb-0">
                          <img
                            src={
                              currentStory.user?.photoProfile
                                ? `${API_BASE_URL}/images/${currentStory.user.photoProfile}`
                                : `${API_BASE_URL}/images/default-profile.jpg`
                            }
                            alt={currentStory.user?.username}
                            className="p-0 bg-white rounded-circle w40 shadow-xss"
                            onError={(e) => {
                              e.target.src = `${API_BASE_URL}/images/default-profile.jpg`;
                            }}
                          />
                        </figure>
                        <div>
                          <h4 className="fw-600 text-white font-xssss mb-0">{currentStory.user?.username}</h4>
                          <p className="text-grey-200 font-xsssss mb-0">
                            {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Click Zones */}
                    <div
                      className="position-absolute top-0 left-0 w-50 h-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateStory('prev');
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    <div
                      className="position-absolute top-0 right-0 w-50 h-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateStory('next');
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                </div>

                {/* Comment Input */}
                <form onSubmit={handleCommentSubmit} className="form-group mt-3 mb-0 p-3 position-absolute bottom-0 z-index-1 w-100">
                  <input
                    type="text"
                    className="style2-input w-100 bg-transparent border-light-md p-3 pe-5 font-xssss fw-500 text-white"
                    placeholder="Write Comments"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <FiSend className="text-white font-md position-absolute" style={{ bottom: '35px', right: '30px' }} />
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Create Story Modal Component
const CreateStoryModal = ({ onClose, onCreateStory, isLoading }) => {
  const [storyType, setStoryType] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#1877F2');
  const [fontStyle, setFontStyle] = useState('Arial');
  const [mediaFile, setMediaFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);

  const backgroundColors = [
    '#1877F2', '#FF4D4F', '#FFD666', '#36CFC9', '#00B894',
    '#E84393', '#A29BFE', '#FA8C16', '#00CEC9', '#E17055',
  ];

  const fontStyles = ['Arial', 'Helvetica', 'Roboto', 'Segoe UI', 'Lato'];

  const handleMediaFileChange = (e) => {
    const file = e.target.files[0];
    setMediaFile(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setMediaPreview(previewUrl);
    } else {
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
      setMediaPreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
    };
  }, [mediaPreview]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const storyData = {
      type: storyType,
    };

    if (storyType === 'text') {
      if (!textContent.trim()) {
        alert('Please enter some text for your story');
        return;
      }
      storyData.textContent = textContent;
      storyData.backgroundColor = backgroundColor;
      storyData.fontStyle = fontStyle;
    } else {
      if (!mediaFile) {
        alert('Please select a media file for your story');
        return;
      }
      storyData.mediaFile = mediaFile;
      storyData.caption = caption;
    }

    onCreateStory(storyData);
  };

  return (
    <div
      className="modal-backdrop show"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="modal-content bg-white rounded-lg p-4" style={{ width: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-700 text-grey-900 font-xss">Create Story</h4>
          <button
            type="button"
            className="text-grey-500 hover:text-grey-900"
            onClick={onClose}
          >
            <TiTimes className="font-xssss" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Story Type Selection */}
          <div className="mb-3">
            <div className="d-flex gap-2">
              <button
                type="button"
                className={`btn flex-fill font-xsss fw-600 ${storyType === 'text' ? 'bg-primary text-white' : 'bg-grey-200 text-grey-900'}`}
                onClick={() => setStoryType('text')}
              >
                Text Story
              </button>
              <button
                type="button"
                className={`btn flex-fill font-xsss fw-600 ${storyType === 'media' ? 'bg-primary text-white' : 'bg-grey-200 text-grey-900'}`}
                onClick={() => setStoryType('media')}
              >
                Media Story
              </button>
            </div>
          </div>

          {storyType === 'text' ? (
            <>
              {/* Text Content */}
              <div className="mb-3">
                <label className="form-label font-xsss fw-600 text-grey-900">Story Text</label>
                <textarea
                  className="form-control font-xsss"
                  rows="4"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="What's on your mind?"
                  required
                />
              </div>

              {/* Background Color */}
              <div className="mb-3">
                <label className="form-label font-xsss fw-600 text-grey-900">Background Color</label>
                <div className="d-flex gap-2 flex-wrap">
                  {backgroundColors.map((color) => (
                    <div
                      key={color}
                      className="rounded-circle"
                      style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: color,
                        cursor: 'pointer',
                        border: backgroundColor === color ? '2px solid #000' : '1px solid #CED0D4',
                      }}
                      onClick={() => setBackgroundColor(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Font Style */}
              <div className="mb-3">
                <label className="form-label font-xsss fw-600 text-grey-900">Font Style</label>
                <select
                  className="form-control font-xsss"
                  value={fontStyle}
                  onChange={(e) => setFontStyle(e.target.value)}
                >
                  {fontStyles.map((font) => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              <div className="mb-3">
                <label className="form-label font-xsss fw-600 text-grey-900">Preview</label>
                <div
                  className="rounded-lg p-3 text-center text-white font-xsss fw-600"
                  style={{
                    backgroundColor: backgroundColor,
                    fontFamily: fontStyle,
                    minHeight: '200px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}
                >
                  {textContent || 'Your story text will appear here...'}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Media File */}
              <div className="mb-3">
                <label className="form-label font-xsss fw-600 text-grey-900">Choose Photo/Video</label>
                <input
                  type="file"
                  className="form-control font-xsss"
                  accept="image/*,video/*"
                  onChange={handleMediaFileChange}
                  required
                />
              </div>

              {/* Caption */}
              <div className="mb-3">
                <label className="form-label font-xsss fw-600 text-grey-900">Caption (optional)</label>
                <textarea
                  className="form-control font-xsss"
                  rows="3"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a caption..."
                />
              </div>

              {/* Media Preview */}
              {mediaPreview && (
                <div className="mb-3">
                  <label className="form-label font-xsss fw-600 text-grey-900">Preview</label>
                  <div className="text-center" style={{ minHeight: '200px' }}>
                    {mediaFile?.type.startsWith('image/') ? (
                      <img
                        src={mediaPreview}
                        alt="Preview"
                        className="img-fluid rounded-lg w-full h-auto max-h-[300px] object-contain"
                      />
                    ) : (
                      <video
                        src={mediaPreview}
                        className="img-fluid rounded-lg w-full h-auto max-h-[300px] object-contain"
                        controls
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Submit Button */}
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn bg-grey-200 text-grey-900 font-xsss fw-600 flex-fill"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn bg-primary text-white font-xsss fw-600 flex-fill"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Share Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoriesSection;