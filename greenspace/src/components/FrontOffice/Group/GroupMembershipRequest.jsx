import { useState, useEffect } from 'react';
import { useSendMembershipRequest, useAuthToken, useUserMembershipRequest } from '../../../services/group';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';

const GroupMembershipRequest = ({ groupId, isMember, isAdmin }) => {
    const token = useAuthToken();
    const { data: userRequest, isLoading: isUserRequestLoading, refetch: refetchUserRequest } = useUserMembershipRequest(groupId);
    const { mutate: sendRequest, isLoading: isSending } = useSendMembershipRequest();

    console.log('GroupMembershipRequest props:', { groupId, isMember, isAdmin });
    console.log('User request:', { userRequest, isUserRequestLoading });

    const handleJoinRequest = () => {
        console.log('Sending membership request for group:', groupId);
        sendRequest(groupId, {
            onSuccess: () => {
                toast.success('Membership request sent!');
                console.log('Refetching user request after sending');
                refetchUserRequest();
            },
            onError: (error) => {
                toast.error(`Failed to send request: ${error.message}`);
            },
        });
    };

    if (isMember || isAdmin) {
        console.log('User is a member or admin, hiding membership request UI');
        return null;
    }

    if (isUserRequestLoading) {
        console.log('Loading user request');
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Join Group</h2>
            <button
                onClick={handleJoinRequest}
                disabled={isSending || userRequest?.status === 'PENDING'}
                className="w-full px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
            >
                {isSending ? (
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