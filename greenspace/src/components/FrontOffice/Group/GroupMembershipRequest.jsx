import { useState } from 'react';
import { useSendMembershipRequest, useAuthToken, useUserMembershipRequest } from '../../../services/group';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';

const GroupMembershipRequest = ({ groupId, isMember, isAdmin }) => {
  const token = useAuthToken();
  const [hasSentRequest, setHasSentRequest] = useState(false);
  const { data: userRequest, isLoading: isUserRequestLoading, refetch: refetchUserRequest } = useUserMembershipRequest(groupId, {
    enabled: hasSentRequest, // Only fetch after sending a request
    retry: 0, // No retries to avoid delays
    staleTime: 30000, // Cache for 30 seconds
  });
  const { mutate: sendRequest, isLoading: isSending } = useSendMembershipRequest();

  const handleJoinRequest = () => {
    sendRequest(groupId, {
      onSuccess: () => {
        toast.success('Membership request sent!');
        setHasSentRequest(true);
        refetchUserRequest();
      },
      onError: (error) => {
        toast.error(`Failed to send request: ${error.message}`);
      },
    });
  };

  if (isMember || isAdmin) return null;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Join Group</h2>
      <button
        onClick={handleJoinRequest}
        disabled={isSending || userRequest?.status === 'PENDING'}
        className="w-full px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-300"
      >
        {isSending || isUserRequestLoading ? (
          <LoadingSpinner size="sm" />
        ) : userRequest?.status === 'PENDING' ? (
          'Request Pending'
        ) : (
          'Request to Join'
        )}
      </button>
    </div>
  );
};

export default GroupMembershipRequest;