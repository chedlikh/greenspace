// components/Chat/MessageListRQ.jsx
import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import MessageItemRQ from "./MessageItemRQ";
import { useIntersection } from "@mantine/hooks";

function MessageListRQ({
  messages,
  isLoading,
  isError,
  error,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  messagesEndRef,
}) {
  const containerRef = useRef();
  const { ref: loadMoreRef, entry } = useIntersection({
    root: containerRef.current,
    threshold: 1,
  });

  // Charger plus de messages lorsque la sentinelle du haut entre dans la vue
  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      console.log("Fetching next page...");
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Fonction pour générer une clé unique et robuste
  const generateUniqueKey = (msg, index) => {
    if (msg && msg.id != null) {
      return `${msg.id}-${msg.timestamp || index}`;
    }
    console.warn(`Message at index ${index} is missing an ID. Using index as fallback key.`);
    return `msg-index-${index}`;
  };

  return (
    <div ref={containerRef} className="message-list flex-grow overflow-y-auto p-4 space-y-1 bg-gray-100">
      {/* Sentinelle pour charger plus */}
      {hasNextPage ? (
        <div ref={loadMoreRef} className="text-center py-4">
          {isFetchingNextPage ? (
            <span className="text-gray-500 text-sm">Chargement des anciens messages...</span>
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-blue-600 hover:text-blue-800 text-sm"
              disabled={isFetchingNextPage}
            >
              Charger plus
            </button>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-gray-500 text-sm">
          Aucun autre message à charger.
        </div>
      )}

      {isLoading && !messages.length && <div className="text-center text-gray-500 py-4">Chargement des messages...</div>}
      {isError && <div className="text-center text-red-500 py-4">Erreur: {error?.message || "Impossible de charger les messages"}</div>}

      {messages.map((msg, index) =>
        msg ? (
          <MessageItemRQ
            key={generateUniqueKey(msg, index)}
            message={msg}
          />
        ) : null
      )}

      <div ref={messagesEndRef} style={{ height: "1px" }} />
    </div>
  );
}

MessageListRQ.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    timestamp: PropTypes.string,
  })).isRequired,
  isLoading: PropTypes.bool.isRequired,
  isError: PropTypes.bool.isRequired,
  error: PropTypes.object,
  fetchNextPage: PropTypes.func.isRequired,
  hasNextPage: PropTypes.bool,
  isFetchingNextPage: PropTypes.bool.isRequired,
  messagesEndRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]),
};

export default MessageListRQ;