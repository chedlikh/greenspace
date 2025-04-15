import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { fetchUserDetails, uploadProfilePhoto, uploadCoverPhoto } from '../../services/hooks'; 
import { Link } from 'react-router-dom';

// Import icons
import { Mail, MapPin, Briefcase, User, Users, Calendar, Phone, Globe, Home, Camera, Edit } from 'feather-icons-react';

const ProfilePage = () => {
  const token = useSelector((state) => state.auth.token);
  const queryClient = useQueryClient();
  
  // File input refs
  const profilePhotoInputRef = useRef(null);
  const coverPhotoInputRef = useRef(null);

  const userQuery = useQuery({
    queryKey: ['userDetails', token],
    queryFn: () => fetchUserDetails(token),
    enabled: !!token,
  });

  // Mutations for photo uploads
  const uploadProfileMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("file", file);
      return uploadProfilePhoto(user.username, file, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userDetails', token]);
    }
  });

  const uploadCoverMutation = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("filecover", file);
      return uploadCoverPhoto(user.username, file, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userDetails', token]);
    }
  });

  const { data: user, isLoading, isError, error } = userQuery;

  // Handle file uploads
  const handleProfilePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadProfileMutation.mutate(e.target.files[0]);
    }
  };

  const handleCoverPhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadCoverMutation.mutate(e.target.files[0]);
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
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md">
          <h3 className="font-semibold text-lg mb-2">Error Loading Profile</h3>
          <p>{error.message}</p>
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

  // Base URL for images
  const imageBaseUrl = 'http://192.168.0.187:8089/images/';

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
            
            {/* Edit Cover Photo Button */}
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
          </div>
          

{/* Profile Info Container */}
<div className="relative px-6">
  {/* Profile Photo - In its own centered div */}
  <div className="absolute -top-16 w-full flex justify-center">
  <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md relative mr-[54px]">      <img 
        src={user.photoProfile ? `${imageBaseUrl + user.photoProfile}` : "/images/default-profile.png"}
        alt={`${user.firstname} ${user.lastName}`}
        className="h-full w-full object-cover"
        onError={(e) => (e.target.src = '/images/default-profile.png')}
      />
      
      {/* Edit Profile Photo Button */}
      <button 
        onClick={() => profilePhotoInputRef.current.click()}
        className="absolute bottom-0 right-0 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-md"
      >
        <Edit size={16} className="text-gray-700" />
      </button>
      <input 
        type="file" 
        ref={profilePhotoInputRef}
        onChange={handleProfilePhotoChange}
        className="hidden" 
        accept="image/*"
      />
    </div>
  </div>
  
  {/* Stats (Left) and Action Buttons (Right) at photo level */}
  <div className="flex justify-between mt-2">
    {/* Left side - Stats - positioned to align with photo */}
    <div className="flex space-x-4 mt-8">
      <div className="text-center">
        <span className="block font-bold text-gray-900">456</span>
        <span className="text-xs text-gray-500">Posts</span>
      </div>
      <div className="text-center">
        <span className="block font-bold text-gray-900">2.1k</span>
        <span className="text-xs text-gray-500">Followers</span>
      </div>
      <div className="text-center">
        <span className="block font-bold text-gray-900">32k</span>
        <span className="text-xs text-gray-500">Following</span>
      </div>
    </div>
    
    {/* Right space for profile photo */}
    <div className="w-32"></div>
    
    {/* Right side - Action Buttons - positioned to align with photo */}
    <div className="flex space-x-2 mt-8">
      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
        <Mail size={16} className="inline mr-1" /> Message
      </button>
      <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center">
        {user.isConnect ? 
          <span className="flex items-center"><span className="h-2 w-2 bg-green-500 rounded-full mr-2"></span>Online</span> : 
          <span className="flex items-center"><span className="h-2 w-2 bg-gray-400 rounded-full mr-2"></span>Offline</span>
        }
      </button>
    </div>
  </div>
  
  {/* User Info Container - Below all elements */}
  <div className="pt-16 mt-4" >
    {/* User Info - WITH SPECIAL MARGIN TOP */}
    <div className="text-center" style={{ marginTop: "-100px" }}>
      <h1 className="text-2xl font-bold text-gray-900">{user.firstname} {user.lastName}</h1>
      <p className="text-sm text-gray-600">@{user.username}</p>
      <p className="mt-1 text-sm text-gray-600 flex items-center justify-center">
        <MapPin size={14} className="mr-1" />
        {user.adress}, {user.country}
      </p>
    </div>
  </div>
