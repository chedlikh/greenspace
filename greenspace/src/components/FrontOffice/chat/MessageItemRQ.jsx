// components/Chat/MessageItemRQ.jsx
import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux"; // Ou utiliser un AuthContext

// Fonction utilitaire pour formater le timestamp
const formatTimestamp = (timestamp) => {
  // Gérer le cas où timestamp est undefined ou null
  if (!timestamp) return ""; 
  try {
    const date = new Date(timestamp);
    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
        console.warn("Invalid timestamp received:", timestamp);
        return "";
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (error) {
    console.error("Error formatting timestamp:", timestamp, error);
    return ""; // Retourner une chaîne vide en cas d'erreur
  }
};

// Fonction utilitaire pour obtenir le contenu de l'avatar
const getAvatarContent = (name, imagePath) => {
    if (imagePath) {
      // Préfixer si nécessaire, ex: `${import.meta.env.VITE_API_BASE_URL}/files/${imagePath}`
      return <img src={imagePath} alt={name || "Avatar"} className="w-full h-full object-cover" />;
    }
    const validName = typeof name === 'string' ? name : '';
    return validName ? validName.substring(0, 1).toUpperCase() : "?";
  };

function MessageItemRQ({ message }) {
  // Déterminer si le message provient de l'utilisateur actuel
  const currentUser = useSelector((state) => state.auth.user); // Adapter selon la structure de votre état d'authentification
  // Comparer les ID en tant que chaînes pour éviter les problèmes de type number/string
  const isCurrentUser = String(message.sender?.id) === String(currentUser?.id);

  const senderName = message.sender?.username || "Utilisateur inconnu";
  const senderAvatar = message.sender?.profileImagePath;

  // Style de base basé sur l'expéditeur
  const messageAlignment = isCurrentUser ? "items-end" : "items-start";
  const messageBgColor = isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800";
  const bubbleClasses = `max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg shadow ${messageBgColor}`;

  // Gérer différents types de messages (TEXT, IMAGE, SYSTEM, etc.)
  const renderContent = () => {
    switch (message.type) {
      case "TEXT":
        return <p className="whitespace-pre-wrap break-words">{message.content}</p>; // Ajout de whitespace-pre-wrap et break-words
      case "SYSTEM":
        // Les messages système sont gérés séparément ci-dessous
        return null; 
      // Ajouter des cas pour IMAGE, VIDEO, FILE, VOICE, LOCATION etc.
      // case "IMAGE":
      //   return <img src={message.attachment?.url} alt="Image" className="max-w-xs rounded" />;
      default:
        return <p className="text-red-500 text-sm">[Type de message non supporté: {message.type}]</p>;
    }
  };

  // Rendu spécifique pour les messages système
  if (message.type === "SYSTEM") {
    return (
        <div className="w-full flex justify-center my-2 px-4">
             <div className="text-center text-xs text-gray-500 italic bg-gray-100 px-3 py-1 rounded-full">
                {message.content} {message.timestamp ? `- ${formatTimestamp(message.timestamp)}` : ''} {/* Afficher timestamp seulement s'il existe */}
            </div>
        </div>
    );
  }

  // Rendu pour les messages normaux
  return (
    <div className={`flex flex-col ${messageAlignment} px-4 py-1`}> {/* Ajout de padding */} 
      <div className={`flex items-center mb-1 ${isCurrentUser ? 'justify-end' : ''}`}> {/* Alignement du timestamp */} 
        {!isCurrentUser && (
          <div className="w-6 h-6 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold mr-2 overflow-hidden flex-shrink-0">
            {getAvatarContent(senderName, senderAvatar)}
          </div>
        )}
        {!isCurrentUser && <span className="text-xs text-gray-600 mr-2 font-medium">{senderName}</span>}
        {/* Afficher le timestamp seulement s'il existe */} 
        {message.timestamp && <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>}
      </div>
      <div className={bubbleClasses}>
        {renderContent()}
        {/* Indicateur de lecture (ex: double coche) */}
        {/* {isCurrentUser && message.status === "READ" && <CheckCircleIcon className="h-3 w-3 text-blue-300 inline-block ml-1" />} */}
      </div>
      {/* Affichage des réactions ici si nécessaire */}
    </div>
  );
}

MessageItemRQ.propTypes = {
  message: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    content: PropTypes.string.isRequired,
    // ***** Correction: Rendre timestamp optionnel *****
    timestamp: PropTypes.string, // Chaîne ISO (retiré .isRequired)
    type: PropTypes.string.isRequired, // TEXT, IMAGE, SYSTEM, etc.
    sender: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      username: PropTypes.string,
      profileImagePath: PropTypes.string,
    }),
    // Ajouter d'autres champs comme status, reactions, attachment si nécessaire
  }).isRequired,
};

export default MessageItemRQ;

