// components/Chat/ConversationListRQ.jsx
import React from "react";
import { useUserConversations } from "../../../services/conversationHooks";
import ConversationItemRQ from "./ConversationItemRQ";

function ConversationListRQ({ onSelectConversation, selectedConversationId }) {
  const { data: conversations, isLoading, isError, error } = useUserConversations();

  if (isLoading) {
    return <div className="p-4 text-gray-500">Chargement des conversations...</div>;
  }

  if (isError) {
    return <div className="p-4 text-red-500">Erreur: {error.message}</div>;
  }

  return (
    <div className="conversation-list overflow-y-auto h-full border-r border-gray-200 bg-gray-50">
      <h2 className="text-lg font-semibold p-4 border-b border-gray-200 bg-white">Conversations</h2>
      {conversations && conversations.length > 0 ? (
        conversations.map((conv) => (
          <ConversationItemRQ
            key={conv.id}
            conversation={conv}
            isSelected={conv.id === selectedConversationId}
            onSelect={() => onSelectConversation(conv.id)}
          />
        ))
      ) : (
        <div className="p-4 text-gray-500">Aucune conversation trouvée.</div>
      )}
    </div>
  );
}

export default ConversationListRQ;

