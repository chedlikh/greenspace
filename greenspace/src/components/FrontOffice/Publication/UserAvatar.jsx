import React from 'react';

const UserAvatar = ({ user, size = 'md' }) => {
  const sizes = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  // Construct fullName for alt text
  const fullName = user 
    ? `${user.firstname || ''} ${user.lastName || ''}`.trim() 
    : 'User avatar';

  if (!user) {
    return (
      <div className={`${sizes[size]} rounded-full overflow-hidden bg-gray-200 flex-shrink-0`}>
        <img
          src="/default-avatar.png"
          alt="Default avatar"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-gray-200 flex-shrink-0`}>
      <img
        src={user.photoProfile ? `http://localhost:8089/images/${user.photoProfile}` : '/default-avatar.png'}
        alt={fullName}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.src = '/default-avatar.png';
        }}
      />
    </div>
  );
};

export default UserAvatar;