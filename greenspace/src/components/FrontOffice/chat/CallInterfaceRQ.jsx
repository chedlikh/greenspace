// components/Call/CallInterfaceRQ.jsx (Corrected Imports)
import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
// Corrected Heroicons Imports:
import { PhoneIcon, PhoneXMarkIcon, MicrophoneIcon, VideoCameraIcon } from "@heroicons/react/24/solid";
import { VideoCameraSlashIcon, SpeakerXMarkIcon } from "@heroicons/react/24/outline"; // Use outline for slash icons, SpeakerXMarkIcon for muted mic

import { useCallById, useCallParticipants } from "../../../services/callHooks"; // Adjust path as needed
import { useLeaveCall, useEndCall, useToggleAudio, useToggleVideo } from "../../../services/callHooks"; // Adjust path as needed
import { useWebSocketContext } from "../../../features/WebSocketProvider"; // Adjust path as needed
import { useQueryClient } from "@tanstack/react-query";
import { callKeys } from "../../../services/callHooks"; // Adjust path as needed

// Placeholder for WebRTC logic hook
const useWebRTC = (callId, stompClient, isConnected) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true); // Assume video starts enabled for video calls
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  // --- WebRTC Setup (Placeholder) ---
  useEffect(() => {
    if (!callId || !isConnected || !stompClient) return;

    console.log(`Initializing WebRTC for call ${callId}`);

    // 1. Get local media stream (audio/video)
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // 2. Create RTCPeerConnection
        const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        peerConnectionRef.current = pc;

        // 3. Add local stream tracks to connection
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // 4. Handle ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            console.log("Sending ICE candidate:", event.candidate);
            stompClient.send(`/app/calls/${callId}/signal`, {}, JSON.stringify({ type: "candidate", candidate: event.candidate }));
          }
        };

        // 5. Handle remote stream
        pc.ontrack = (event) => {
          console.log("Remote track received:", event.streams[0]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };

        // 6. Handle negotiation needed
        pc.onnegotiationneeded = async () => {
          try {
            console.log("Negotiation needed, creating offer...");
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            stompClient.send(`/app/calls/${callId}/signal`, {}, JSON.stringify({ type: "offer", sdp: pc.localDescription }));
          } catch (error) {
            console.error("Error creating offer:", error);
          }
        };

      })
      .catch(error => {
        console.error("Error accessing media devices:", error);
      });

    // --- WebSocket Signaling Listener ---
    const signalSubscription = stompClient.subscribe(`/user/queue/calls/${callId}/signal`, async (message) => {
      const signal = JSON.parse(message.body);
      const pc = peerConnectionRef.current;
      if (!pc) return;

      console.log("Received signal:", signal);

      try {
          if (signal.type === "offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            console.log("Offer received, creating answer...");
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            stompClient.send(`/app/calls/${callId}/signal`, {}, JSON.stringify({ type: "answer", sdp: pc.localDescription }));
          } else if (signal.type === "answer") {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
            console.log("Answer received.");
          } else if (signal.type === "candidate") {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
            console.log("ICE candidate added.");
          } else if (signal.type === "hangup") {
              console.log("Received hangup signal.");
              // Handle hangup logic
          }
      } catch (error) {
          console.error("Error handling signal:", error);
      }
    });

    // Cleanup function
    return () => {
      console.log(`Cleaning up WebRTC for call ${callId}`);
      signalSubscription?.unsubscribe();
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      peerConnectionRef.current?.close();
      peerConnectionRef.current = null;
      localStreamRef.current = null;
    };

  }, [callId, isConnected, stompClient]);

  // --- Media Control Functions ---
  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsAudioMuted(muted => !muted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoEnabled(enabled => !enabled);
    }
  };

  return { localVideoRef, remoteVideoRef, isAudioMuted, isVideoEnabled, toggleAudio, toggleVideo };
};

