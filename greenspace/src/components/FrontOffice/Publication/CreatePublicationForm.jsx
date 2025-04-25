import React, { useState, useRef } from 'react';
import { useCreatePublication } from '../../../services/publications';
import { useUploadMultipleMedia } from '../../../services/media';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import EmojiPicker from '@emoji-mart/react';
import { Image, Video, Smile, Globe } from 'feather-icons-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../FrontOffice/LoadingSpinner';

const CreatePublicationForm = ({ onSuccess }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const { mutate: createPublication, isLoading: isCreating } = useCreatePublication();
  const { mutate: uploadMedia, isLoading: isUploading } = useUploadMultipleMedia();
  const user = useSelector((state) => state.auth.user);
  const [files, setFiles] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [location, setLocation] = useState('');
  const [feeling, setFeeling] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFeelingMenu, setShowFeelingMenu] = useState(false);
  const fileInputRef = useRef(null);

  const onSubmit = async (data) => {
    try {
      const publicationData = {
        content: data.content,
        privacyLevel: data.privacyLevel,
        location: location || null,
        feeling: feeling || null,
      };

      createPublication(publicationData, {
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
          toast.error(`Failed to create publication: ${error.message}`);
        },
      });
    } catch (error) {
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
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-start space-x-3 mb-4">
        <img
          src={user.profilePhoto || '/default-avatar.png'}
          alt={user.fullName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <form onSubmit={handleSubmit(onSubmit)}>
            <textarea
              {...register('content', { required: 'Content is required' })}
              placeholder="What's on your mind?"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={3}
            />
            {errors.content && (
              <p className="text-red-600 text-sm mt-1">{errors.content.message}</p>
            )}

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <input
                      type="text"
                      placeholder="Add a caption..."
                      value={captions[index] || ''}
                      onChange={(e) => handleCaptionChange(index, e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3">
              <input
                type="text"
                placeholder="Add location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-2">
                {/* FileUpload */}
                <>
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="p-2 text-gray-500 hover:text-indigo-600 relative"
                  >
                    <Image size={20} className="inline" />
                    <Video size={20} className="inline ml-0.5" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*"
                    multiple
                  />
                </>

                {/* EmojiPicker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-500 hover:text-indigo-600"
                  >
                    <Smile size={20} />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute z-10 bottom-full left-0">
                      <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                    </div>
                  )}
                </div>

                {/* Feeling Selector */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFeelingMenu(!showFeelingMenu)}
                    className="p-2 text-gray-500 hover:text-indigo-600"
                  >
                    <svg
                      className="w-5 h-5"
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
                    <span className="absolute -top-2 -right-2 bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                      {feeling}
                    </span>
                  )}
                  {showFeelingMenu && (
                    <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1">
                      <button
                        type="button"
                        onClick={() => handleFeelingSelect('happy')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        😊 Happy
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeelingSelect('sad')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        😢 Sad
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeelingSelect('excited')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        🤩 Excited
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFeelingSelect('angry')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        😠 Angry
                      </button>
                      {feeling && (
                        <button
                          type="button"
                          onClick={() => handleFeelingSelect('')}
                          className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                        >
                          Remove feeling
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* PrivacySelector */}
                <div className="relative">
                  <select
                    {...register('privacyLevel', { required: true })}
                    className="appearance-none pl-8 pr-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    defaultValue="PUBLIC"
                  >
                    <option value="PUBLIC">Public</option>
                    <option value="FRIENDS">Friends</option>
                    <option value="PRIVATE">Only me</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                    <Globe size={16} className="text-gray-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isCreating || isUploading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {(isCreating || isUploading) ? <LoadingSpinner size="sm" /> : 'Post'}
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