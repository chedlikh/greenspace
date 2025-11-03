// components/Call/IncomingCallNotificationRQ.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { PhoneIcon, PhoneXMarkIcon } from "@heroicons/react/24/solid";
import { useWebSocketContext } from "../../../features/WebSocketProvider"; // Adjust path as needed
import { useJoinCall, useRejectCall } from "../../../services/callHooks"; // Adjust path as needed

function IncomingCallNotificationRQ() {
  const { stompClient, isConnected } = useWebSocketContext();
  const [incomingCall, setIncomingCall] = useState(null); // Stores CallDTO
  const joinCallMutation = useJoinCall();
  const rejectCallMutation = useRejectCall();

  useEffect(() => {
    if (isConnected && stompClient) {
      // Assuming user-specific topic for incoming calls
      // The backend needs to send CallDTO to this topic when a user is invited
      const subscription = stompClient.subscribe("/user/queue/calls/incoming", (message) => {
        try {
          const callData = JSON.parse(message.body);
          console.log("Incoming call notification received:", callData);
          // Only show if it's an actual incoming call needing action
          if (callData && callData.status === "RINGING") { // Adjust status based on backend logic
             setIncomingCall(callData);
          }
        } catch (error) {
          console.error("Failed to parse incoming call notification:", error);
        }
      });

      // Subscription to handle call cancellation or ending by caller before pickup
      const cancelSubscription = stompClient.subscribe("/user/queue/calls/cancel", (message) => {
        try {
            const { callId } = JSON.parse(message.body);
            if (incomingCall && incomingCall.id === callId) {
                console.log("Incoming call cancelled:", callId);
                setIncomingCall(null);
            }
        } catch (error) {
            console.error("Failed to parse call cancellation:", error);
        }
      });

      return () => {
        subscription.unsubscribe();
        cancelSubscription.unsubscribe();
      };
    }
  }, [isConnected, stompClient, incomingCall]); // Re-subscribe if incomingCall changes?

  const handleAccept = () => {
    if (!incomingCall) return;
    joinCallMutation.mutate(incomingCall.id, {
      onSuccess: () => {
        setIncomingCall(null);
        // Logic to open the call interface would go here
        // e.g., dispatch an action, update context state, navigate
        console.log("Call accepted:", incomingCall.id);
      },
      onError: (error) => {
        console.error("Failed to accept call:", error);
        setIncomingCall(null); // Hide notification on error too
      },
    });
  };

  const handleReject = () => {
    if (!incomingCall) return;
    rejectCallMutation.mutate(incomingCall.id, {
      onSuccess: () => {
        setIncomingCall(null);
        console.log("Call rejected:", incomingCall.id);
      },
      onError: (error) => {
        console.error("Failed to reject call:", error);
        setIncomingCall(null); // Hide notification on error too
      },
    });
  };

  if (!incomingCall) {
    return null; // No incoming call, render nothing
  }

  // Extract caller info (adapt based on your CallDTO structure)
  const caller = incomingCall.participants?.find(p => p.role === "INITIATOR")?.user;
  const callerName = caller?.username || "Appel entrant";
  const callType = incomingCall.type === "VIDEO" ? "vidéo" : "vocal";

  return (
    <div className="fixed bottom-5 right-5 bg-white shadow-lg rounded-lg p-4 border border-gray-200 z-50 animate-fade-in">
      <div className="flex items-center mb-3">
        {/* Simple avatar placeholder */}
        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold mr-3">
          {callerName.substring(0, 1).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold">{callerName}</p>
          <p className="text-sm text-gray-600">Appel {callType} entrant...</p>
        </div>
      </div>
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleReject}
          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition duration-150"
          title="Rejeter"
          disabled={rejectCallMutation.isLoading}
        >
          <PhoneXMarkIcon className="h-6 w-6" />
        </button>
        <button
          onClick={handleAccept}
          className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition duration-150"
          title="Accepter"
          disabled={joinCallMutation.isLoading}
        >
          <PhoneIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}

export default IncomingCallNotificationRQ;

