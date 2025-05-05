import React, { useState, useRef } from 'react';
import { useCreatePublication, useCreateCrossUserPublication } from '../../../services/publications';
import { useCreateGroupPublication } from '../../../services/group';
import { useUploadMultipleMedia } from '../../../services/media';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import EmojiPicker from '@emoji-mart/react';
import { Image, Video, Smile, Globe } from 'feather-icons-react';
import { toast } from 'react-toastify';
import LoadingSpinner from './../LoadingSpinner';

const CreatePublicationForm = ({ targetUsername, groupId, onSuccess }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const { mutate: createPublication, isPending: isCreating } = useCreatePublication();
  const { mutate: createCrossUserPublication, isPending: isCreatingCross } = useCreateCrossUserPublication();
  const { mutate: createGroupPublication, isPending: isCreatingGroup } = useCreateGroupPublication();
  const { mutate: uploadMedia, isPending: isUploading } = useUploadMultipleMedia();
  const user = useSelector((state) => state.auth.user);
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [location, setLocation] = useState('');
  const [feeling, setFeeling] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFeelingMenu, setShowFeelingMenu] = useState(false);
  const fileInputRef = useRef(null);

  const isCrossUserPost = !!targetUsername && typeof targetUsername === 'string' && targetUsername.trim() !== '';
  const isGroupPost = !!groupId;

  if (isCrossUserPost && !targetUsername) {
    console.warn('Invalid targetUsername for cross-user post:', targetUsername);
    toast.warn('Cannot post to profile: Invalid target username');
  }

  const onSubmit = async (data) => {
    try {
      if (isCrossUserPost && !targetUsername) {
        throw new Error('Target username is missing for cross-user post');
      }
      if (isGroupPost && !groupId) {
        throw new Error('Group ID is missing for group post');
      }

      const publicationData = {
        content: data.content,
        privacyLevel: data.privacyLevel,
        location: location || null,
        feeling: feeling || null,
        ...(isCrossUserPost && { targetUsername })
      };

      let createMutation;
      if (isGroupPost) {
        createMutation = (data, options) => createGroupPublication({ groupId, publicationData: data }, options);
      } else if (isCrossUserPost) {
        createMutation = createCrossUserPublication;
      } else {
        createMutation = createPublication;
      }

      createMutation(publicationData, {
        onSuccess: (createdPublication) => {
          if (files.length > 0) {
            uploadMedia(
              {
                publicationId: createdPublication.id,
                files,
                captions,
              },
              {
                onSuccess: () => {
                  resetForm();
                  toast.success('Publication created successfully');
                },
                onError: (error) => {
                  toast.error(`Failed to upload media: ${error.message}`);
                },
              }
            );
          } else {
            resetForm();
            toast.success('Publication created successfully');
          }
        },
        onError: (error) => {
          console.error('Create publication error:', error);
          toast.error(`Failed to create publication: ${error.message}`);
        },
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(`Error creating publication: ${error.message}`);
    }
  };

  const resetForm = () => {
    reset();
    setFiles([]);
    setCaptions([]);
    setLocation('');
    setFeeling('');
    setShowEmojiPicker(false);
    setShowFeelingMenu(false);
    if (onSuccess) onSuccess();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 10) {
        toast.error('Maximum 10 files allowed');
        return;
      }
      const validFiles = filesArray.filter((file) =>
        file.type.startsWith('image/') || file.type.startsWith('video/')
      );
      if (validFiles.length !== filesArray.length) {
        toast.error('Only image and video files are allowed');
      }
      setFiles(validFiles);
      setCaptions(new Array(validFiles.length).fill(''));
    }
  };

  const handleCaptionChange = (index, caption) => {
    const newCaptions = [...captions];
    newCaptions[index] = caption;
    setCaptions(newCaptions);
  };

  const handleEmojiSelect = (emoji) => {
    setValue('content', watch('content') + emoji.native);
    setShowEmojiPicker(false);
  };

  const handleFeelingSelect = (newFeeling) => {
    setFeeling(newFeeling);
    setShowFeelingMenu(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="bg-gradient-to-r from-white to-gray-50 rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-start space-x-4 mb-4">
        <img
          src={user?.photoProfile ? `${BASE_URL}/images/${user.photoProfile}` : '/default-avatar.png'}
          alt={user?.firstname && user?.lastName ? `${user.firstname} ${user.lastName}` : user?.username || 'Anonymous User'}
          className="w-12 h-12 rounded-full object-cover shadow-sm"
        />
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)}>
            <textarea
              {...register('content', { required: 'Content is required' })}
              placeholder={isGroupPost ? "What's happening in the group?" : isCrossUserPost ? `Write something on ${targetUsername}'s profile...` : "What's on your mind?"}
              className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all shadow-sm"
              rows={4}
            />
            {errors.content && (
              <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>
            )}

            {files.length > 0 && (
              <div className="mt-4 space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-gray-100 p-3 rounded-lg">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Add a caption..."
                      value={captions[index] || ''}
                      onChange={(e) => handleCaptionChange(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4">
              <input
                type="text"
                placeholder="Add location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  <Image size={24} className="inline" />
                  <Video size={24} className="inline ml-1" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*"
                  multiple
                />

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <Smile size={24} />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute z-50 bottom-full left-0 mb-2">
                      <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFeelingMenu(!showFeelingMenu)}
                    className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                  {feeling && (
                    <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                      {feeling}
                    </span>
                  )}
                  {showFeelingMenu && (
                    <div className="absolute z-50 mt-2 w-52 bg-white rounded-lg shadow-xl py-2 animate-fadeIn">
                      <button
                        type="button"
                        onClick={() => handleFeelingSelect('happy')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors w-full text-left"
                      >
                        😊 Happy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeelingSelect('sad')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors w-full text-left"
                      >
                        😢 Sad
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeelingSelect('excited')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors w-full text-left"
                      >
                        🤩 Excited
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeelingSelect('angry')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors w-full text-left"
                      >
                        😠 Angry
                      </button>
                      {feeling && (
                        <button
                          type="button"
                          onClick={() => handleFeelingSelect('')}
                          className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                        >
                          Remove feeling
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative">
                  <select
                    {...register('privacyLevel', { required: true })}
                    className="appearance-none pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all"
                    defaultValue="PUBLIC"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="FRIENDS">Friends</option>
                    <option value="PRIVATE">Only me</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Globe size={18} className="text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating || isUploading || isCreatingCross || isCreatingGroup}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
                >
                  {(isCreating || isUploading || isCreatingCross || isCreatingGroup) ? <LoadingSpinner size="sm" /> : 'Post'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePublicationForm;