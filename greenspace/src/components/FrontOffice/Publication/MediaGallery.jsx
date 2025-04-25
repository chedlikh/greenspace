import { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';
import { useSelector } from 'react-redux';

const MediaGallery = ({ media }) => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mediaUrls, setMediaUrls] = useState({}); // Store blob URLs for media
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const token = useSelector((state) => state.auth.token);
  const fetchedMedia = useRef(new Set()); // Track fetched media IDs

  const openModal = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  };

  // Fetch media file with authentication and create blob URL
  const fetchMedia = async (fileUrl, mediaId) => {
    if (!fileUrl || !token) {
      console.warn('Missing fileUrl or token', { fileUrl, token, mediaId });
      return '';
    }

    try {
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // Add cache control to prevent caching issues
        cache: 'no-cache',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      console.log(`Fetched media for ${mediaId}: ${blobUrl}`);
      return blobUrl;
    } catch (error) {
      console.error(`Error fetching media for ${mediaId}:`, error);
      return '';
    }
  };

  // Load media URLs when media or token changes
  useEffect(() => {
    const loadMediaUrls = async () => {
      setIsLoading(true);
      const newMediaUrls = {};
      const fetchPromises = [];

      // Create an array of promises for all media items
      for (const mediaItem of media) {
        if (mediaItem.fileUrl && !fetchedMedia.current.has(mediaItem.id)) {
          fetchedMedia.current.add(mediaItem.id);
          fetchPromises.push(
            fetchMedia(mediaItem.fileUrl, mediaItem.id).then(blobUrl => {
              if (blobUrl) {
                newMediaUrls[mediaItem.id] = blobUrl;
              }
            })
          );
        }
      }

      // Wait for all promises to resolve
      await Promise.all(fetchPromises);
      
      setMediaUrls(prev => ({ ...prev, ...newMediaUrls }));
      setIsLoading(false);
    };

    if (media && media.length > 0 && token) {
      loadMediaUrls();
    } else {
      setIsLoading(false);
    }

    // Cleanup blob URLs
    return () => {
      Object.values(mediaUrls).forEach((url) => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [media, token]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-48">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!media || media.length === 0) return <p className="text-gray-500">No media available</p>;

  // Get the blob URL for a media item
  const getMediaUrl = (mediaItem) => {
    return mediaUrls[mediaItem.id] || ''; // Return empty string if blob URL not yet loaded
  };

  const handleMediaError = (e) => {
    console.error('Media failed to load:', e);
    e.target.style.display = 'none'; // Hide broken media
    if (e.target.nextSibling) {
      e.target.nextSibling.style.display = 'block'; // Show fallback message
    }
  };

  if (media.length === 1) {
    const mediaItem = media[0];
    const mediaUrl = getMediaUrl(mediaItem);
    
    // Don't render if no URL is available yet
    if (!mediaUrl) {
      return <p className="text-gray-500">Loading media...</p>;
    }
    
    return (
      <>
        {mediaItem.mediaType === 'IMAGE' ? (
          <>
            <img
              src={mediaUrl}
              alt={mediaItem.caption || 'Publication media'}
              className="w-full h-auto max-h-96 object-contain rounded-lg cursor-pointer"
              onClick={() => openModal(mediaItem)}
              onError={handleMediaError}
            />
            <p className="text-gray-500 hidden">Failed to load image</p>
          </>
        ) : (
          <>
            <video
              controls
              className="w-full h-auto max-h-96 rounded-lg"
              onError={handleMediaError}
            >
              <source
                src={mediaUrl}
                type={`video/${mediaItem.fileExtension || 'mp4'}`}
              />
              Your browser does not support the video tag.
            </video>
            <p className="text-gray-500 hidden">Failed to load video</p>
          </>
        )}
        {isModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
            onClick={closeModal}
          >
            <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              {selectedMedia.mediaType === 'IMAGE' ? (
                <img
                  src={getMediaUrl(selectedMedia)}
                  alt={selectedMedia.caption || 'Publication media'}
                  className="max-h-screen max-w-full mx-auto"
                />
              ) : (
                <video
                  controls
                  autoPlay
                  className="max-h-screen max-w-full mx-auto"
                >
                  <source
                    src={getMediaUrl(selectedMedia)}
                    type={`video/${selectedMedia.fileExtension || 'mp4'}`}
                  />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Swiper
        modules={[Navigation, Pagination, Zoom]}
        spaceBetween={10}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        zoom
        className="rounded-lg"
      >
        {media.map((mediaItem) => {
          const mediaUrl = getMediaUrl(mediaItem);
          // Skip rendering slides with no URL
          if (!mediaUrl) return null;
          
          return (
            <SwiperSlide key={mediaItem.id}>
              <div className="swiper-zoom-container">
                {mediaItem.mediaType === 'IMAGE' ? (
                  <>
                    <img
                      src={mediaUrl}
                      alt={mediaItem.caption || 'Publication media'}
                      className="w-full h-96 object-cover cursor-pointer"
                      onClick={() => openModal(mediaItem)}
                      onError={handleMediaError}
                    />
                    <p className="text-gray-500 hidden">Failed to load image</p>
                  </>
                ) : (
                  <>
                    <video
                      controls
                      className="w-full h-96 object-cover"
                      onError={handleMediaError}
                    >
                      <source
                        src={mediaUrl}
                        type={`video/${mediaItem.fileExtension || 'mp4'}`}
                      />
                      Your browser does not support the video tag.
                    </video>
                    <p className="text-gray-500 hidden">Failed to load video</p>
                  </>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {selectedMedia.mediaType === 'IMAGE' ? (
              <img
                src={getMediaUrl(selectedMedia)}
                alt={selectedMedia.caption || 'Publication media'}
                className="max-h-screen max-w-full mx-auto"
              />
            ) : (
              <video
                controls
                autoPlay
                className="max-h-screen max-w-full mx-auto"
              >
                <source
                  src={getMediaUrl(selectedMedia)}
                  type={`video/${selectedMedia.fileExtension || 'mp4'}`}
                />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MediaGallery;