function CallInterfaceRQ({ callId, onHangup }) {
  const queryClient = useQueryClient();
  const { stompClient, isConnected } = useWebSocketContext();

  // Fetch call details and participants
  const { data: call, isLoading: isLoadingCall } = useCallById(callId);
  const { data: participants, isLoading: isLoadingParticipants } = useCallParticipants(callId);

  // Mutations
  const leaveCallMutation = useLeaveCall();
  const toggleAudioMutation = useToggleAudio();
  const toggleVideoMutation = useToggleVideo();

  // WebRTC Hook
  const { localVideoRef, remoteVideoRef, isAudioMuted, isVideoEnabled, toggleAudio: localToggleAudio, toggleVideo: localToggleVideo } = useWebRTC(callId, stompClient, isConnected);

  // WebSocket listener for participant updates
  useEffect(() => {
    if (isConnected && stompClient && callId) {
      const participantUpdateSubscription = stompClient.subscribe(`/topic/calls/${callId}/participants`, (message) => {
        console.log("Participant update received:", message.body);
        queryClient.invalidateQueries({ queryKey: callKeys.participants(callId) });
      });

      const callEndSubscription = stompClient.subscribe(`/topic/calls/${callId}/end`, (message) => {
        console.log("Call ended via WebSocket");
        onHangup();
      });

      return () => {
        participantUpdateSubscription.unsubscribe();
        callEndSubscription.unsubscribe();
      };
    }
  }, [isConnected, stompClient, callId, queryClient, onHangup]);

  const handleToggleAudio = () => {
    localToggleAudio();
    toggleAudioMutation.mutate(callId);
  };

  const handleToggleVideo = () => {
    localToggleVideo();
    toggleVideoMutation.mutate(callId);
  };

  const handleHangup = () => {
    leaveCallMutation.mutate(callId, {
      onSuccess: () => onHangup(),
      onError: () => onHangup(),
    });
  };

  if (isLoadingCall || isLoadingParticipants) {
    return <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center text-white z-50">Chargement de l'appel...</div>;
  }

  if (!call) {
    return <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center text-white z-50">Erreur: Appel introuvable.</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 text-white flex flex-col items-center justify-between z-50 p-4">
      {/* Video Feeds */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-contain"></video>
        <video ref={localVideoRef} autoPlay playsInline muted className="absolute bottom-5 right-5 w-1/4 max-w-xs border-2 border-gray-600 rounded-md shadow-lg"></video>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4 p-4 bg-gray-800 bg-opacity-75 rounded-full shadow-lg">
        <button
          onClick={handleToggleAudio}
          className={`p-3 rounded-full transition duration-150 ${isAudioMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-500"}`}
          title={isAudioMuted ? "Activer micro" : "Couper micro"}
        >
          {/* Corrected Icon Usage */}
          {isAudioMuted ? <SpeakerXMarkIcon className="h-6 w-6" /> : <MicrophoneIcon className="h-6 w-6" />}
        </button>

        <button
          onClick={handleHangup}
          className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition duration-150 mx-4"
          title="Raccrocher"
          disabled={leaveCallMutation.isLoading}
        >
          <PhoneXMarkIcon className="h-7 w-7" />
        </button>

        {call.type === "VIDEO" && (
          <button
            onClick={handleToggleVideo}
            className={`p-3 rounded-full transition duration-150 ${!isVideoEnabled ? "bg-red-500 hover:bg-red-600" : "bg-gray-600 hover:bg-gray-500"}`}
            title={isVideoEnabled ? "Arrêter vidéo" : "Activer vidéo"}
          >
            {/* Corrected Icon Usage */}
            {isVideoEnabled ? <VideoCameraIcon className="h-6 w-6" /> : <VideoCameraSlashIcon className="h-6 w-6" />}
          </button>
        )}
      </div>
    </div>
  );
}

CallInterfaceRQ.propTypes = {
  callId: PropTypes.string.isRequired,
  onHangup: PropTypes.func.isRequired,
};

export default CallInterfaceRQ;

