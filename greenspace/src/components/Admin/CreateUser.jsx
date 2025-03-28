import React, { useState, useEffect } from "react";
import { Upload, UserPlus, Save, X } from "lucide-react";

const CreateUser = () => {
  // Local state for user data
  const [userData, setUserData] = useState({
    email: "",
    username: "",
    password: "",
    firstname: "",
    lastName: "",
    gender: "",
    adress: "",
    country: "",
    phone: "",
    birthday: "",
  });

  // State for photo files
  const [profilePhoto, setProfilePhoto] = useState(null);

  // State for photo previews
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

  // Local state for selected role
  const [roleName, setRoleName] = useState("USER");

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle role selection
  const handleRoleChange = (e) => {
    setRoleName(e.target.value);
  };

  // Handle profile photo upload
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfilePhotoPreview(previewUrl);
    }
  };

  // Validate phone number (must be exactly 8 digits)
  const validatePhone = (phone) => {
    return /^\d{8}$/.test(phone);
  };

  // Validate birthday (must be at least 18 years old)
  const validateBirthday = (birthday) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Validate required fields
    if (
      !userData.email ||
      !userData.username ||
      !userData.password ||
      !userData.firstname ||
      !userData.lastName ||
      !userData.gender ||
      !userData.adress ||
      !userData.country ||
      !userData.phone ||
      !userData.birthday
    ) {
      alert("Please fill out all required fields.");
      return;
    }
  
    // Validate phone number
    if (!validatePhone(userData.phone)) {
      alert("Phone number must be exactly 8 digits.");
      return;
    }
  
    // Validate age (must be at least 18 years old)
    if (!validateBirthday(userData.birthday)) {
      alert("You must be at least 18 years old.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // Simulated user creation process
      console.log("Creating user:", { userData, roleName });
      
      // Simulated photo upload
      if (profilePhoto) {
        console.log("Uploading profile photo:", profilePhoto);
      }
  
      alert("User created successfully!");
      // Simulated navigation
      console.log("Navigating to users list");
    } catch (error) {
      console.error("Error during user creation:", error);
      alert("Error creating user: " + (error.message || "Unknown error"));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
    };
  }, [profilePhotoPreview]);

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <div className="middle-sidebar-bottom">
      
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 flex items-center">
          <UserPlus className="w-8 h-8 mr-3" />
          <h2 className="text-2xl font-bold">Create User</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstname"
                value={userData.firstname}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={userData.lastName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={userData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={userData.gender}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={roleName}
                onChange={handleRoleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="adress"
                value={userData.adress}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={userData.country}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +216
                </span>
                <input
                  type="text"
                  name="phone"
                  value={userData.phone}
                  onChange={handleChange}
                  pattern="\d{8}"
                  title="Phone number must be exactly 8 digits"
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birthday
              </label>
              <input
                type="date"
                name="birthday"
                value={userData.birthday}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Profile Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoChange}
                className="hidden"
                id="profile-photo-upload"
              />
              <label 
                htmlFor="profile-photo-upload" 
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
              >
                <Upload className="mr-2 w-5 h-5" />
                Upload Photo
              </label>
              {profilePhotoPreview && (
                <img
                  src={profilePhotoPreview}
                  alt="Profile preview"
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-center space-x-4 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Save className="mr-2 w-5 h-5" />
              {isSubmitting ? "Creating..." : "Create User"}
            </button>
            <button
              type="button"
              onClick={() => console.log("Cancel")}
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              <X className="mr-2 w-5 h-5" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
    </div>
    
  );
};

export default CreateUser;