import React from 'react';

const UserAvatar = ({ user, size = 'md' }) => {
  const sizes = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8089';

  // Use user prop directly, fallback to defaults if fields are missing
  const fullName = user?.firstname || user?.lastName
    ? `${user.firstname || ''} ${user.lastName || ''}`.trim()
    : user?.username || 'Anonymous User';

  const profilePhoto = user?.photoProfile
    ? `${BASE_URL}/images/${user.photoProfile}`
    : '/default-avatar.png';

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-gray-200 flex-shrink-0 shadow-sm`}>
      <img
        src={profilePhoto}
        alt={fullName}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.warn(`Failed to load image: ${profilePhoto}`);
          e.target.src = '/default-avatar.png';
        }}
      />
    </div>
  );
};

export default UserAvatar;