import { useState, useEffect } from 'react';
import { fetchMediaWithAuth } from '../../../services/storyService';

const AuthMedia = ({ src, alt, className, mediaType = 'IMAGE', ...props }) => {
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const loadMedia = async () => {
      try {
        const blobUrl = await fetchMediaWithAuth(src.url, src.token);
        if (isMounted) {
          setObjectUrl(blobUrl);
        }
      } catch (error) {
        console.error('Error loading media:', error);
        // You could set a fallback image here if needed
      }
    };

    if (src?.url && src?.token) {
      loadMedia();
    }

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [src]);

  if (mediaType === 'VIDEO') {
    return (
      <video
        src={objectUrl}
        className={className}
        controls
        {...props}
      />
    );
  }

  return (
    <img
      src={objectUrl}
      alt={alt}
      className={className}
      onError={(e) => {
        // Fallback if the authenticated request fails
        e.target.src = '/fallback-image.jpg';
      }}
      {...props}
    />
  );
};

export default AuthMedia;