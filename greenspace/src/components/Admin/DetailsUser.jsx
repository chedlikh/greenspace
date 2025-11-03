import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useUserDetails,
  useUpdateUser,
  useDeleteUser,
  useAssignRolesToUser,
} from "../../services/hooks";
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Camera, CheckCircle, Trash2, X } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8089";

// Theme color mapping based on Navbar's theme settings
const themeColors = {
  red: { primary: '#ff3b30', secondary: '#ff2d55' },
  green: { primary: '#4cd964', secondary: '#34c759' },
  blue: { primary: '#132977', secondary: '#007aff' },
  pink: { primary: '#ff2d55', secondary: '#ff69b4' },
  yellow: { primary: '#ffcc00', secondary: '#ff9500' },
  orange: { primary: '#ff9500', secondary: '#ff7f50' },
  gray: { primary: '#8e8e93', secondary: '#a9a9a9' },
  brown: { primary: '#D2691E', secondary: '#8B4513' },
  darkgreen: { primary: '#228B22', secondary: '#006400' },
  deeppink: { primary: '#FFC0CB', secondary: '#FF69B4' },
  cadetblue: { primary: '#5f9ea0', secondary: '#4682b4' },
  darkorchid: { primary: '#9932cc', secondary: '#9400d3' },
};

// InputField component
const InputField = React.memo(({ label, name, type = "text", icon: Icon, prepend, pattern, title, options, value, onChange, required = true }) => {
  const isSelect = type === "select";
  const isPhone = name === "phone";
  const isValidPhone = isPhone && value ? /^\d{8}$/.test(value) : true;
  const { theme } = useSelector((state) => state.theme);
  const themeColor = themeColors[theme]?.primary || '#4cd964'; // Default to green if theme not found

  return (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-[color:var(--theme-primary)]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-[color:var(--theme-primary)] transition-colors" />
          </div>
        )}
        
        {isSelect ? (
          <select
            name={name}
            value={value ?? ""}
            onChange={onChange}
            required={required}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all duration-200 bg-white hover:border-gray-400 text-gray-900 shadow-sm`}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : prepend ? (
          <div className="flex rounded-lg shadow-sm">
            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 font-medium">
              {prepend}
            </span>
            <input
              type={name === "phone" ? "tel" : type}
              name={name}
              value={value}
              onChange={onChange}
              pattern={pattern}
              title={title}
              required={required}
              className={`flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all duration-200 hover:border-gray-400 ${isPhone && value && !isValidPhone ? 'border-red-500' : ''}`}
            />
          </div>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all duration-200 hover:border-gray-400 shadow-sm ${isPhone && value && !isValidPhone ? 'border-red-500' : ''}`}
          />
        )}
        {isPhone && value && !isValidPhone && (
          <p className="mt-1 text-sm text-red-500">Le numéro de téléphone doit contenir exactement 8 chiffres.</p>
        )}
      </div>
    </div>
  );
});