</div>
          {/* Navigation Tabs */}
          <div className="px-6 border-t border-gray-100 mt-4">
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
              <Link to="#videos" className="px-4 py-3 font-medium text-gray-500 hover:text-gray-900 whitespace-nowrap">
                Videos
              </Link>
            </nav>
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
                <div className="rounded-lg overflow-hidden aspect-square">
                  <img src="/images/e-2.jpg" alt="Gallery" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-lg overflow-hidden aspect-square">
                  <img src="/images/e-3.jpg" alt="Gallery" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-lg overflow-hidden aspect-square">
                  <img src="/images/e-4.jpg" alt="Gallery" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-lg overflow-hidden aspect-square">
                  <img src="/images/e-5.jpg" alt="Gallery" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-lg overflow-hidden aspect-square">
                  <img src="/images/e-6.jpg" alt="Gallery" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-lg overflow-hidden aspect-square">
                  <img src="/images/e-7.jpg" alt="Gallery" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Create Post */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex items-center mb-4">
                <img 
                  src={user.photoProfile ? `${imageBaseUrl + user.photoProfile}` : "/images/default-profile.png"}
                  alt="Profile"
                  className="h-10 w-10 rounded-full mr-3"
                />
                <div className="flex-1">
                  <input 
                    type="text" 
                    placeholder="What's on your mind?" 
                    className="w-full px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex border-t pt-3">
                <button className="flex-1 flex items-center justify-center py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  Live Video
                </button>
                <button className="flex-1 flex items-center justify-center py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Photo/Video
                </button>
                <button className="flex-1 flex items-center justify-center py-1 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Feeling/Activity
                </button>
              </div>
            </div>
            
            {/* Sample Post */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex items-center mb-4">
                <img 
                  src={user.photoProfile ? `${imageBaseUrl + user.photoProfile}` : "/images/default-profile.png"}
                  alt="Profile"
                  className="h-10 w-10 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{user.firstname} {user.lastName}</h3>
                  <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-gray-700">
                  Welcome to my profile! I'm a {user.poste?.titre || 'professional'} at {user.poste?.gservices?.[0]?.name || 'my organization'}.
                </p>
              </div>
              {/* Sample Image */}
              <div className="rounded-lg overflow-hidden mb-4">
                <img src="/images/post-1.jpg" alt="Post" className="w-full h-auto" />
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="bg-blue-100 p-1 rounded-full mr-1">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                    </svg>
                  </span>
                  <span className="text-sm text-gray-500">24 Likes</span>
                </div>
                <div className="text-sm text-gray-500">8 Comments</div>
              </div>
              <div className="border-t border-b py-2 mb-3">
                <div className="flex justify-around">
                  <button className="flex items-center text-gray-600 hover:text-blue-600">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                    </svg>
                    Like
                  </button>
                  <button className="flex items-center text-gray-600 hover:text-blue-600">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                    </svg>
                    Comment
                  </button>
                  <button className="flex items-center text-gray-600 hover:text-blue-600">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                    </svg>
                    Share
                  </button>
                </div>
              </div>
              {/* Comment Input */}
              <div className="flex">
                <img 
                  src={user.photoProfile ? `${imageBaseUrl + user.photoProfile}` : "/images/default-profile.png"}
                  alt="Profile"
                  className="h-8 w-8 rounded-full mr-2"
                />
                <input 
                  type="text" 
                  placeholder="Write a comment..." 
                  className="flex-1 bg-gray-100 rounded-full px-4 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Another Post */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex items-center mb-4">
                <img src="/images/user-3.png" alt="Profile" className="h-10 w-10 rounded-full mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Jane Cooper</h3>
                  <p className="text-xs text-gray-500">Yesterday at 2:30 PM</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-gray-700">
                  Just had a great meeting with {user.firstname}! Looking forward to our collaboration on the upcoming project.
                </p>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <span className="bg-blue-100 p-1 rounded-full mr-1">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
                    </svg>
                  </span>
                  <span className="text-sm text-gray-500">12 Likes</span>
                </div>
                <div className="text-sm text-gray-500">3 Comments</div>
              </div>
              <div className="border-t border-b py-2 mb-3">
                <div className="flex justify-around">
                  <button className="flex items-center text-gray-600 hover:text-blue-600">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                    </svg>
                    Like
                  </button>
                  <button className="flex items-center text-gray-600 hover:text-blue-600">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                    </svg>
                    Comment
                  </button>
                  <button className="flex items-center text-gray-600 hover:text-blue-600">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
                    </svg>
                    Share
                  </button>
                </div>
              </div>
              {/* Comment Input */}
              <div className="flex">
                <img 
                  src={user.photoProfile ? `${imageBaseUrl + user.photoProfile}` : "/images/default-profile.png"}
                  alt="Profile"
                  className="h-8 w-8 rounded-full mr-2"
                />
                <input 
                  type="text" 
                  placeholder="Write a comment..." 
                  className="flex-1 bg-gray-100 rounded-full px-4 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
