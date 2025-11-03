import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateFormation,
  useCreateCabinet,
  useCreateSession,
  useCreateProgramme,
  useCreateFormateur,
  useAssignCabinetToFormation,
  useAssignSessionToCabinet,
  useAssignProgrammeToSession,
  useAssignFormateurToSession,
} from '../../../services/formation';
import { Briefcase, Save, X, Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react';

// Theme color mapping
const themeColors = {
  red: { primary: '#ff3b30', secondary: '#ff2d55', bgLight: '#fef2f2', bgDark: '#3f0a0a', textLight: '#1f2937', textDark: '#f3f4f6', border: '#344054' },
  green: { primary: '#4cd964', secondary: '#34c759', bgLight: '#f0fdf4', bgDark: '#052e16', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
  blue: { primary: '#132977', secondary: '#007aff', bgLight: '#eff6ff', bgDark: '#1e3a8a', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
  pink: { primary: '#ff2d55', secondary: '#ff69b4', bgLight: '#fff1f2', bgDark: '#3f0713', textLight: '#1f2937', textDark: '#f3f4f6', border: '#344054' },
  yellow: { primary: '#ffcc00', secondary: '#ff9500', bgLight: '#fefce8', bgDark: '#3f2c00', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
  orange: { primary: '#ff9500', secondary: '#ff7f50', bgLight: '#fff7eb', bgDark: '#3f2d0f', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
  gray: { primary: '#8e8e93', secondary: '#a9a9a9', bgLight: '#f9fafb', bgDark: '#374151', textLight: '#1f2937', textDark: '#d1d5db', border: '#344054' },
  brown: { primary: '#D2691E', secondary: '#8B4513', bgLight: '#fef7e7', bgDark: '#2f1c0a', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
  darkgreen: { primary: '#228B22', secondary: '#006400', bgLight: '#f0fdf4', bgDark: '#092e16', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
  deeppink: { primary: '#FFC0CB', secondary: '#FF69B4', bgLight: '#fff1f2', bgDark: '#3f0f1e', textLight: '#1f2937', textDark: '#f3f4f6', border: '#344054' },
  cadetblue: { primary: '#5f9ea0', secondary: '#4682b4', bgLight: '#f0f9ff', bgDark: '#1c2f3a', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
  darkorchid: { primary: '#9932cc', secondary: '#9400d3', bgLight: '#f5f3ff', bgDark: '#2e1a3f', textLight: '#1f2937', textDark: '#e5e7eb', border: '#344054' },
};

// InputField component
const InputField = React.memo(({ label, name, type = 'text', icon: Icon, value, onChange, optional = false, error }) => {
  const { theme } = useSelector((state) => state.theme);
  const themeColor = themeColors[theme]?.primary || '#4cd964';

  return (
    <div className="group">
      <label
        className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-[color:var(--theme-primary)] ${
          error ? 'text-red-500' : ''
        }`}
      >
        {label} {!optional && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400 group-focus-within:text-[color:var(--theme-primary)]'} transition-colors`}
            />
          </div>
        )}
        {type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            required={!optional}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all duration-200 hover:border-gray-400 shadow-sm ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${error ? 'focus:ring-red-500' : ''}`}
            rows="4"
          ></textarea>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={!optional}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all duration-200 hover:border-gray-400 shadow-sm ${
              error ? 'border-red-500' : 'border-gray-300'
            } ${error ? 'focus:ring-red-500' : ''}`}
          />
        )}
        {error && <p className="mt-1 text-sm text-red-500 animate-fadeIn">{error}</p>}
      </div>
    </div>
  );
});

const FormationCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useSelector((state) => state.theme);
  const token = useSelector((state) => state.auth.token);

  // Mutations
  const createFormation = useCreateFormation();
  const createCabinet = useCreateCabinet();
  const createSession = useCreateSession();
  const createProgramme = useCreateProgramme();
  const createFormateur = useCreateFormateur();
  const assignCabinetToFormation = useAssignCabinetToFormation();
  const assignSessionToCabinet = useAssignSessionToCabinet();
  const assignProgrammeToSession = useAssignProgrammeToSession();
  const assignFormateurToSession = useAssignFormateurToSession();

  // Form states
  const [activeTab, setActiveTab] = useState('formation');
  const [formationData, setFormationData] = useState({
    titre: '',
    description: '',
  });
  const [cabinetData, setCabinetData] = useState({
    nom: '',
    adresse: '',
    logo: '',
    tel: '',
    catalogue: '',
    motscles: '',
    description: '',
  });
  const [sessionsData, setSessionsData] = useState([
    {
      objectifs: '',
      apport: '',
      affiche: '',
      theme: '',
      prix: '',
      mode: 'ONLINE',
      datedebut: '',
      programmes: [{ titre: '', duree: '', nbrdheureparjour: '', heuredebut: '', heurefin: '' }],
    },
  ]);
  const [formateurData, setFormateurData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    bio: '',
  });

  // Error states
  const [errors, setErrors] = useState({
    formation: {},
    cabinet: {},
    sessions: [{}],
    formateur: {},
  });
  const [formError, setFormError] = useState(null);

  // Toggle states for enabling/disabling sections
  const [createCabinetEnabled, setCreateCabinetEnabled] = useState(false);
  const [createSessionEnabled, setCreateSessionEnabled] = useState(false);
  const [createFormateurEnabled, setCreateFormateurEnabled] = useState(false);

  // Handle input changes for formation, cabinet, and formateur
  const handleChange = useCallback(
    (e, setData, section) => {
      const { name, value } = e.target;
      setData((prev) => ({
        ...prev,
        [name]: ['prix', 'duree', 'nbrdheureparjour'].includes(name) ? (value ? parseFloat(value) : '') : value,
      }));
      setErrors((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value.trim() || ['description', 'logo', 'tel', 'catalogue', 'motscles', 'affiche', 'heuredebut', 'heurefin', 'phone', 'specialization', 'bio', 'datedebut'].includes(name)
            ? null
            : `Ce champ est requis`,
        },
      }));
      setFormError(null);
    },
    []
  );

  // Handle input changes for sessions and nested programmes
  const handleSessionChange = useCallback(
    (e, sessionIndex, programmeIndex = null) => {
      const { name, value } = e.target;
      setSessionsData((prev) => {
        const newSessions = [...prev];
        if (programmeIndex === null) {
          // Update session field
          newSessions[sessionIndex] = {
            ...newSessions[sessionIndex],
            [name]: ['prix'].includes(name) ? (value ? parseFloat(value) : '') : value,
          };
        } else {
          // Update programme field
          const newProgrammes = [...newSessions[sessionIndex].programmes];
          newProgrammes[programmeIndex] = {
            ...newProgrammes[programmeIndex],
            [name]: ['duree', 'nbrdheureparjour'].includes(name) ? (value ? parseFloat(value) : '') : value,
          };
          newSessions[sessionIndex] = { ...newSessions[sessionIndex], programmes: newProgrammes };
        }
        return newSessions;
      });
      setErrors((prev) => {
        const newSessionErrors = [...prev.sessions];
        newSessionErrors[sessionIndex] = {
          ...newSessionErrors[sessionIndex],
          [name]: value.trim() || ['objectifs', 'apport', 'theme', 'prix'].includes(name) ? (value.trim() ? null : `Ce champ est requis`) : null,
          programmes: newSessionErrors[sessionIndex]?.programmes || [{}],
        };
        if (programmeIndex !== null) {
          newSessionErrors[sessionIndex].programmes[programmeIndex] = {
            ...newSessionErrors[sessionIndex].programmes[programmeIndex],
            [name]: value.trim() || ['heuredebut', 'heurefin'].includes(name) ? null : `Ce champ est requis`,
          };
        }
        return { ...prev, sessions: newSessionErrors };
      });
      setFormError(null);
    },
    []
  );

  // Add a new session
  const addSession = useCallback(() => {
    setSessionsData((prev) => [
      ...prev,
      {
        objectifs: '',
        apport: '',
        affiche: '',
        theme: '',
        prix: '',
        mode: 'ONLINE',
        datedebut: '',
        programmes: [{ titre: '', duree: '', nbrdheureparjour: '', heuredebut: '', heurefin: '' }],
      },
    ]);
    setErrors((prev) => ({ ...prev, sessions: [...prev.sessions, {}] }));
  }, []);

  // Remove a session
  const removeSession = useCallback((sessionIndex) => {
    setSessionsData((prev) => prev.filter((_, index) => index !== sessionIndex));
    setErrors((prev) => ({ ...prev, sessions: prev.sessions.filter((_, index) => index !== sessionIndex) }));
  }, []);

  // Add a new programme to a session
  const addProgramme = useCallback((sessionIndex) => {
    setSessionsData((prev) => {
      const newSessions = [...prev];
      newSessions[sessionIndex] = {
        ...newSessions[sessionIndex],
        programmes: [...newSessions[sessionIndex].programmes, { titre: '', duree: '', nbrdheureparjour: '', heuredebut: '', heurefin: '' }],
      };
      return newSessions;
    });
    setErrors((prev) => {
      const newSessionErrors = [...prev.sessions];
      newSessionErrors[sessionIndex] = {
        ...newSessionErrors[sessionIndex],
        programmes: [...(newSessionErrors[sessionIndex].programmes || []), {}],
      };
      return { ...prev, sessions: newSessionErrors };
    });
  }, []);

  // Remove a programme from a session
  const removeProgramme = useCallback((sessionIndex, programmeIndex) => {
    setSessionsData((prev) => {
      const newSessions = [...prev];
      newSessions[sessionIndex] = {
        ...newSessions[sessionIndex],
        programmes: newSessions[sessionIndex].programmes.filter((_, index) => index !== programmeIndex),
      };
      return newSessions;
    });
    setErrors((prev) => {
      const newSessionErrors = [...prev.sessions];
      newSessionErrors[sessionIndex] = {
        ...newSessionErrors[sessionIndex],
        programmes: newSessionErrors[sessionIndex].programmes.filter((_, index) => index !== programmeIndex),
      };
      return { ...prev, sessions: newSessionErrors };
    });
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {
      formation: {},
      cabinet: createCabinetEnabled ? {} : {},
      sessions: sessionsData.map(() => ({})),
      formateur: createFormateurEnabled ? {} : {},
    };

    // Formation validation
    if (!formationData.titre.trim()) {
      newErrors.formation.titre = 'Le titre est requis';
    }

    // Cabinet validation
    if (createCabinetEnabled && !cabinetData.nom.trim()) {
      newErrors.cabinet.nom = 'Le nom est requis';
    }

    // Session validation
    if (createSessionEnabled) {
      sessionsData.forEach((session, index) => {
        if (!session.objectifs.trim()) newErrors.sessions[index].objectifs = 'Les objectifs sont requis';
        if (!session.apport.trim()) newErrors.sessions[index].apport = 'La contribution est requise';
        if (!session.theme.trim()) newErrors.sessions[index].theme = 'Le thème est requis';
        if (!session.prix && session.prix !== 0) newErrors.sessions[index].prix = 'Le prix est requis';
        // Programme validation
        newErrors.sessions[index].programmes = session.programmes.map(() => ({}));
        session.programmes.forEach((programme, progIndex) => {
          if (!programme.titre.trim()) newErrors.sessions[index].programmes[progIndex].titre = 'Le titre est requis';
          if (!programme.duree && programme.duree !== 0) newErrors.sessions[index].programmes[progIndex].duree = 'La durée est requise';
          if (!programme.nbrdheureparjour && programme.nbrdheureparjour !== 0)
            newErrors.sessions[index].programmes[progIndex].nbrdheureparjour = 'Les heures par jour sont requises';
        });
      });
    }

    // Formateur validation
    if (createFormateurEnabled) {
      if (!formateurData.name.trim()) newErrors.formateur.name = 'Le nom est requis';
      if (!formateurData.email.trim()) newErrors.formateur.email = 'L’email est requis';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((section) => (Array.isArray(section) ? section.every((s) => Object.keys(s).length === 0) : Object.keys(section).length === 0));
  }, [formationData, cabinetData, sessionsData, formateurData, createCabinetEnabled, createSessionEnabled, createFormateurEnabled]);

  // Handle tab change with confirmation for unsaved changes
  const handleTabChange = useCallback(
    (tabId) => {
      // Check for unsaved changes in the current tab
      const currentErrors = validateForm();
      const hasUnsavedChanges =
        (activeTab === 'formation' && (formationData.titre || formationData.description)) ||
        (activeTab === 'cabinet' && createCabinetEnabled && (cabinetData.nom || cabinetData.adresse || cabinetData.logo || cabinetData.tel || cabinetData.catalogue || cabinetData.motscles || cabinetData.description)) ||
        (activeTab === 'session' &&
          createSessionEnabled &&
          sessionsData.some((session) => session.objectifs || session.apport || session.affiche || session.theme || session.prix || session.datedebut || session.programmes.some((prog) => prog.titre || prog.duree || prog.nbrdheureparjour || prog.heuredebut || prog.heurefin))) ||
        (activeTab === 'formateur' && createFormateurEnabled && (formateurData.name || formateurData.email || formateurData.phone || formateurData.specialization || formateurData.bio));

      if (hasUnsavedChanges && !currentErrors) {
        if (!window.confirm('Vous avez des modifications non enregistrées. Voulez-vous continuer ?')) {
          return;
        }
      }

      setActiveTab(tabId);
      setFormError(null);
    },
    [activeTab, formationData, cabinetData, sessionsData, formateurData, createCabinetEnabled, createSessionEnabled, createFormateurEnabled, validateForm]
  );

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      setFormError('Authentification requise. Veuillez vous connecter.');
      return;
    }

    if (!validateForm()) {
      setFormError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    try {
      // Step 1: Create Formation
      const formationResponse = await createFormation.mutateAsync(formationData);
      const formationId = formationResponse.id;
      toast.success('Formation created successfully!');

      let cabinetId;

      // Step 2: Create and Assign Cabinet (if enabled)
      if (createCabinetEnabled) {
        const cabinetResponse = await createCabinet.mutateAsync(cabinetData);
        cabinetId = cabinetResponse.id;
        await assignCabinetToFormation.mutateAsync({ formationId, cabinetId });
        toast.success('Cabinet created and assigned successfully!');
      }

      // Step 3: Create and Assign Sessions (if enabled)
      const sessionIds = [];
      if (createSessionEnabled && cabinetId) {
        for (const session of sessionsData) {
          const sessionResponse = await createSession.mutateAsync(session);
          const sessionId = sessionResponse.id;
          sessionIds.push(sessionId);
          await assignSessionToCabinet.mutateAsync({ cabinetId, sessionId });
          toast.success(`Session "${session.theme || 'Untitled'}" created and assigned successfully!`);

          // Step 4: Create and Assign Programmes for this session
          for (const programme of session.programmes) {
            const programmeResponse = await createProgramme.mutateAsync(programme);
            const programmeId = programmeResponse.id;
            await assignProgrammeToSession.mutateAsync({ sessionId, programmeId });
            toast.success(`Programme "${programme.titre || 'Untitled'}" created and assigned successfully!`);
          }
        }
      }

      // Step 5: Create and Assign Formateur (if enabled)
      if (createFormateurEnabled && sessionIds.length > 0) {
        const formateurResponse = await createFormateur.mutateAsync(formateurData);
        const formateurId = formateurResponse.id;
        for (const sessionId of sessionIds) {
          await assignFormateurToSession.mutateAsync({ sessionId, formateurId });
        }
        toast.success('Formateur created and assigned to all sessions successfully!');
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['formations', 'cabinets', 'sessions', 'programmes', 'formateurs']);
      navigate(`/formations/${formationId}`);
    } catch (error) {
      setFormError(error.message || 'Erreur lors de la création');
    }
  };

  const tabs = [
    { id: 'formation', label: 'Formation' },
    { id: 'cabinet', label: 'Cabinet' },
    { id: 'session', label: 'Session' },
    { id: 'formateur', label: 'Formateur' },
  ];

  const primaryColor = themeColors[theme]?.primary || '#4cd964';
  const secondaryColor = themeColors[theme]?.secondary || '#34c759';

  const LoadingSpinner = ({ size = 18 }) => <Loader2 size={size} className="animate-spin text-gray-500" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8" style={{ marginTop: '80px', marginLeft: '250px' }}>
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
          }
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
        `}
      </style>
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] px-8 py-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Briefcase size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Créer une nouvelle formation</h1>
                <p className="text-white/80 mt-1">Remplissez les informations ci-dessous pour créer une formation et associer des entités</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="p-8 space-y-10">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`px-4 py-2 font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-b-2 border-[color:var(--theme-primary)] text-[color:var(--theme-primary)] font-semibold'
                      : 'text-gray-500 hover:text-[color:var(--theme-primary)] hover:border-b-2 hover:border-gray-300'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleTabChange(tab.id);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Formation Tab */}
            {activeTab === 'formation' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-l-4 border-[color:var(--theme-primary)] pl-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Informations de la formation</h3>
                  <p className="text-gray-600">Détails de base de la formation</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Titre"
                    name="titre"
                    icon={Briefcase}
                    value={formationData.titre}
                    onChange={(e) => handleChange(e, setFormationData, 'formation')}
                    error={errors.formation.titre}
                  />
                  <InputField
                    label="Description"
                    name="description"
                    type="textarea"
                    value={formationData.description}
                    onChange={(e) => handleChange(e, setFormationData, 'formation')}
                    optional
                    error={errors.formation.description}
                  />
                </div>
              </div>
            )}

            {/* Cabinet Tab */}
            {activeTab === 'cabinet' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-l-4 border-[color:var(--theme-primary)] pl-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Informations du cabinet</h3>
                  <p className="text-gray-600">Détails du cabinet à associer</p>
                </div>
                <div className="mb-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={createCabinetEnabled}
                      onChange={(e) => setCreateCabinetEnabled(e.target.checked)}
                      className="h-5 w-5 text-[color:var(--theme-primary)] border-gray-300 rounded focus:ring-[color:var(--theme-primary)]"
                    />
                    <span className="ml-2 text-gray-700 font-medium">Créer et associer un nouveau cabinet</span>
                  </label>
                </div>
                {createCabinetEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Nom"
                      name="nom"
                      icon={Briefcase}
                      value={cabinetData.nom}
                      onChange={(e) => handleChange(e, setCabinetData, 'cabinet')}
                      error={errors.cabinet.nom}
                    />
                    <InputField
                      label="Adresse"
                      name="adresse"
                      value={cabinetData.adresse}
                      onChange={(e) => handleChange(e, setCabinetData, 'cabinet')}
                      optional
                      error={errors.cabinet.adresse}
                    />
                    <InputField
                      label="Logo URL"
                      name="logo"
                      value={cabinetData.logo}
                      onChange={(e) => handleChange(e, setCabinetData, 'cabinet')}
                      optional
                      error={errors.cabinet.logo}
                    />
                    <InputField
                      label="Téléphone"
                      name="tel"
                      value={cabinetData.tel}
                      onChange={(e) => handleChange(e, setCabinetData, 'cabinet')}
                      optional
                      error={errors.cabinet.tel}
                    />
                    <InputField
                      label="Catalogue"
                      name="catalogue"
                      value={cabinetData.catalogue}
                      onChange={(e) => handleChange(e, setCabinetData, 'cabinet')}
                      optional
                      error={errors.cabinet.catalogue}
                    />
                    <InputField
                      label="Mots-clés"
                      name="motscles"
                      value={cabinetData.motscles}
                      onChange={(e) => handleChange(e, setCabinetData, 'cabinet')}
                      optional
                      error={errors.cabinet.motscles}
                    />
                    <div className="md:col-span-2">
                      <InputField
                        label="Description"
                        name="description"
                        type="textarea"
                        value={cabinetData.description}
                        onChange={(e) => handleChange(e, setCabinetData, 'cabinet')}
                        optional
                        error={errors.cabinet.description}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Session Tab */}
            {activeTab === 'session' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-l-4 border-[color:var(--theme-primary)] pl-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Informations des sessions</h3>
                  <p className="text-gray-600">Détails des sessions et programmes associés</p>
                </div>
                <div className="mb-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={createSessionEnabled}
                      onChange={(e) => setCreateSessionEnabled(e.target.checked && createCabinetEnabled)}
                      disabled={!createCabinetEnabled}
                      className="h-5 w-5 text-[color:var(--theme-primary)] border-gray-300 rounded focus:ring-[color:var(--theme-primary)]"
                    />
                    <span className="ml-2 text-gray-700 font-medium">Créer et associer des sessions (requiert un cabinet)</span>
                  </label>
                </div>
                {createSessionEnabled && (
                  <div className="space-y-8">
                    {sessionsData.map((session, sessionIndex) => (
                      <div key={sessionIndex} className="border rounded-lg p-6 bg-gray-50">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-lg font-semibold text-gray-800">Session {sessionIndex + 1}</h4>
                          {sessionsData.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSession(sessionIndex)}
                              className="text-red-500 hover:text-red-700 flex items-center space-x-1"
                            >
                              <Trash2 size={18} />
                              <span>Supprimer</span>
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <InputField
                            label="Objectifs"
                            name="objectifs"
                            type="textarea"
                            value={session.objectifs}
                            onChange={(e) => handleSessionChange(e, sessionIndex)}
                            error={errors.sessions[sessionIndex]?.objectifs}
                          />
                          <InputField
                            label="Contribution"
                            name="apport"
                            type="textarea"
                            value={session.apport}
                            onChange={(e) => handleSessionChange(e, sessionIndex)}
                            error={errors.sessions[sessionIndex]?.apport}
                          />
                          <InputField
                            label="Affiche URL"
                            name="affiche"
                            value={session.affiche}
                            onChange={(e) => handleSessionChange(e, sessionIndex)}
                            optional
                            error={errors.sessions[sessionIndex]?.affiche}
                          />
                          <InputField
                            label="Thème"
                            name="theme"
                            icon={Briefcase}
                            value={session.theme}
                            onChange={(e) => handleSessionChange(e, sessionIndex)}
                            error={errors.sessions[sessionIndex]?.theme}
                          />
                          <InputField
                            label="Prix"
                            name="prix"
                            type="number"
                            value={session.prix}
                            onChange={(e) => handleSessionChange(e, sessionIndex)}
                            error={errors.sessions[sessionIndex]?.prix}
                            min="0"
                          />
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mode</label>
                            <select
                              name="mode"
                              value={session.mode}
                              onChange={(e) => handleSessionChange(e, sessionIndex)}
                              className="w-full pl-4 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all duration-200 hover:border-gray-400 shadow-sm border-gray-300"
                            >
                              <option value="ONLINE">Online</option>
                              <option value="IN_PERSON">In Person</option>
                            </select>
                          </div>
                          <InputField
                            label="Date de début"
                            name="datedebut"
                            type="date"
                            value={session.datedebut}
                            onChange={(e) => handleSessionChange(e, sessionIndex)}
                            optional
                            error={errors.sessions[sessionIndex]?.datedebut}
                          />
                        </div>
                        {/* Programmes Section */}
                        <div className="mt-6">
                          <div className="border-l-4 border-[color:var(--theme-secondary)] pl-4 mb-4">
                            <h5 className="text-lg font-semibold text-gray-800">Programmes</h5>
                            <p className="text-gray-600">Détails des programmes pour cette session</p>
                          </div>
                          {session.programmes.map((programme, programmeIndex) => (
                            <div key={programmeIndex} className="border rounded-lg p-4 bg-white mb-4">
                              <div className="flex justify-between items-center mb-4">
                                <h6 className="text-md font-medium text-gray-700">Programme {programmeIndex + 1}</h6>
                                {session.programmes.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeProgramme(sessionIndex, programmeIndex)}
                                    className="text-red-500 hover:text-red-700 flex items-center space-x-1"
                                  >
                                    <Trash2 size={16} />
                                    <span>Supprimer</span>
                                  </button>
                                )}
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                  label="Titre"
                                  name="titre"
                                  icon={Briefcase}
                                  value={programme.titre}
                                  onChange={(e) => handleSessionChange(e, sessionIndex, programmeIndex)}
                                  error={errors.sessions[sessionIndex]?.programmes?.[programmeIndex]?.titre}
                                />
                                <InputField
                                  label="Durée (heures)"
                                  name="duree"
                                  type="number"
                                  value={programme.duree}
                                  onChange={(e) => handleSessionChange(e, sessionIndex, programmeIndex)}
                                  error={errors.sessions[sessionIndex]?.programmes?.[programmeIndex]?.duree}
                                  min="0"
                                />
                                <InputField
                                  label="Heures par jour"
                                  name="nbrdheureparjour"
                                  type="number"
                                  value={programme.nbrdheureparjour}
                                  onChange={(e) => handleSessionChange(e, sessionIndex, programmeIndex)}
                                  error={errors.sessions[sessionIndex]?.programmes?.[programmeIndex]?.nbrdheureparjour}
                                  min="0"
                                />
                                <InputField
                                  label="Heure de début"
                                  name="heuredebut"
                                  type="time"
                                  value={programme.heuredebut}
                                  onChange={(e) => handleSessionChange(e, sessionIndex, programmeIndex)}
                                  optional
                                  error={errors.sessions[sessionIndex]?.programmes?.[programmeIndex]?.heuredebut}
                                />
                                <InputField
                                  label="Heure de fin"
                                  name="heurefin"
                                  type="time"
                                  value={programme.heurefin}
                                  onChange={(e) => handleSessionChange(e, sessionIndex, programmeIndex)}
                                  optional
                                  error={errors.sessions[sessionIndex]?.programmes?.[programmeIndex]?.heurefin}
                                />
                              </div>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addProgramme(sessionIndex)}
                            className="mt-4 px-4 py-2 bg-[color:var(--theme-primary)] text-white rounded-lg hover:bg-[color:var(--theme-secondary)] transition-all duration-200 flex items-center space-x-2"
                          >
                            <Plus size={18} />
                            <span>Ajouter un programme</span>
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addSession}
                      className="mt-4 px-4 py-2 bg-[color:var(--theme-primary)] text-white rounded-lg hover:bg-[color:var(--theme-secondary)] transition-all duration-200 flex items-center space-x-2"
                    >
                      <Plus size={18} />
                      <span>Ajouter une session</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Formateur Tab */}
            {activeTab === 'formateur' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-l-4 border-[color:var(--theme-primary)] pl-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">Informations du formateur</h3>
                  <p className="text-gray-600">Détails du formateur à associer</p>
                </div>
                <div className="mb-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={createFormateurEnabled}
                      onChange={(e) => setCreateFormateurEnabled(e.target.checked && createSessionEnabled)}
                      disabled={!createSessionEnabled}
                      className="h-5 w-5 text-[color:var(--theme-primary)] border-gray-300 rounded focus:ring-[color:var(--theme-primary)]"
                    />
                    <span className="ml-2 text-gray-700 font-medium">Créer et associer un nouveau formateur (requiert une session)</span>
                  </label>
                </div>
                {createFormateurEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Nom"
                      name="name"
                      icon={Briefcase}
                      value={formateurData.name}
                      onChange={(e) => handleChange(e, setFormateurData, 'formateur')}
                      error={errors.formateur.name}
                    />
                    <InputField
                      label="Email"
                      name="email"
                      type="email"
                      value={formateurData.email}
                      onChange={(e) => handleChange(e, setFormateurData, 'formateur')}
                      error={errors.formateur.email}
                    />
                    <InputField
                      label="Téléphone"
                      name="phone"
                      value={formateurData.phone}
                      onChange={(e) => handleChange(e, setFormateurData, 'formateur')}
                      optional
                      error={errors.formateur.phone}
                    />
                    <InputField
                      label="Spécialisation"
                      name="specialization"
                      value={formateurData.specialization}
                      onChange={(e) => handleChange(e, setFormateurData, 'formateur')}
                      optional
                      error={errors.formateur.specialization}
                    />
                    <div className="md:col-span-2">
                      <InputField
                        label="Bio"
                        name="bio"
                        type="textarea"
                        value={formateurData.bio}
                        onChange={(e) => handleChange(e, setFormateurData, 'formateur')}
                        optional
                        error={errors.formateur.bio}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Alert */}
            {(formError || createFormation.isError || createCabinet.isError || createSession.isError || createProgramme.isError || createFormateur.isError || !token) && (
              <div className="border-l-4 border-red-500 p-4 rounded-lg bg-red-50 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={18} className="text-red-700" />
                  <p className="text-red-700">
                    {formError ||
                      (!token
                        ? 'Authentification requise. Veuillez vous connecter.'
                        : createFormation.error?.message ||
                          createCabinet.error?.message ||
                          createSession.error?.message ||
                          createProgramme.error?.message ||
                          createFormateur.error?.message ||
                          'Échec de la création')}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200 animate-fadeIn">
              <button
                type="button"
                onClick={() => navigate('/formations')}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300 hover:border-gray-400 flex items-center justify-center space-x-2"
              >
                <X size={18} />
                <span>Annuler</span>
              </button>
              <button
                type="submit"
                disabled={
                  createFormation.isLoading ||
                  createCabinet.isLoading ||
                  createSession.isLoading ||
                  createProgramme.isLoading ||
                  createFormateur.isLoading ||
                  assignCabinetToFormation.isLoading ||
                  assignSessionToCabinet.isLoading ||
                  assignProgrammeToSession.isLoading ||
                  assignFormateurToSession.isLoading ||
                  Object.values(errors).some((section) => (Array.isArray(section) ? section.some((s) => Object.keys(s).length > 0 || s.programmes?.some((p) => Object.keys(p).length > 0)) : Object.keys(section).length > 0))
                }
                className="px-8 py-3 bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white rounded-lg hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {(createFormation.isLoading ||
                  createCabinet.isLoading ||
                  createSession.isLoading ||
                  createProgramme.isLoading ||
                  createFormateur.isLoading ||
                  assignCabinetToFormation.isLoading ||
                  assignSessionToCabinet.isLoading ||
                  assignProgrammeToSession.isLoading ||
                  assignFormateurToSession.isLoading) && <LoadingSpinner />}
                <Save size={18} />
                <span>Créer et associer</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormationCreate;
