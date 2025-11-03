import React from 'react';

const TestModal = ({ onAccept, onDecline, initiatorUsername }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Test Incoming Call</h2>
        <p className="text-lg mb-6">Simulated call from: {initiatorUsername || 'Unknown'}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onAccept}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
          >
            Accept
          </button>
          <button
            onClick={onDecline}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestModal;