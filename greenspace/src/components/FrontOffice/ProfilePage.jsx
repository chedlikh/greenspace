
import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { 
  uploadProfilePhoto, 
  uploadCoverPhoto,
  fetchUserDetails,
  useUserDetails
} from '../../services/hooks'; 
import {
  useActiveStoriesByUser,
  useCreateStory,
  fetchMediaWithAuth,
  getStoryMediaUrl,
} from '../../services/storyService';
import { Mail, MapPin, Briefcase, User, Users, Calendar, Phone, Globe, Home, Camera, Edit, X, Plus } from 'feather-icons-react';
import CreatePublicationForm from './Publication/CreatePublicationForm'; // Import from previous response
import UserProfilePublications from './Publication/UserProfilePublications'; // Import from previous response
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { username: urlUsername } = useParams();
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [storyFile, setStoryFile] = useState(null);
  const [storyPreview, setStoryPreview] = useState(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [loadedStoryMedia, setLoadedStoryMedia] = useState(null);
  const [storyProgress, setStoryProgress] = useState(0);
  
  // File input refs
  const profilePhotoInputRef = useRef(null);
  const coverPhotoInputRef = useRef(null);
  const storyFileInputRef = useRef(null);

  // Get user data
  const currentUserQuery = useQuery({
    queryKey: ['currentUser', token],
    queryFn: () => fetchUserDetails(token),
    enabled: !urlUsername && !!token
  });

  const otherUserQuery = useUserDetails(urlUsername);
  
  // Determine which data to use
  const user = urlUsername ? otherUserQuery.data : currentUserQuery.data;
  const isLoading = urlUsername ? otherUserQuery.isLoading : currentUserQuery.isLoading;
  const isError = urlUsername ? otherUserQuery.isError : currentUserQuery.isError;
  const error = urlUsername ? otherUserQuery.error : currentUserQuery.error;

  // Determine if this is the current user's profile
  const isCurrentUser = !urlUsername || (user && urlUsername === user.username);
  const profileUsername = urlUsername || user?.username || '';

  // Fetch stories for the profile we're viewing
  const { data: userStories = [], isLoading: loadingStories } = useActiveStoriesByUser(profileUsername);
  const createStoryMutation = useCreateStory();

  // Click outside handler for photo menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showPhotoMenu && !e.target.closest('.photo-menu-container')) {
        setShowPhotoMenu(false);
      }
    };
  
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showPhotoMenu]);

  // Story Progress Timer Effect
  useEffect(() => {
    let timer;
    let progressTimer;
    
    if (showStoryViewer && userStories.length > 0) {
      // Reset progress
      setStoryProgress(0);
      
      // Load the current story media
      const loadStoryMedia = async () => {
        if (userStories[currentStoryIndex]) {
          const fileName = userStories[currentStoryIndex].mediaUrl;
          
          if (!fileName) {
            console.error("Media URL is undefined for story:", userStories[currentStoryIndex]);
            setLoadedStoryMedia(null);
            return;
          }
          
          const mediaInfo = getStoryMediaUrl(fileName, token);
          
          try {
            const mediaUrl = await fetchMediaWithAuth(mediaInfo.url, mediaInfo.token);
            setLoadedStoryMedia(mediaUrl);
          } catch (error) {
            console.error("Failed to load story media:", error);
            setLoadedStoryMedia(null);
          }
        }
      };
      
      loadStoryMedia();
      
      // Progress animation timer
      progressTimer = setInterval(() => {
        setStoryProgress(prev => {
          const newProgress = prev + (100 / (5000 / 50));
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 50);
      
      // Story duration timer
      timer = setTimeout(() => {
        if (currentStoryIndex < userStories.length - 1) {
          setCurrentStoryIndex(currentStoryIndex + 1);
        } else {
          setShowStoryViewer(false);
          setCurrentStoryIndex(0);
        }
      }, 5000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
      if (progressTimer) clearInterval(progressTimer);
      if (loadedStoryMedia && loadedStoryMedia.startsWith('blob:')) {
        URL.revokeObjectURL(loadedStoryMedia);
      }
    };
  }, [currentStoryIndex, showStoryViewer, userStories, token]);

  // Mutations for photo uploads
  const uploadProfileMutation = useMutation({
    mutationFn: (file) => uploadProfilePhoto(profileUsername, file, token),
    onSuccess: () => {
      queryClient.invalidateQueries(['userDetails', profileUsername]);
      queryClient.invalidateQueries(['currentUser', token]);
      setProfilePhotoPreview(null);
      toast.success('Profile photo updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update profile photo: ${error.message}`);
    }
  });

  const uploadCoverMutation = useMutation({
    mutationFn: (file) => uploadCoverPhoto(profileUsername, file, token),
    onSuccess: () => {
      queryClient.invalidateQueries(['userDetails', profileUsername]);
      queryClient.invalidateQueries(['currentUser', token]);
      toast.success('Cover photo updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update cover photo: ${error.message}`);
    }
  });

  // Handle file uploads
  const handleProfilePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfilePhotoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
      
      uploadProfileMutation.mutate(file);
    }
  };

  const handleCoverPhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadCoverMutation.mutate(e.target.files[0]);
    }
  };

  const handleStoryFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStoryFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setStoryPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStory = async () => {
    if (!storyFile) return;
    
    try {
      if (!token) {
        console.error("Authentication token missing");
        toast.error('Please log in to create a story');
        return;
      }
      
      await createStoryMutation.mutateAsync({
        mediaFile: storyFile,
        caption: storyCaption,
        mediaType: storyFile.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'
      });
      
      setStoryFile(null);
      setStoryPreview(null);
      setStoryCaption('');
      setShowStoryModal(false);
      
      queryClient.invalidateQueries(['user-stories', profileUsername]);
      toast.success('Story created successfully');
    } catch (error) {
      console.error("Failed to create story:", error);
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Your session has expired. Please log in again.");
        } else {
          toast.error(`Server error: ${error.response.status}. Please try again later.`);
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("An error occurred. Please try again.");
      }
    }
  };

  const openStoryViewer = () => {
    if (userStories.length > 0) {
      setCurrentStoryIndex(0);
      setShowStoryViewer(true);
      setStoryProgress(0);
    }
  };

  const navigateStory = (direction) => {
    if (direction === 'next' && currentStoryIndex < userStories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setStoryProgress(0);
    } else if (direction === 'prev' && currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setStoryProgress(0);
    } else if (direction === 'next') {
      setShowStoryViewer(false);
      setCurrentStoryIndex(0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="preloader animate-spin w-16 h-16 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full"></div>
      </div>
    );
  }

  if (isError) {
    const errorMessage = error?.response?.data?.message || 
                       error?.message || 
                       'Failed to load profile data';
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md">
          <h3 className="font-semibold text-lg mb-2">Error Loading Profile</h3>
          <p>{errorMessage}</p>
          {error?.response?.status === 401 && (
            <Link to="/login" className="text-blue-600">Please login again</Link>
          )}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg max-w-md">
          <h3 className="font-semibold text-lg mb-2">No Profile Data</h3>
          <p>We couldn't find your profile data. Try logging in again.</p>
        </div>
      </div>
    );
  }

  const imageBaseUrl = 'http://localhost:8089/images/';
  const hasActiveStories = userStories.length > 0;

  return (
    <div className="main-content bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          {/* Cover Photo */}
          <div 
            className="h-64 bg-cover bg-center relative"
            style={{
              backgroundImage: user.photoCover 
                ? `url(${imageBaseUrl + user.photoCover})`
                : "url(/images/default-cover.jpg)"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            
            {isCurrentUser && (
              <>
                <button 
                  onClick={() => coverPhotoInputRef.current.click()}
                  className="absolute bottom-4 right-4 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
                >
                  <Camera size={20} className="text-gray-700" />
                </button>
                <input 
                  type="file" 
                  ref={coverPhotoInputRef}
                  onChange={handleCoverPhotoChange}
                  className="hidden" 
                  accept="image/*"
                />
              </>
            )}
          </div>
          
          {/* Profile Info Container */}
          <div className="">
            {/* Profile Photo Section */}
            <div className="relative -mt-16 mb-4 flex justify-center" style={{ marginRight: "50px", marginLeft: "50px"}}>
              <div className="relative group">
                {hasActiveStories && (
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-blue-500"
                    style={{ transform: 'scale(1.15)', cursor: 'pointer' }}
                    onClick={openStoryViewer}
                  ></div>
                )}
                
                <div 
                  className={`h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md ${hasActiveStories ? 'cursor-pointer' : ''}`}
                  onClick={hasActiveStories ? openStoryViewer : undefined}
                >
                  <img 
                    src={profilePhotoPreview || 
                         (user.photoProfile ? `${imageBaseUrl}${user.photoProfile}` : "/images/default-profile.png")}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    onError={(e) => (e.target.src = '/images/default-profile.png')}
                  />
                </div>
                
                {isCurrentUser && (
                  <div className="absolute -bottom-2 -right-2">
                    <div className="relative photo-menu-container">
                      <button
                        className="bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPhotoMenu(!showPhotoMenu);
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      
                      {showPhotoMenu && (
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setShowPhotoMenu(false);
                              setShowStoryModal(true);
                            }}
                          >
                            Add Story
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => {
                              setShowPhotoMenu(false);
                              profilePhotoInputRef.current.click();
                            }}
                          >
                            Edit Profile Photo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Stats and Action Buttons */}
            <div className="flex justify-between mt-2">
              <div className="flex space-x-4">
                <div className="text-center">
                  <span className="block font-bold text-gray-900" style={{ marginTop: "-50px", marginLeft: "25px" }}>456</span>
                  <span className="text-xs text-gray-500" style={{ marginLeft: "25px" }}>Posts</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-gray-900" style={{ marginTop: "-50px" }}>2.1k</span>
                  <span className="text-xs text-gray-500">Followers</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-gray-900" style={{ marginTop: "-50px" }}>32k</span>
                  <span className="text-xs text-gray-500">Following</span>
                </div>
              </div>
              
              <div className="w-32"></div>
              
              <div className="flex space-x-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center" style={{ marginTop: "-50px" }}>
                  <Mail size={16} className="inline mr-1" style={{ marginTop: "-0px" }} /> Message
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center" style={{ marginTop: "-50px", marginRight: "25px" }}>
                  {user.isConnect ? 
                    <span className="flex items-center"><span className="h-2 w-2 bg-green-500 rounded-full mr-2" style={{ marginTop: "-0px" }}></span>Online</span> : 
                    <span className="flex items-center"><span className="h-2 w-2 bg-gray-400 rounded-full mr-2" style={{ marginTop: "-0px" }}></span>Offline</span>
                  }
                </button>
              </div>
            </div>
            
            {/* User Info */}
            <div className="pt-16 mt-4">
              <div className="text-center" style={{ marginTop: "-100px" }}>
                <h1 className="text-2xl font-bold text-gray-900">{user.firstname} {user.lastName}</h1>
                <p className="text-sm text-gray-600">@{user.username}</p>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="px-6 border-t border-gray-100" style={{ marginTop: "-50px" }}>
              <nav className="flex overflow-x-auto">
                <Link to="#about" className="px-4 py-3 font-medium text-blue-600 border-b-2 border-blue-600 whitespace-nowrap">
                  About
                </Link>
                <Link to="#posts" className="px-4 py-3 font-medium text-gray-500 hover:text-gray-900 whitespace-nowrap">
                  Posts
                </Link>
                <Link to="#photos" className="px-4 py-3 font-medium text-gray-500 hover:text-gray-900 whitespace-nowrap">
                  Photos
                </Link>
                <Link to="#friends" className="px-4 py-3 font-medium text-gray-500 hover:text-gray-900 whitespace-nowrap">
                  Friends
                </Link>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
              <div className="space-y-4">
                <div className="flex">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Gender</h3>
                    <p className="text-sm text-gray-600">{user.gender || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Email</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Phone</h3>
                    <p className="text-sm text-gray-600">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Birthday</h3>
                    <p className="text-sm text-gray-600">{user.birthday || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex">
                  <Users className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Role</h3>
                    <p className="text-sm text-gray-600">{user.authorities?.[0]?.authority || 'User'}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Position</h3>
                    <p className="text-sm text-gray-600">{user.poste?.titre || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <Globe className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Department</h3>
                    <p className="text-sm text-gray-600">{user.poste?.gservices?.[0]?.name || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="flex">
                  <Home className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Company</h3>
                    <p className="text-sm text-gray-600">{user.poste?.gservices?.[0]?.sites?.[0]?.societe?.name || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Photos Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Photos</h2>
                <Link to="#photos" className="text-sm font-medium text-blue-600 hover:text-blue-800">See all</Link>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="rounded-lg overflow-hidden aspect-square">
                    <img 
                      src={`/images/e-${item + 1}.jpg`} 
                      alt="Gallery" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {isCurrentUser && (
              <CreatePublicationForm
                onSuccess={() => {
                  queryClient.invalidateQueries(['userPublications', profileUsername]);
                }}
              />
            )}
            
            {/* User Posts */}
            <UserProfilePublications username={profileUsername} />
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={profilePhotoInputRef}
        onChange={handleProfilePhotoChange}
        className="hidden" 
        accept="image/*"
      />
      
      <input 
        type="file" 
        ref={storyFileInputRef}
        onChange={handleStoryFileChange}
        className="hidden" 
        accept="image/*,video/*"
      />

      {/* Story Creation Modal */}
      {isCurrentUser && showStoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl overflow-hidden max-w-md w-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-lg">Create Story</h3>
              <button 
                onClick={() => {
                  setShowStoryModal(false);
                  setStoryFile(null);
                  setStoryPreview(null);
                  setStoryCaption('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              {!storyPreview ? (
                <div 
                  onClick={() => storyFileInputRef.current.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <div className="mb-4 bg-blue-100 p-3 rounded-full">
                      <Plus size={24} className="text-blue-600" />
                    </div>
                    <p className="font-medium text-gray-700">Add Photo or Video</p>
                    <p className="text-sm text-gray-500 mt-1">Share a moment with your followers</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden aspect-square max-h-80 bg-black flex items-center justify-center">
                    {storyFile && storyFile.type.startsWith('image/') ? (
                      <img 
                        src={storyPreview} 
                        alt="Story preview" 
                        className="w-full h-full object-contain"
                      />
                    ) : storyFile && storyFile.type.startsWith('video/') ? (
                      <video 
                        src={storyPreview} 
                        controls 
                        className="w-full h-full object-contain"
                      />
                    ) : null}
                    
                    <button 
                      onClick={() => {
                        setStoryFile(null);
                        setStoryPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <textarea
                    value={storyCaption}
                    onChange={(e) => setStoryCaption(e.target.value)}
                    placeholder="Write a caption..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setStoryFile(null);
                        setStoryPreview(null);
                        storyFileInputRef.current.click();
                      }}
                      className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Change Media
                    </button>
                    <button
                      onClick={handleCreateStory}
                      disabled={!storyFile || createStoryMutation.isLoading}
                      className={`flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg transition-colors ${
                        !storyFile || createStoryMutation.isLoading 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-blue-700'
                      }`}
                    >
                      {createStoryMutation.isLoading ? 'Posting...' : 'Post to Story'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Story Viewer Modal */}
      {showStoryViewer && userStories.length > 0 && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50" style={{ marginTop: "80px", marginBottom: "40px" }}>
          {/* Close button */}
          <button 
            onClick={() => {
              setShowStoryViewer(false);
              setCurrentStoryIndex(0);
            }}
            className="absolute top-4 right-4 text-white bg-black/30 p-2 rounded-full hover:bg-black/50 z-10"
          >
            <X size={20} />
          </button>
          
          {/* Story navigation */}
          <button
            onClick={() => navigateStory('prev')}
            className={`absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full hover:bg-black/50 z-10 ${
              currentStoryIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={currentStoryIndex === 0}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => navigateStory('next')}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 p-2 rounded-full hover:bg-black/50 z-10"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Story content */}
          <div className="relative max-w-sm w-full h-full max-h-[85vh] flex items-center justify-center">
            {/* Progress bar */}
            <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
              {userStories.map((_, index) => (
                <div 
                  key={index} 
                  className="h-1 bg-white/30 rounded-full flex-1 overflow-hidden"
                >
                  {index === currentStoryIndex && (
                    <div 
                      className="h-full bg-white transition-all duration-50 ease-linear"
                      style={{ width: `${storyProgress}%` }}
                    ></div>
                  )}
                  {index < currentStoryIndex && (
                    <div className="h-full bg-white w-full"></div>
                  )}
                </div>
              ))}
            </div>
            
            {/* User info */}
            <div className="absolute top-8 left-4 flex items-center z-10">
              <img 
                src={user.photoProfile ? `${imageBaseUrl + user.photoProfile}` : "/images/default-profile.png"}
                alt="Profile"
                className="h-10 w-10 rounded-full border-2 border-white mr-3"
              />
              <div>
                <h3 className="font-medium text-white">{user.firstname} {user.lastName}</h3>
                <p className="text-xs text-white/80">
                  {new Date(userStories[currentStoryIndex]?.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            
            {/* Story media */}
            <div className="bg-black flex items-center">
              {loadedStoryMedia ? (
                userStories[currentStoryIndex]?.mediaType === 'VIDEO' ? (
                  <video 
                    src={loadedStoryMedia} 
                    autoPlay 
                    muted 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <img 
                    src={loadedStoryMedia} 
                    alt="Story"
                    className="max-h-full max-w-full object-contain"
                  />
                )
              ) : (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-8 h-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full"></div>
                </div>
              )}
            </div>
            
            {/* Caption */}
            {userStories[currentStoryIndex]?.caption && (
              <div className="absolute bottom-8 left-4 right-4 bg-black/30 backdrop-blur-sm p-3 rounded-lg z-10">
                <p className="text-white">{userStories[currentStoryIndex].caption}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;