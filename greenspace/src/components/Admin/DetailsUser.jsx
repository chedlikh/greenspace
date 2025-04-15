import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useUserDetails,
  useUpdateUser,
  useDeleteUser,
  useAssignRolesToUser,
} from "../../services/hooks";

const DetailsUser = () => {
  const { username } = useParams();
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const { data: user, isLoading, isError, error } = useUserDetails(username, token);

  const updateUserMutation = useUpdateUser(username, token);
  const deleteUserMutation = useDeleteUser(username, token);
  const assignRolesMutation = useAssignRolesToUser(username);

  const [editableUser, setEditableUser] = useState({
    firstname: "",
    lastName: "",
    email: "",
    gender: "",
    adress: "",
    country: "",
    phone: "",
    birthday: "",
    authority: "",
    valide: false,
    activeDate: null,
  });

  const [selectedRoles, setSelectedRoles] = useState([]);

  useEffect(() => {
    if (user) {
      setEditableUser({
        ...user,
        activeDate: user.activeDate || null,
        authority: user.authority || "",
      });
      if (user.roles) {
        setSelectedRoles(user.roles.map((role) => role.roleName));
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggleValide = () => {
    setEditableUser((prev) => ({
      ...prev,
      valide: !prev.valide,
      activeDate: !prev.valide ? new Date().toISOString().split("T")[0] : null,
    }));
  };

  const handleRoleChange = (e) => {
    const roleName = e.target.value;
    setSelectedRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((role) => role !== roleName)
        : [...prev, roleName]
    );
  };

  const handleUpdate = () => {
    const payload = {
      firstname: editableUser.firstname,
      lastName: editableUser.lastName,
      email: editableUser.email,
      gender: editableUser.gender,
      adress: editableUser.adress,
      country: editableUser.country,
      phone: editableUser.phone,
      birthday: editableUser.birthday,
      authority: editableUser.authority,
      valide: editableUser.valide,
    };

    updateUserMutation.mutate(payload, {
      onSuccess: () => {
        if (selectedRoles.length > 0) {
          assignRolesMutation.mutate(selectedRoles);
        }
      },
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${username}?`)) {
      deleteUserMutation.mutate(
        { username },
        {
          onSuccess: () => {
            navigate("/users");
          },
          onError: (error) => {
            console.error("Error during deletion:", error);
          },
        }
      );
    }
  };

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

  const validatePhone = (phone) => {
    return /^\d{8}$/.test(phone);
  };

  if (isLoading) {
    navigate("/users");
    return null;
  }

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
            <h2 className="text-2xl font-bold text-white">Account Details</h2>
          </div>

          {/* Profile Section */}
          <div className="p-6 bg-gray-50">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4">
                <img
                  src={user.photoProfile ? `http://192.168.0.187:8089/images/${user.photoProfile}` : "images/default-user.png"}
                  alt="user"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">
                {editableUser.firstname} {editableUser.lastName}
              </h3>
              <p className="text-gray-500">{editableUser.country || "N/A"}</p>
            </div>
          </div>

          {/* User Details Form */}
          <form className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstname"
                  value={editableUser.firstname || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={editableUser.lastName || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editableUser.email || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  name="gender"
                  value={editableUser.gender || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  name="adress"
                  value={editableUser.adress || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  name="country"
                  value={editableUser.country || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +216
                  </span>
                  <input
                    type="text"
                    name="phone"
                    value={editableUser.phone || ""}
                    onChange={handleChange}
                    pattern="\d{8}"
                    title="Phone number must be exactly 8 digits"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {!validatePhone(editableUser.phone) && (
                  <p className="text-red-500 text-xs mt-1">Phone must be 8 digits</p>
                )}
              </div>

              {/* Birthday */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Birthday</label>
                <input
                  type="date"
                  name="birthday"
                  value={editableUser.birthday || ""}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {editableUser.birthday && !validateBirthday(editableUser.birthday) && (
                  <p className="text-red-500 text-xs mt-1">You must be at least 18 years old</p>
                )}
              </div>
            </div>

            {/* Roles and Activation */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              {/* Assign Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Roles</label>
                <div className="space-y-2">
                  {["ADMIN", "USER"].map((role) => (
                    <label key={role} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={role}
                        checked={selectedRoles.includes(role)}
                        onChange={handleRoleChange}
                        className="form-checkbox h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* User Activation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activate User</label>
                <div className="flex items-center">
                  <label className="switch inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editableUser.valide}
                      onChange={handleToggleValide}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">
                      {editableUser.valide ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-8">
              <button
                type="button"
                onClick={handleUpdate}
                disabled={
                  !editableUser.firstname ||
                  !editableUser.lastName ||
                  !editableUser.email ||
                  !editableUser.gender ||
                  !editableUser.adress ||
                  !editableUser.country ||
                  !editableUser.phone ||
                  !editableUser.birthday ||
                  !validateBirthday(editableUser.birthday) ||
                  !validatePhone(editableUser.phone)
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Update
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    </div>
  );
};

export default DetailsUser;
