
import React, { useState } from 'react';
import { useDeletePublication, useUpdatePublication } from '../../../services/publications';
import { useSelector } from 'react-redux';
import { MessageCircle, Share, Bookmark, MoreHorizontal, Edit, Trash } from 'feather-icons-react';
import { toast } from 'react-toastify';

const PublicationActions = ({ publicationId, username, onToggleComments, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const currentUser = useSelector((state) => state.auth.user);
  const { mutate: deletePublication, isLoading: isDeleting } = useDeletePublication();
  const { mutate: updatePublication, isLoading: isUpdating } = useUpdatePublication();
  const isCurrentUser = currentUser?.username === username;

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

  const handleEdit = () => {
    // Trigger onEdit callback to handle editing in parent component
    if (onEdit) {
      onEdit();
    }
    setShowMenu(false);
  };

  return (
    <div className="flex justify-around">
      <button
        onClick={onToggleComments}
        className="flex items-center text-gray-600 hover:text-indigo-600 px-2 py-1 rounded-md"
      >
        <MessageCircle size={20} className="mr-1" />
        <span>Comment</span>
      </button>

      <button className="flex items-center text-gray-600 hover:text-indigo-600 px-2 py-1 rounded-md">
        <Share size={20} className="mr-1" />
        <span>Share</span>
      </button>

      <button className="flex items-center text-gray-600 hover:text-indigo-600 px-2 py-1 rounded-md">
        <Bookmark size={20} className="mr-1" />
        <span>Save</span>
      </button>

      {isCurrentUser && (
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center text-gray-600 hover:text-indigo-600 px-2 py-1 rounded-md"
            disabled={isDeleting || isUpdating}
          >
            <MoreHorizontal size={20} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
              <button
                onClick={handleEdit}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                disabled={isUpdating}
              >
                <Edit size={16} className="mr-2" />
                {isUpdating ? 'Editing...' : 'Edit'}
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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