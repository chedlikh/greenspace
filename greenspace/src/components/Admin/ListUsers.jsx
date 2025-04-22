import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUsers } from "../../services/hooks";
import { Search, UserPlus, Users } from "lucide-react";

const ListUsers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Get user details and all users
  const { userQuery, usersQuery } = useUsers();
  const { data: currentUser, isLoading: isUserLoading, error: userError } = userQuery;
  const { data: users = [], isLoading, error } = usersQuery;

  // Filter users based on search query
  const filteredUsers = users.filter((user) =>
    `${user.firstname} ${user.lastName} ${user.username} ${user.email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCardClick = (username) => {
    navigate(`/u/${username}`);
  };

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <div className="min-h-screen bg-gray-100 p-6">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header and Create User Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Users List</h1>
          </div>
          <button
            onClick={() => navigate("/create-user")}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create New User</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Loading & Error Handling */}
        {(isLoading || isUserLoading) && (
          <div className="text-center py-6">
            <p className="text-gray-600">Loading users...</p>
          </div>
        )}
        {(error || userError) && (
          <div className="text-center py-6">
            <p className="text-red-600">{error?.message || userError?.message}</p>
          </div>
        )}

        {/* Users Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div 
                key={user.id} 
                onClick={() => handleCardClick(user.username)}
                className="bg-white shadow-lg rounded-xl overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl cursor-pointer"
              >
                <div className="p-6 text-center">
                  {/* Profile Picture */}
                  <div className="relative inline-block mb-4">
                    <img
                      src={user.photoProfile ? `http://greenspace.ddns.net:8089/images/${user.photoProfile}` : "images/default-user.png"}
                      alt="user"
                      className="w-24 h-24 rounded-full border-4 border-gray-200 object-cover"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                        user.isConnect ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></span>
                  </div>

                  {/* User Info */}
                  <h5 className="text-lg font-bold text-gray-800 mb-1">
                    {user.firstname} {user.lastName}
                  </h5>
                  <p className="text-sm text-gray-500 mb-1">@{user.username}</p>
                  <p className="text-sm text-gray-500 mb-2">{user.email}</p>
                  
                  <div className="text-xs text-gray-600 mb-2">
                    {user.authorities.map((auth) => auth.authority).join(", ")}
                  </div>

                  {/* Join Date */}
                  <div className="text-xs text-gray-500 mb-2">
                    Joined: {new Date(user.createDate).toLocaleDateString()}
                  </div>

                  {/* Current User Highlight */}
                  {currentUser?.username === user.username && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      You
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            !isLoading && (
              <div className="col-span-full text-center py-6">
                <p className="text-gray-600">No users found.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
    </div>
    </div>
  );
};

export default ListUsers;
