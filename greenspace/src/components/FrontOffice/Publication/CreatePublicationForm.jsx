import React, { useState, useRef } from 'react';
import { useCreatePublication, useCreateCrossUserPublication } from '../../../services/publications';
import { useCreateGroupPublication } from '../../../services/group';
import { useUploadMultipleMedia } from '../../../services/media';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import EmojiPicker from '@emoji-mart/react';
import { Image, Video, Smile, Globe, Edit3, Camera, AlertCircle, Lock, Bookmark, AlertOctagon } from 'feather-icons-react';
import { toast } from 'react-toastify';
import LoadingSpinner from './../LoadingSpinner';

const CreatePublicationForm = ({ targetUsername, groupId, onSuccess }) => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef(null);
  const emojiButtonRef = useRef(null);

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
                onSuccess: (response) => {
                  console.log('Media upload response:', response);
                  resetForm();
                  toast.success('Publication created successfully');
                },
                onError: (error) => {
                  console.error('Media upload error:', error);
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
    setShowMoreMenu(false);
    setIsExpanded(false);
    if (onSuccess) onSuccess();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 10) {
        toast.error('Maximum 10 files allowed');
        return;
      }
      const validFiles = filesArray.filter((file) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isValid = isImage || isVideo;
        if (!isValid) {
          console.warn(`Invalid file type: ${file.type}`);
        }
        return isValid;
      });
      if (validFiles.length !== filesArray.length) {
        toast.error('Only image and video files are allowed');
      }
      if (validFiles.length > 0) {
        setFiles(validFiles);
        setCaptions(new Array(validFiles.length).fill(''));
      }
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

  const isVideoFile = (file) => file.type.startsWith('video/');

  return (
    <div className="card w-100 shadow-xss rounded-xxl border-0 ps-4 pt-4 pe-4 pb-3 mb-3">
      <div className="card-body p-0">
        <a href="#" className="font-xssss fw-600 text-grey-500 card-body p-0 d-flex align-items-center">
          <i className="btn-round-sm font-xs text-primary feather-edit-3 me-2 bg-greylight"></i>
          Create Post
        </a>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card-body p-0 mt-3 position-relative">
          <figure className="avatar position-absolute ms-2 mt-1 top-5">
            <img 
              src={user?.photoProfile ? `${BASE_URL}/images/${user.photoProfile}` : '/default-avatar.png'} 
              alt={user?.firstname && user?.lastName ? `${user.firstname} ${user.lastName}` : user?.username || 'Anonymous User'}
              className="shadow-sm rounded-circle w30"
            />
          </figure>
          
          {/* Emoji Picker Button positioned similar to avatar */}
          <div className="position-absolute" style={{ right: '10px', top: '10px' }}>
            <button
              type="button"
              ref={emojiButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker(!showEmojiPicker);
              }}
              className="btn-round-xs bg-greylight text-grey-500"
            >
              <Smile size={16} />
            </button>
            
            {showEmojiPicker && (
              <div className="position-absolute" style={{ right: 0, bottom: '100%', zIndex: 1000 }}>
                <EmojiPicker 
                  onEmojiSelect={handleEmojiSelect}
                  onClickOutside={() => setShowEmojiPicker(false)}
                  theme="light"
                />
              </div>
            )}
          </div>
          
          <textarea
            {...register('content', { required: 'Content is required' })}
            onClick={() => setIsExpanded(true)}
            placeholder={isGroupPost ? "What's happening in the group?" : isCrossUserPost ? `Write something on ${targetUsername}'s profile...` : "What's on your mind?"}
            className="h100 bor-0 w-100 rounded-xxl p-2 ps-5 pe-5 font-xssss text-grey-500 fw-500 border-light-md theme-dark-bg"
            cols="30"
            rows="10"
          />
          {errors.content && (
            <p className="text-red-600 text-xs mt-1">{errors.content.message}</p>
          )}
        </div>

        {isExpanded && (
          <>
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
                    {isVideoFile(file) ? (
                      <video
                        controls
                        src={URL.createObjectURL(file)}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => console.error('Video preview error:', e)}
                      />
                    ) : (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => console.error('Image preview error:', e)}
                      />
                    )}
                    <input
                      type="text"
                      placeholder="Add a caption..."
                      value={captions[index] || ''}
                      onChange={(e) => handleCaptionChange(index, e.target.value)}
                      className="flex-1 p-1 text-xs border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFiles(files.filter((_, i) => i !== index));
                        setCaptions(captions.filter((_, i) => i !== index));
                      }}
                      className="text-red-500 hover:text-red-600 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="card-body d-flex p-0 mt-0">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
                className="d-flex align-items-center font-xssss fw-600 ls-1 text-grey-700 text-dark pe-4"
              >
                <i className="font-md text-danger feather-video me-2"></i>
                <span className="d-none-xs">Live Video</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/mp4,video/webm"
                multiple
              />

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); triggerFileInput(); }}
                className="d-flex align-items-center font-xssss fw-600 ls-1 text-grey-700 text-dark pe-4"
              >
                <i className="font-md text-success feather-image me-2"></i>
                <span className="d-none-xs">Photo/Video</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowFeelingMenu(!showFeelingMenu); }}
                  className="d-flex align-items-center font-xssss fw-600 ls-1 text-grey-700 text-dark pe-4"
                >
                  <i className="font-md text-warning feather-camera me-2"></i>
                  <span className="d-none-xs">Feeling/Activity</span>
                </button>
                {showFeelingMenu && (
                  <div className="absolute z-50 bottom-full left-0 mb-2 w-52 bg-white rounded-lg shadow-xl py-2 animate-fadeIn">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleFeelingSelect('happy'); }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors w-full text-left"
                    >
                      😊 Happy
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleFeelingSelect('sad'); }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors w-full text-left"
                    >
                      😢 Sad
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleFeelingSelect('excited'); }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors w-full text-left"
                    >
                      🤩 Excited
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleFeelingSelect('angry'); }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors w-full text-left"
                    >
                      😠 Angry
                    </button>
                    {feeling && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleFeelingSelect(''); }}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                      >
                        Remove feeling
                      </button>
                    )}
                  </div>
                )}
              </div>

              
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="relative">
                <select
                  {...register('privacyLevel', { required: true })}
                  onClick={(e) => e.stopPropagation()}
                  className="appearance-none pl-8 pr-3 py-1 bg-white border border-gray-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                  defaultValue="PUBLIC"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="FRIENDS">Friends</option>
                  <option value="PRIVATE">Only me</option>
                </select>
                <div className="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                  <Globe size={14} className="text-gray-400" />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isCreating || isUploading || isCreatingCross || isCreatingGroup}
                className="px-4 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 text-xs"
              >
                {(isCreating || isUploading || isCreatingCross || isCreatingGroup) ? <LoadingSpinner size="xs" /> : 'Post'}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};


export default CreatePublicationForm;