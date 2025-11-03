// components/Chat/ConversationItemRQ.jsx
import React from "react";
import PropTypes from "prop-types";

// Helper function to get initials or display image
const getAvatarContent = (name, imagePath) => {
  if (imagePath) {
    return <img src={imagePath} alt={name || "Avatar"} className="w-full h-full object-cover" />;
  }
  const validName = typeof name === 'string' ? name : '';
  return validName ? validName.substring(0, 1).toUpperCase() : "?";
};

// Helper function to format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

function ConversationItemRQ({ conversation, isSelected, onSelect }) {
  // Handle missing conversation type
  const conversationType = conversation.type || (conversation.participants?.length > 2 ? "GROUP" : "DIRECT");

  // Determine display name and image based on conversation type
  const displayName = conversationType === "GROUP" 
    ? conversation.name 
    : conversation.participants?.[0]?.user 
      ? `${conversation.participants[0].user.firstName || ''} ${conversation.participants[0].user.lastName || ''}`.trim() 
      : "Utilisateur inconnu";
  const displayImage = conversationType === "GROUP" 
    ? conversation.groupImage 
    : conversation.participants?.[0]?.user?.profileImagePath;

  // Get last message preview
  const lastMessage = conversation.lastMessage;
  const previewText = lastMessage 
    ? `${lastMessage.sender?.firstName || lastMessage.sender?.username || ""}: ${lastMessage.content.substring(0, 30)}${lastMessage.content.length > 30 ? "..." : ""}` 
    : "Aucun message";
  const timestamp = lastMessage ? formatTimestamp(lastMessage.timestamp) : "";
  const unreadCount = conversation.unreadCount || 0;

  const handleSelect = () => {
    if (conversation.id !== null && conversation.id !== undefined) {
      onSelect(String(conversation.id));
    } else {
      console.error("Conversation ID is missing, cannot select conversation:", conversation);
    }
  };

  return (
    <div
      className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${isSelected ? "bg-blue-100" : "bg-white"}`}
      onClick={handleSelect}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-semibold mr-3 overflow-hidden flex-shrink-0">
        {getAvatarContent(displayName, displayImage)}
      </div>

      {/* Info */}
      <div className="flex-grow overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold truncate text-sm">{displayName || "Conversation"}</h3>
          {timestamp && <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{timestamp}</span>}
        </div>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-600 truncate">{previewText}</p>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2 flex-shrink-0">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

ConversationItemRQ.propTypes = {
  conversation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    type: PropTypes.oneOf(["DIRECT", "GROUP"]),
    participants: PropTypes.arrayOf(PropTypes.shape({
      user: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        username: PropTypes.string,
        profileImagePath: PropTypes.string,
      })
    })),
    groupImage: PropTypes.string,
    lastMessage: PropTypes.shape({
      content: PropTypes.string,
      timestamp: PropTypes.string,
      sender: PropTypes.shape({
        firstName: PropTypes.string,
        username: PropTypes.string,
      }),
    }),
    unreadCount: PropTypes.number,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ConversationItemRQ;