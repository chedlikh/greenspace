import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Upload,
  UserPlus,
  Save,
  X,
  Loader2,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  Camera,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  useCreateUser,
  useUploadProfilePhoto,
  useSocietes,
  useSocietesSites,
  useSiteServices,
  usePosteByServiceId,
  useAssignUsersToPoste,
} from "../../services/hooks";

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
const InputField = React.memo(({ label, name, type = "text", icon: Icon, prepend, pattern, title, options, value, onChange, optional = false, showPassword, setShowPassword }) => {
  const isSelect = type === "select";
  const isPassword = type === "password";
  const isPhone = name === "phone";
  const isValidPhone = isPhone && value ? /^\d{8}$/.test(value) : true;
  const { theme } = useSelector((state) => state.theme);
  const themeColor = themeColors[theme]?.primary || '#4cd964'; // Default to green if theme not found

  return (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-[color:var(--theme-primary)]">
        {label} {!optional && <span className="text-red-500">*</span>}
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
            required={!optional}
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
              required={!optional}
              className={`flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all duration-200 hover:border-gray-400 ${isPhone && value && !isValidPhone ? 'border-red-500' : ''}`}
            />
          </div>
        ) : (
          <div className="relative">
            <input
              type={isPassword && !showPassword ? "password" : isPassword ? "text" : type}
              name={name}
              value={value}
              onChange={onChange}
              required={!optional}
              className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${isPassword ? 'pr-10' : 'pr-4'} py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all duration-200 hover:border-gray-400 shadow-sm ${isPhone && value && !isValidPhone ? 'border-red-500' : ''}`}
            />
            {isPassword && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPassword(!showPassword);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            )}
          </div>
        )}
        {isPhone && value && !isValidPhone && (
          <p className="mt-1 text-sm text-red-500">Le numéro de téléphone doit contenir exactement 8 chiffres.</p>
        )}
      </div>
    </div>
  );
});

const CreateUser = () => {
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.theme);

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

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [roleName, setRoleName] = useState("USER");
  const [showPassword, setShowPassword] = useState(false);

  // Cascading dropdowns
  const [selectedSocieteId, setSelectedSocieteId] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedPosteId, setSelectedPosteId] = useState("");

  // Mutations
  const createUserMutation = useCreateUser();
  const uploadPhotoMutation = useUploadProfilePhoto();
  const assignUserToPosteMutation = useAssignUsersToPoste(selectedPosteId);

  // Fetch data
  const { data: societes, isLoading: societeLoading } = useSocietes();
  const { data: sites, isLoading: sitesLoading } = useSocietesSites(selectedSocieteId);
  const { data: services, isLoading: servicesLoading } = useSiteServices(selectedSiteId);
  const { data: postes, isLoading: postesLoading } = usePosteByServiceId(selectedServiceId);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const sanitizedValue = value.replace(/[^0-9]/g, "").slice(0, 8);
      setUserData((prev) => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setUserData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  // Role change
  const handleRoleChange = useCallback((e) => {
    setRoleName(e.target.value);
  }, []);

  // Profile photo handler
  const handleProfilePhotoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const previewUrl = URL.createObjectURL(file);
      setProfilePhotoPreview(previewUrl);
    }
  }, []);

  // Dropdown handlers
  const handleSocieteChange = useCallback((e) => {
    setSelectedSocieteId(e.target.value);
    setSelectedSiteId("");
    setSelectedServiceId("");
    setSelectedPosteId("");
  }, []);

  const handleSiteChange = useCallback((e) => {
    setSelectedSiteId(e.target.value);
    setSelectedServiceId("");
    setSelectedPosteId("");
  }, []);

  const handleServiceChange = useCallback((e) => {
    setSelectedServiceId(e.target.value);
    setSelectedPosteId("");
  }, []);

  const handlePosteChange = useCallback((e) => {
    setSelectedPosteId(e.target.value);
  }, []);

  // Validation functions
  const validatePhone = (phone) => /^\d{8}$/.test(phone);
  const validateBirthday = (birthday) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  };

  const resetForm = () => {
    setUserData({
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
    setProfilePhoto(null);
    setProfilePhotoPreview(null);
    setRoleName("USER");
    setSelectedSocieteId("");
    setSelectedSiteId("");
    setSelectedServiceId("");
    setSelectedPosteId("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      { name: "email", label: "Email" },
      { name: "username", label: "Nom d'utilisateur" },
      { name: "password", label: "Mot de passe" },
      { name: "firstname", label: "Prénom" },
      { name: "lastName", label: "Nom de famille" },
      { name: "gender", label: "Genre" },
      { name: "adress", label: "Adresse" },
      { name: "country", label: "Pays" },
      { name: "phone", label: "Téléphone" },
      { name: "birthday", label: "Date de naissance" },
    ];

    const missingFields = requiredFields.filter(({ name }) => !userData[name]);
    if (missingFields.length > 0) {
      alert(`Veuillez remplir les champs suivants : ${missingFields.map(f => f.label).join(", ")}`);
      return;
    }

    if (!validatePhone(userData.phone)) {
      alert("Le numéro de téléphone doit contenir exactement 8 chiffres.");
      return;
    }

    if (!validateBirthday(userData.birthday)) {
      alert("Vous devez avoir au moins 18 ans.");
      return;
    }

    try {
      await createUserMutation.mutateAsync({ userData, roleName });
      if (profilePhoto) {
        await uploadPhotoMutation.mutateAsync({ username: userData.username, file: profilePhoto });
      }
      if (selectedPosteId) {
        await assignUserToPosteMutation.mutateAsync([userData.username]);
      }

      alert("Utilisateur créé avec succès !");
      resetForm();
      navigate("/users");
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur :", error);
      alert(error.message || "Erreur lors de la création de l'utilisateur");
    }
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview);
    };
  }, [profilePhotoPreview]);

  // Get theme colors
  const primaryColor = themeColors[theme]?.primary || '#4cd964';
  const secondaryColor = themeColors[theme]?.secondary || '#34c759';

  const LoadingSpinner = ({ size = 18 }) => (
    <Loader2 size={size} className="animate-spin" />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8" style={{ marginTop: '80px', marginLeft: '250px' }}>
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
          }
        `}
      </style>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] px-8 py-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <UserPlus size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Créer un nouvel utilisateur</h1>
                <p className="text-white/80 mt-1">Remplissez les informations ci-dessous pour créer un compte utilisateur</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="p-8 space-y-10">
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
              <p className="text-sm text-gray-500 mt-3">Cliquez sur l'icône pour ajouter une photo de profil</p>
            </div>

            {/* Personal Information */}
            <div className="space-y-6">
              <div className="border-l-4 border-[color:var(--theme-primary)] pl-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Informations personnelles</h3>
                <p className="text-gray-600">Détails de base de l'utilisateur</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Prénom" name="firstname" icon={User} value={userData.firstname} onChange={handleChange} />
                <InputField label="Nom de famille" name="lastName" icon={User} value={userData.lastName} onChange={handleChange} />
                <InputField label="Email" name="email" type="email" icon={Mail} value={userData.email} onChange={handleChange} />
                <InputField label="Nom d'utilisateur" name="username" icon={User} value={userData.username} onChange={handleChange} />
                <InputField 
                  label="Mot de passe" 
                  name="password" 
                  type="password" 
                  icon={Lock} 
                  value={userData.password} 
                  onChange={handleChange} 
                  showPassword={showPassword} 
                  setShowPassword={setShowPassword}
                />
                <InputField 
                  label="Genre" 
                  name="gender" 
                  type="select" 
                  icon={User}
                  value={userData.gender}
                  onChange={handleChange}
                  options={[
                    { label: "Sélectionner le genre", value: "" },
                    { label: "Homme", value: "Male" },
                    { label: "Femme", value: "Female" },
                  ]}
                />
                <InputField label="Adresse" name="adress" icon={MapPin} value={userData.adress} onChange={handleChange} />
                <InputField label="Pays" name="country" icon={MapPin} value={userData.country} onChange={handleChange} />
                <InputField 
                  label="Téléphone" 
                  name="phone" 
                  icon={Phone}
                  prepend="+216"
                  pattern="[0-9]{8}"
                  title="Le numéro de téléphone doit contenir exactement 8 chiffres"
                  value={userData.phone}
                  onChange={handleChange}
                />
                <InputField label="Date de naissance" name="birthday" type="date" icon={Calendar} value={userData.birthday} onChange={handleChange} />
                <InputField 
                  label="Rôle" 
                  name="role" 
                  type="select" 
                  icon={Briefcase}
                  value={roleName}
                  onChange={handleRoleChange}
                  options={[
                    { label: "UTILISATEUR", value: "USER" },
                    { label: "ADMINISTRATEUR", value: "ADMIN" },
                  ]}
                />
              </div>
            </div>

            {/* Organization Assignment Section */}
            <div className="space-y-6">
              <div className="border-l-4 border-[color:var(--theme-secondary)] pl-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Affectation organisationnelle</h3>
                <p className="text-gray-600">Assignez l'utilisateur à une structure organisationnelle</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Société */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-[color:var(--theme-secondary)]">
                    Société
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[color:var(--theme-secondary)] transition-colors" />
                    <select
                      value={selectedSocieteId}
                      onChange={handleSocieteChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--theme-secondary)] focus:border-[color:var(--theme-secondary)] transition-all duration-200 bg-white hover:border-gray-400 shadow-sm"
                    >
                      <option value="">Sélectionner une société</option>
                      {societes?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    {societeLoading && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <LoadingSpinner size={16} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Site */}
                {selectedSocieteId && (
                  <div className="group animate-fadeIn">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-[color:var(--theme-secondary)]">
                      Site
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[color:var(--theme-secondary)] transition-colors" />
                      <select
                        value={selectedSiteId}
                        onChange={handleSiteChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--theme-secondary)] focus:border-[color:var(--theme-secondary)] transition-all duration-200 bg-white hover:border-gray-400 shadow-sm"
                      >
                        <option value="">Sélectionner un site</option>
                        {sites?.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nom} ({s.type})
                          </option>
                        ))}
                      </select>
                      {sitesLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <LoadingSpinner size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Service */}
                {selectedSiteId && (
                  <div className="group animate-fadeIn">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-[color:var(--theme-secondary)]">
                      Service
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[color:var(--theme-secondary)] transition-colors" />
                      <select
                        value={selectedServiceId}
                        onChange={handleServiceChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--theme-secondary)] focus:border-[color:var(--theme-secondary)] transition-all duration-200 bg-white hover:border-gray-400 shadow-sm"
                      >
                        <option value="">Sélectionner un service</option>
                        {services?.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      {servicesLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <LoadingSpinner size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Poste */}
                {selectedServiceId && (
                  <div className="group animate-fadeIn">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-[color:var(--theme-secondary)]">
                      Poste
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[color:var(--theme-secondary)] transition-colors" />
                      <select
                        value={selectedPosteId}
                        onChange={handlePosteChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[color:var(--theme-secondary)] focus:border-[color:var(--theme-secondary)] transition-all duration-200 bg-white hover:border-gray-400 shadow-sm"
                      >
                        <option value="">Sélectionner un poste</option>
                        {postes?.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.titre}
                          </option>
                        ))}
                      </select>
                      {postesLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <LoadingSpinner size={16} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
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
                type="submit"
                disabled={
                  createUserMutation.isLoading ||
                  uploadPhotoMutation.isLoading ||
                  (selectedPosteId && assignUserToPosteMutation.isLoading)
                }
                className="px-8 py-3 bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white rounded-lg hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {(createUserMutation.isLoading ||
                  uploadPhotoMutation.isLoading ||
                  (selectedPosteId && assignUserToPosteMutation.isLoading)) && (
                  <LoadingSpinner />
                )}
                <Save size={18} />
                <span>Créer l'utilisateur</span>
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

export default CreateUser;