const DetailsUser = () => {
  const { username } = useParams();
  const token = useSelector((state) => state.auth.token);
  const { theme } = useSelector((state) => state.theme);
  const navigate = useNavigate();

  const { 
    data: user, 
    isLoading, 
    isError 
  } = useUserDetails(username, token);

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
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

  useEffect(() => {
    if (isLoading) return;
    if (isError) navigate("/users");
  }, [isLoading, isError, navigate]);

  useEffect(() => {
    if (user) {
      setEditableUser({
        firstname: user.firstname || "",
        lastName: user.lastName || "",
        email: user.email || "",
        gender: user.gender || "",
        adress: user.adress || "",
        country: user.country || "",
        phone: user.phone || "",
        birthday: user.birthday || "",
        authority: user.authority || "",
        valide: user.valide || false,
        activeDate: user.activeDate || null,
      });
      if (user.roles) {
        setSelectedRoles(user.roles.map((role) => role.roleName));
      }
      if (user.photoProfile) {
        setProfilePhotoPreview(`${API_BASE_URL}/images/${user.photoProfile}`);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableUser((prev) => ({
      ...prev,
      [name]: name === "phone" ? value.replace(/[^0-9]/g, "").slice(0, 8) : value,
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

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const previewUrl = URL.createObjectURL(file);
      setProfilePhotoPreview(previewUrl);
    }
  };

  const handleUpdate = async () => {
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

    try {
      await updateUserMutation.mutateAsync(payload);
      if (selectedRoles.length > 0) {
        await assignRolesMutation.mutateAsync(selectedRoles);
      }
      alert("Utilisateur mis à jour avec succès !");
    } catch (error) {
      alert("Erreur lors de la mise à jour de l'utilisateur");
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Voulez-vous vraiment supprimer ${username} ?`)) {
      deleteUserMutation.mutate(
        { username },
        {
          onSuccess: () => {
            navigate("/users");
          },
          onError: (error) => {
            alert("Erreur lors de la suppression de l'utilisateur");
          },
        }
      );
    }
  };

  const validateBirthday = (birthday) => {
    if (!birthday) return false;
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
    return phone && /^\d{8}$/.test(phone);
  };

  // Get theme colors
  const primaryColor = themeColors[theme]?.primary || '#4cd964';
  const secondaryColor = themeColors[theme]?.secondary || '#34c759';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (isError) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8"style={{ marginTop: '80px', marginLeft: '250px' }}>
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
          }
        `}
      </style>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200" >
          {/* Header */}
          <div className="bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] px-8 py-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <User size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Modifier le profil utilisateur</h1>
                <p className="text-white/80 mt-1">Mettez à jour les informations de l'utilisateur</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form noValidate className="p-8 space-y-10">
            {/* Profile Photo Section */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[color:var(--theme-primary)]/20 to-[color:var(--theme-secondary)]/20 border-4 border-white shadow-lg overflow-hidden mx-auto">
                  {profilePhotoPreview ? (
                    <img
                      src={profilePhotoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={48} className="text-[color:var(--theme-primary)]" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  id="photo-upload"
                  className="hidden"
                />
                <label
                  htmlFor="photo-upload"
                  className="absolute bottom-0 right-0 p-2 bg-[color:var(--theme-primary)] text-white rounded-full shadow-lg cursor-pointer hover:bg-[color:var(--theme-secondary)] transition-colors"
                >
                  <Camera size={16} />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-3">Cliquez sur l'icône pour modifier la photo de profil</p>
            </div>

            {/* User Information */}
            <div className="space-y-6">
              <div className="border-l-4 border-[color:var(--theme-primary)] pl-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Informations de l'utilisateur</h3>
                <p className="text-gray-600">Détails de base de l'utilisateur</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Prénom" name="firstname" icon={User} value={editableUser.firstname} onChange={handleChange} />
                <InputField label="Nom de famille" name="lastName" icon={User} value={editableUser.lastName} onChange={handleChange} />
                <InputField label="Email" name="email" type="email" icon={Mail} value={editableUser.email} onChange={handleChange} />
                <InputField 
                  label="Genre" 
                  name="gender" 
                  type="select" 
                  icon={User}
                  value={editableUser.gender}
                  onChange={handleChange}
                  options={[
                    { label: "Sélectionner le genre", value: "" },
                    { label: "Homme", value: "Male" },
                    { label: "Femme", value: "Female" },
                  ]}
                />
                <InputField label="Adresse" name="adress" icon={MapPin} value={editableUser.adress} onChange={handleChange} />
                <InputField label="Pays" name="country" icon={MapPin} value={editableUser.country} onChange={handleChange} />
                <InputField 
                  label="Téléphone" 
                  name="phone" 
                  icon={Phone}
                  prepend="+216"
                  pattern="[0-9]{8}"
                  title="Le numéro de téléphone doit contenir exactement 8 chiffres"
                  value={editableUser.phone}
                  onChange={handleChange}
                />
                <InputField 
                  label="Date de naissance" 
                  name="birthday" 
                  type="date" 
                  icon={Calendar} 
                  value={editableUser.birthday} 
                  onChange={handleChange}
                />
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-[color:var(--theme-primary)]">
                    Rôles
                  </label>
                  <div className="space-y-2">
                    {["ADMIN", "USER"].map((role) => (
                      <div key={role} className="flex items-center">
                        <input
                          id={`role-${role}`}
                          type="checkbox"
                          value={role}
                          checked={selectedRoles.includes(role)}
                          onChange={handleRoleChange}
                          className="h-4 w-4 text-[color:var(--theme-primary)] focus:ring-[color:var(--theme-primary)] border-gray-300 rounded"
                        />
                        <label htmlFor={`role-${role}`} className="ml-2 block text-sm text-gray-900">
                          {role}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-[color:var(--theme-primary)]">
                    Activer l'utilisateur
                  </label>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editableUser.valide}
                        onChange={handleToggleValide}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-checked:bg-[color:var(--theme-primary)] rounded-full peer transition-colors"></div>
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {editableUser.valide ? "Actif" : "Inactif"}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/users")}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300 hover:border-gray-400 flex items-center justify-center space-x-2"
              >
                <X size={18} />
                <span>Annuler</span>
              </button>
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
                className="px-8 py-3 bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white rounded-lg hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <CheckCircle size={18} />
                <span>Mettre à jour</span>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <Trash2 size={18} />
                <span>Supprimer</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default DetailsUser;