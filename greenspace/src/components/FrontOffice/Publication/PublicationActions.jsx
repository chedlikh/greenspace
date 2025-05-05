import React, { useState } from 'react';
import { useDeletePublication, useUpdatePublication } from '../../../services/publications';
import { useSelector } from 'react-redux';
import { MessageCircle, Share, Bookmark, MoreHorizontal, Edit, Trash } from 'feather-icons-react';
import { toast } from 'react-toastify';

const PublicationActions = ({ publicationId, username, group, onToggleComments, editedContent, onSaveEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  const { mutate: deletePublication, isPending: isDeleting } = useDeletePublication();
  const isCurrentUser = currentUser?.username === username;
  const isGroupAdmin = group && currentUser?.id === group.adminId;

  const canEditOrDelete = isCurrentUser || isGroupAdmin;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this publication?')) {
      deletePublication(publicationId, {
        onSuccess: () => {
          toast.success('Publication deleted successfully');
        },
        onError: (error) => {
          toast.error(`Failed to delete publication: ${error.message}`);
        },
      });
    }
  };

  return (
    <div className="flex justify-around py-2">
      <button
        onClick={onToggleComments}
        className="flex items-center text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg transition-colors"
      >
        <MessageCircle size={20} className="mr-2" />
        <span>Comment</span>
      </button>

      <button className="flex items-center text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg transition-colors">
        <Share size={20} className="mr-2" />
        <span>Share</span>
      </button>

      <button className="flex items-center text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg transition-colors">
        <Bookmark size={20} className="mr-2" />
        <span>Save</span>
      </button>

      {canEditOrDelete && (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-lg transition-colors"
            disabled={isDeleting}
          >
            <MoreHorizontal size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200 animate-fadeIn">
              <button
                onClick={() => onSaveEdit(editedContent)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Edit size={16} className="mr-2" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                disabled={isDeleting}
              >
                <Trash size={16} className="mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicationActions;