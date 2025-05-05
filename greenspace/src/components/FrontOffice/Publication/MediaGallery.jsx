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
  const [mediaUrls, setMediaUrls] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const token = useSelector((state) => state.auth.token);
  const fetchedMedia = useRef(new Set());

  const openModal = (mediaItem) => {
    setSelectedMedia(mediaItem);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMedia(null);
  };

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

  useEffect(() => {
    const loadMediaUrls = async () => {
      setIsLoading(true);
      const newMediaUrls = {};
      const fetchPromises = [];

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

      await Promise.all(fetchPromises);
      
      setMediaUrls(prev => ({ ...prev, ...newMediaUrls }));
      setIsLoading(false);
    };

    if (media && media.length > 0 && token) {
      loadMediaUrls();
    } else {
      setIsLoading(false);
    }

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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;
  }

  if (!media || media.length === 0) return <p className="text-gray-500">No media available</p>;

  const getMediaUrl = (mediaItem) => {
    return mediaUrls[mediaItem.id] || '';
  };

  const handleMediaError = (e) => {
    console.error('Media failed to load:', e);
    e.target.style.display = 'none';
    if (e.target.nextSibling) {
      e.target.nextSibling.style.display = 'block';
    }
  };

  if (media.length === 1) {
    const mediaItem = media[0];
    const mediaUrl = getMediaUrl(mediaItem);
    
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
              className="w-full h-auto max-h-[500px] object-contain rounded-2xl cursor-pointer shadow-md"
              onClick={() => openModal(mediaItem)}
              onError={handleMediaError}
            />
            <p className="text-gray-500 hidden">Failed to load image</p>
          </>
        ) : (
          <>
            <video
              controls
              className="w-full h-auto max-h-[500px] rounded-2xl shadow-md"
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
            className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
            onClick={closeModal}
          >
            <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none bg-gray-800 bg-opacity-50 rounded-full p-2"
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  className="max-h-[90vh] max-w-full mx-auto rounded-2xl"
                />
              ) : (
                <video
                  controls
                  autoPlay
                  className="max-h-[90vh] max-w-full mx-auto rounded-2xl"
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
        className="rounded-2xl shadow-md"
      >
        {media.map((mediaItem) => {
          const mediaUrl = getMediaUrl(mediaItem);
          if (!mediaUrl) return null;
          
          return (
            <SwiperSlide key={mediaItem.id}>
              <div className="swiper-zoom-container">
                {mediaItem.mediaType === 'IMAGE' ? (
                  <>
                    <img
                      src={mediaUrl}
                      alt={mediaItem.caption || 'Publication media'}
                      className="w-full h-[500px] object-cover cursor-pointer rounded-2xl"
                      onClick={() => openModal(mediaItem)}
                      onError={handleMediaError}
                    />
                    <p className="text-gray-500 hidden">Failed to load image</p>
                  </>
                ) : (
                  <>
                    <video
                      controls
                      className="w-full h-[500px] object-cover rounded-2xl"
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
          className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center"
          onClick={closeModal}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 focus:outline-none bg-gray-800 bg-opacity-50 rounded-full p-2"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="max-h-[90vh] max-w-full mx-auto rounded-2xl"
              />
            ) : (
              <video
                controls
                autoPlay
                className="max-h-[90vh] max-w-full mx-auto rounded-2xl"
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