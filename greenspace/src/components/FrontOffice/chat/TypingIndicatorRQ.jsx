// src/components/FrontOffice/chat/TypingIndicatorRQ.jsx
import React from 'react';
import PropTypes from 'prop-types';

function TypingIndicatorRQ({ typingUsers }) {
  if (!typingUsers || typingUsers.length === 0) {
    return <div className="h-5"></div>;
  }

  const typingText = typingUsers
    .map((u) => u.username)
    .join(', ') + (typingUsers.length > 1 ? ' sont' : ' est') + " en train d'écrire...";

  return (
    <div className="typing-indicator px-4 pb-1 text-xs text-gray-500 italic h-5 animate-pulse">
      {typingText}
    </div>
  );
}

TypingIndicatorRQ.propTypes = {
  typingUsers: PropTypes.arrayOf(
    PropTypes.shape({
      userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      username: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default TypingIndicatorRQ;