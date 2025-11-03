// components/Chat/ChatHeaderRQ.jsx
import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux"; // Import pour accéder à l'état Redux
import { PhoneIcon, VideoCameraIcon } from "@heroicons/react/24/solid";
import { useInitiateDirectCall, useInitiateGroupCall } from "../../../services/callHooks";

// Fonction utilitaire pour obtenir le contenu de l'avatar
const getAvatarContent = (name, imagePath) => {
  if (imagePath) {
    return <img src={imagePath} alt={name || "Avatar"} className="w-full h-full object-cover" />;
  }
  const validName = typeof name === 'string' ? name : '';
  return validName ? validName.substring(0, 1).toUpperCase() : "?";
};

function ChatHeaderRQ({ conversation, typingIndicator }) {
  const initiateDirectCallMutation = useInitiateDirectCall();
  const initiateGroupCallMutation = useInitiateGroupCall();
  // ***** Correction: Récupérer l'ID de l'utilisateur actuel depuis Redux *****
  const currentUser = useSelector((state) => state.auth.user);

  if (!conversation) {
    return <div className="chat-header p-4 border-b border-gray-200 bg-gray-50">Chargement...</div>;
  }

  const isGroup = conversation.type === "GROUP";

  // ***** Correction Robuste: Trouver l'autre participant en comparant les ID *****
  let otherParticipant = null;
  if (!isGroup && currentUser && conversation.participants) {
    // Filtrer pour trouver le participant dont l'ID n'est PAS celui de l'utilisateur actuel
    otherParticipant = conversation.participants.find(
      (p) => p.user && String(p.user.id) !== String(currentUser.id)
    );
  }

  const displayName = isGroup ? conversation.name : otherParticipant?.user?.username || "Utilisateur inconnu";
  const displayImage = isGroup ? conversation.groupImage : otherParticipant?.user?.profileImagePath;
  // ***** Correction: S'assurer que targetUserId est bien celui de l'autre participant *****
  const targetUserId = !isGroup ? otherParticipant?.user?.id : null;

  const handleCall = (type) => {
    if (isGroup) {
      // S'assurer que l'ID de conversation est une chaîne
      initiateGroupCallMutation.mutate({ conversationId: String(conversation.id), type });
    } else if (targetUserId != null) { // Vérifier que targetUserId n'est pas null
      // S'assurer que targetUserId est une chaîne
      initiateDirectCallMutation.mutate({ targetUserId: String(targetUserId), type });
    } else {
        console.error("Impossible de lancer l'appel direct: ID de l'autre participant introuvable.");
        // Optionnel: Afficher une notification à l'utilisateur
    }
  };

  return (
    <div className="chat-header flex items-center justify-between p-3 border-b border-gray-200 bg-white shadow-sm">
      <div className="flex items-center overflow-hidden">
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold mr-3 overflow-hidden flex-shrink-0">
          {getAvatarContent(displayName, displayImage)}
        </div>
        <div className="overflow-hidden">
          <h2 className="font-semibold text-sm truncate">{displayName}</h2>
          {typingIndicator ? (
            <span className="text-xs text-blue-500 italic truncate block">{typingIndicator}</span>
          ) : (
            isGroup ? (
              <span className="text-xs text-gray-500">{conversation.participants?.length || 0} participants</span>
            ) : (
              <span className="text-xs text-gray-500">{/* Statut en ligne/hors ligne */}</span>
            )
          )}
        </div>
      </div>
      <div className="flex items-center space-x-3 flex-shrink-0">
        <button
          onClick={() => handleCall("VOICE")}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition duration-150"
          title="Appel vocal"
          disabled={initiateDirectCallMutation.isLoading || initiateGroupCallMutation.isLoading || (!isGroup && targetUserId == null)} // Désactiver si targetUserId est null
        >
          <PhoneIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => handleCall("VIDEO")}
          className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition duration-150"
          title="Appel vidéo"
          disabled={initiateDirectCallMutation.isLoading || initiateGroupCallMutation.isLoading || (!isGroup && targetUserId == null)} // Désactiver si targetUserId est null
        >
          <VideoCameraIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

ChatHeaderRQ.propTypes = {
  conversation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    type: PropTypes.oneOf(["DIRECT", "GROUP"]),
    participants: PropTypes.arrayOf(PropTypes.shape({
        user: PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            username: PropTypes.string,
            profileImagePath: PropTypes.string,
        })
    })),
    groupImage: PropTypes.string,
  }),
  typingIndicator: PropTypes.string,
};

export default ChatHeaderRQ;

