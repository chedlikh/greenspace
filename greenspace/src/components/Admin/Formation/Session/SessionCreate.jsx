import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateSession,
  useNotAssignedProgrammes,
  useCreateProgramme,
  useAssignProgrammeToSession,
  useAssignMultipleProgrammesToSession,
  useAllFormateurs,
  useCreateFormateur,
  useAssignFormateurToSession,
} from '../../../../services/formation';
import { Calendar, Save, X, Loader2, AlertCircle, PlusCircle, Image, FileText } from "lucide-react";
import { toast } from 'react-toastify';

// Theme color mapping
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
const InputField = React.memo(({ label, name, type = "text", icon: Icon, value, onChange, optional = false, error }) => {
  const { theme } = useSelector((state) => state.theme);
  const themeColor = themeColors[theme]?.primary || '#132977';

  return (
    <div className="group">
      <label className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors mont-font group-focus-within:text-[color:var(--theme-primary)] ${error ? 'text-red-500' : ''}`}>
        {label} {!optional && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400 group-focus-within:text-[color:var(--theme-primary)]'} transition-colors`} />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={!optional}
          className={`w-full mont-font ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all duration-200 hover:border-gray-400 shadow-sm ${error ? 'border-red-500' : 'border-gray-300'} ${error ? 'focus:ring-red-500' : ''}`}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500 animate-fadeIn">{error}</p>
        )}
      </div>
    </div>
  );
});

// TextAreaField component
const TextAreaField = React.memo(({ label, name, value, onChange, optional = false, error }) => {
  const { theme } = useSelector((state) => state.theme);
  const themeColor = themeColors[theme]?.primary || '#132977';

  return (
    <div className="group">
      <label className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors mont-font group-focus-within:text-[color:var(--theme-primary)] ${error ? 'text-red-500' : ''}`}>
        {label} {!optional && <span className="text-red-500">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={!optional}
        className={`w-full mont-font pl-4 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all duration-200 hover:border-gray-400 shadow-sm ${error ? 'border-red-500' : 'border-gray-300'} ${error ? 'focus:ring-red-500' : ''}`}
        rows="4"
      ></textarea>
      {error && (
        <p className="mt-1 text-sm text-red-500 animate-fadeIn">{error}</p>
      )}
    </div>
  );
});

// SelectField component
const SelectField = React.memo(({ label, name, value, onChange, options, optional = false, error }) => {
  const { theme } = useSelector((state) => state.theme);
  const themeColor = themeColors[theme]?.primary || '#132977';

  return (
    <div className="group">
      <label className={`block text-sm font-semibold text-gray-700 mb-2 transition-colors mont-font group-focus-within:text-[color:var(--theme-primary)] ${error ? 'text-red-500' : ''}`}>
        {label} {!optional && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={!optional}
        className={`w-full mont-font pl-4 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-[color:var(--theme-primary)] focus:border-[color:var(--theme-primary)] transition-all duration-200 hover:border-gray-400 shadow-sm ${error ? 'border-red-500' : 'border-gray-300'} ${error ? 'focus:ring-red-500' : ''}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500 animate-fadeIn">{error}</p>
      )}
    </div>
  );
});

const SessionCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme } = useSelector((state) => state.theme);
  const token = useSelector((state) => state.auth.token);
  const createSession = useCreateSession();
  const { data: notAssignedProgrammes = [], isLoading: programmesLoading, error: programmesError } = useNotAssignedProgrammes();
  const createProgramme = useCreateProgramme();
  const assignProgrammeToSession = useAssignProgrammeToSession();
  const assignMultipleProgrammesToSession = useAssignMultipleProgrammesToSession();
  const { data: formateurs = [], isLoading: formateursLoading, error: formateursError } = useAllFormateurs();
  const createFormateur = useCreateFormateur();
  const assignFormateurToSession = useAssignFormateurToSession();

  const [formData, setFormData] = useState({
    datedebut: '',
    datefin: '',
    prix: '',
    mode: 'ONLINE',
    objectifs: '',
    apport: '',
    affiche: '',
    theme: '',
  });
  const [newProgramme, setNewProgramme] = useState({
    titre: '',
    duree: '',
    nbrdheureparjour: '',
    heuredebut: '',
    heurefin: '',
  });
  const [newFormateur, setNewFormateur] = useState({
    name: '',
    email: '',
  });
  const [selectedProgramme, setSelectedProgramme] = useState('');
  const [selectedProgrammes, setSelectedProgrammes] = useState([]);
  const [selectedFormateur, setSelectedFormateur] = useState('');
  const [previewContent, setPreviewContent] = useState(null);
  const [previewError, setPreviewError] = useState(null);
  const [errors, setErrors] = useState({
    datedebut: null,
    datefin: null,
    prix: null,
    mode: null,
    objectifs: null,
    apport: null,
    affiche: null,
    theme: null,
    programmeTitre: null,
    programmeDuree: null,
 Kusnbrdheureparjour: null,
    programmeHeuredebut: null,
    programmeHeurefin: null,
    formateurName: null,
    formateurEmail: null,
  });
  const [formError, setFormError] = useState(null);

  const primaryColor = themeColors[theme]?.primary || '#132977';
  const secondaryColor = themeColors[theme]?.secondary || '#007aff';

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'prix' ? (value ? parseFloat(value) : '') : value }));
    setErrors((prev) => ({ ...prev, [name]: value.trim() ? null : name !== 'prix' && name !== 'affiche' ? 'Ce champ est requis' : null }));
    setFormError(null);

    if (name === 'affiche' && value) {
      setPreviewError(null);
      if (value.match(/\.(jpg|jpeg|png|gif)$/i)) {
        setPreviewContent(<img src={value} alt="Affiche Preview" className="mt-4 max-w-full h-auto rounded-lg shadow-md" />);
      } else if (value.match(/\.pdf$/i)) {
        setPreviewContent(
          <iframe
            src={value}
            title="Affiche PDF Preview"
            className="mt-4 w-full h-96 rounded-lg shadow-md"
          />
        );
      } else {
        setPreviewContent(null);
        setPreviewError('Format non supporté. Veuillez fournir une URL vers une image (jpg, png, gif) ou un PDF.');
      }
    } else if (name === 'affiche' && !value) {
      setPreviewContent(null);
      setPreviewError(null);
    }
  }, []);

  const handleProgrammeChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewProgramme((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [`programme${name.charAt(0).toUpperCase() + name.slice(1)}`]: value.trim() ? null : 'Ce champ est requis' }));
  }, []);

  const handleFormateurChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewFormateur((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [`formateur${name.charAt(0).toUpperCase() + name.slice(1)}`]: value.trim() ? null : 'Ce champ est requis' }));
  }, []);

  const validateSessionForm = useCallback(() => {
    const newErrors = {};
    if (!formData.datedebut) newErrors.datedebut = 'Ce champ est requis';
    if (!formData.datefin) newErrors.datefin = 'Ce champ est requis';
    if (!formData.objectifs) newErrors.objectifs = 'Ce champ est requis';
    if (!formData.apport) newErrors.apport = 'Ce champ est requis';
    if (!formData.theme) newErrors.theme = 'Ce champ est requis';
    if (formData.prix && isNaN(formData.prix)) newErrors.prix = 'Le prix doit être un nombre valide';
    if (formData.affiche && !formData.affiche.match(/\.(jpg|jpeg|png|gif|pdf)$/i)) {
      newErrors.affiche = 'L\'URL doit pointer vers une image (jpg, png, gif) ou un PDF';
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const validateProgrammeForm = useCallback(() => {
    const newErrors = {};
    if (!newProgramme.titre.trim()) newErrors.programmeTitre = 'Ce champ est requis';
    if (!newProgramme.duree) newErrors.programmeDuree = 'Ce champ est requis';
    if (!newProgramme.nbrdheureparjour) newErrors.programmeNbrdheureparjour = 'Ce champ est requis';
    if (!newProgramme.heuredebut) newErrors.programmeHeuredebut = 'Ce champ est requis';
    if (!newProgramme.heurefin) newErrors.programmeHeurefin = 'Ce champ est requis';
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [newProgramme]);

  const validateFormateurForm = useCallback(() => {
    const newErrors = {};
    if (!newFormateur.name.trim()) newErrors.formateurName = 'Ce champ est requis';
    if (!newFormateur.email.trim()) newErrors.formateurEmail = 'Ce champ est requis';
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [newFormateur]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateSessionForm()) {
      setFormError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    if (!token) {
      setFormError('Authentification requise. Veuillez vous connecter.');
      return;
    }

    try {
      await createSession.mutateAsync(formData, {
        onSuccess: (data) => {
          toast.success('Session créée avec succès !');
          const sessionId = data.id;

          if (selectedProgramme) {
            assignProgrammeToSession.mutate(
              { sessionId, programmeId: selectedProgramme },
              {
                onSuccess: () => toast.success('Programme assigné avec succès !'),
                onError: (error) => toast.error(error.message || 'Erreur lors de l\'assignation du programme'),
              }
            );
          }

          if (selectedProgrammes.length > 0) {
            assignMultipleProgrammesToSession.mutate(
              { sessionId, programmeIds: selectedProgrammes },
              {
                onSuccess: () => toast.success('Programmes assignés avec succès !'),
                onError: (error) => toast.error(error.message || 'Erreur lors de l\'assignation des programmes'),
              }
            );
          }

          if (selectedFormateur) {
            assignFormateurToSession.mutate(
              { sessionId, formateurId: selectedFormateur },
              {
                onSuccess: () => toast.success('Formateur assigné avec succès !'),
                onError: (error) => toast.error(error.message || 'Erreur lors de l\'assignation du formateur'),
              }
            );
          }

          queryClient.invalidateQueries({ queryKey: ['sessions', 'unsorted'] });
          queryClient.invalidateQueries({ queryKey: ['programmes'] });
          queryClient.invalidateQueries({ queryKey: ['not-assigned-programmes'] });
          queryClient.invalidateQueries({ queryKey: ['formateurs'] });
          navigate(`/sessions/${sessionId}`);
        },
      });
    } catch (error) {
      setFormError(error.message || 'Erreur lors de la création de la session');
    }
  };

  const handleCreateProgramme = async (e) => {
    e.preventDefault();
    if (!validateProgrammeForm()) {
      setFormError('Veuillez corriger les erreurs dans le formulaire du programme');
      return;
    }

    try {
      await createProgramme.mutateAsync(newProgramme, {
        onSuccess: (data) => {
          toast.success('Programme créé avec succès !');
          setNewProgramme({ titre: '', duree: '', nbrdheureparjour: '', heuredebut: '', heurefin: '' });
          setSelectedProgramme(data.id);
          queryClient.invalidateQueries({ queryKey: ['not-assigned-programmes'] });
          queryClient.invalidateQueries({ queryKey: ['programmes'] });
        },
      });
    } catch (error) {
      setFormError(error.message || 'Erreur lors de la création du programme');
    }
  };

  const handleCreateFormateur = async (e) => {
    e.preventDefault();
    if (!validateFormateurForm()) {
      setFormError('Veuillez corriger les erreurs dans le formulaire du formateur');
      return;
    }

    try {
      await createFormateur.mutateAsync(newFormateur, {
        onSuccess: (data) => {
          toast.success('Formateur créé avec succès !');
          setNewFormateur({ name: '', email: '' });
          setSelectedFormateur(data.id);
          queryClient.invalidateQueries({ queryKey: ['formateurs'] });
        },
      });
    } catch (error) {
      setFormError(error.message || 'Erreur lors de la création du formateur');
    }
  };

  const LoadingSpinner = ({ size = 18 }) => (
    <Loader2 size={size} className="animate-spin text-gray-500" />
  );

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
          <div className="bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] px-8 py-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Calendar size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mont-font">Créer une nouvelle session</h1>
                <p className="text-white/80 mt-1 mont-font">Remplissez les informations ci-dessous pour créer une session</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-8 space-y-10">
            <div className="space-y-6 animate-fadeIn">
              <div className="border-l-4 border-[color:var(--theme-primary)] pl-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1 mont-font">Informations de la session</h3>
                <p className="text-gray-600 mont-font">Détails de base de la session</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Date de début"
                  name="datedebut"
                  type="date"
                  icon={Calendar}
                  value={formData.datedebut}
                  onChange={handleChange}
                  error={errors.datedebut}
                />
                <InputField
                  label="Date de fin"
                  name="datefin"
                  type="date"
                  icon={Calendar}
                  value={formData.datefin}
                  onChange={handleChange}
                  error={errors.datefin}
                />
                <InputField
                  label="Prix (€)"
                  name="prix"
                  type="number"
                  value={formData.prix}
                  onChange={handleChange}
                  optional
                  error={errors.prix}
                />
                <SelectField
                  label="Mode"
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  options={[
                    { value: 'ONLINE', label: 'En ligne' },
                    { value: 'IN_PERSON', label: 'En personne' },
                  ]}
                  error={errors.mode}
                />
                <InputField
                  label="Thème"
                  name="theme"
                  type="text"
                  value={formData.theme}
                  onChange={handleChange}
                  error={errors.theme}
                />
                <InputField
                  label="URL de l'affiche (image ou PDF)"
                  name="affiche"
                  type="url"
                  icon={Image}
                  value={formData.affiche}
                  onChange={handleChange}
                  optional
                  error={errors.affiche}
                />
                {previewContent && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 mont-font">Prévisualisation de l'affiche</h4>
                    {previewContent}
                  </div>
                )}
                {previewError && (
                  <div className="md:col-span-2 border-l-4 border-red-500 p-4 rounded-lg bg-red-50 animate-fadeIn">
                    <div className="flex items-center space-x-2">
                      <AlertCircle size={18} className="text-red-700" />
                      <p className="text-red-700 mont-font">{previewError}</p>
                    </div>
                  </div>
                )}
                <div className="md:col-span-2">
                  <TextAreaField
                    label="Objectifs"
                    name="objectifs"
                    value={formData.objectifs}
                    onChange={handleChange}
                    error={errors.objectifs}
                  />
                </div>
                <div className="md:col-span-2">
                  <TextAreaField
                    label="Apport"
                    name="apport"
                    value={formData.apport}
                    onChange={handleChange}
                    error={errors.apport}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 animate-fadeIn">
              <div className="border-l-4 border-[color:var(--theme-primary)] pl-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1 mont-font">Programmes</h3>
                <p className="text-gray-600 mont-font">Assigner ou créer des programmes pour la session</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {programmesLoading ? (
                  <div className="col-span-2 flex items-center space-x-2">
                    <LoadingSpinner />
                    <p className="text-gray-600 mont-font">Chargement des programmes...</p>
                  </div>
                ) : programmesError ? (
                  <div className="col-span-2 border-l-4 border-red-500 p-4 rounded-lg bg-red-50 animate-fadeIn">
                    <div className="flex items-center space-x-2">
                      <AlertCircle size={18} className="text-red-700" />
                      <p className="text-red-700 mont-font">{programmesError.message || 'Erreur lors du chargement des programmes'}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <SelectField
                      label="Assigner un programme"
                      name="selectedProgramme"
                      value={selectedProgramme}
                      onChange={(e) => setSelectedProgramme(e.target.value)}
                      options={[
                        { value: '', label: 'Sélectionner un programme' },
                        ...notAssignedProgrammes.map((programme) => ({
                          value: programme.id,
                          label: programme.titre || `Programme ${programme.id}`,
                        })),
                      ]}
                      optional
                    />
                    <div className="md:col-span-2">
                      <div className="border rounded-lg p-4 max-h-40 overflow-y-auto">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 mont-font">Assigner plusieurs programmes</h4>
                        {notAssignedProgrammes.length === 0 ? (
                          <p className="text-sm text-gray-600 mont-font">Aucun programme non assigné disponible.</p>
                        ) : (
                          notAssignedProgrammes.map((programme) => (
                            <div key={programme.id} className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                checked={selectedProgrammes.includes(programme.id)}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setSelectedProgrammes((prev) =>
                                    checked ? [...prev, programme.id] : prev.filter((id) => id !== programme.id)
                                  );
                                }}
                                className="mr-2"
                              />
                              <label className="text-sm text-gray-600 mont-font">{programme.titre || `Programme ${programme.id}`}</label>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 mont-font">Créer un nouveau programme</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Titre"
                    name="titre"
                    value={newProgramme.titre}
                    onChange={handleProgrammeChange}
                    error={errors.programmeTitre}
                  />
                  <InputField
                    label="Durée (heures)"
                    name="duree"
                    type="number"
                    value={newProgramme.duree}
                    onChange={handleProgrammeChange}
                    error={errors.programmeDuree}
                  />
                  <InputField
                    label="Heures par jour"
                    name="nbrdheureparjour"
                    type="number"
                    value={newProgramme.nbrdheureparjour}
                    onChange={handleProgrammeChange}
                    error={errors.programmeNbrdheureparjour}
                  />
                  <InputField
                    label="Heure de début"
                    name="heuredebut"
                    type="time"
                    value={newProgramme.heuredebut}
                    onChange={handleProgrammeChange}
                    error={errors.programmeHeuredebut}
                  />
                  <InputField
                    label="Heure de fin"
                    name="heurefin"
                    type="time"
                    value={newProgramme.heurefin}
                    onChange={handleProgrammeChange}
                    error={errors.programmeHeurefin}
                  />
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={handleCreateProgramme}
                      className="px-8 py-3 bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white rounded-lg hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-all duration-200 font-medium shadow-lg hover:shadow-xl mont-font flex items-center justify-center space-x-2"
                    >
                      <PlusCircle size={18} />
                      <span>Créer et sélectionner le programme</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 animate-fadeIn">
              <div className="border-l-4 border-[color:var(--theme-primary)] pl-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1 mont-font">Formateurs</h3>
                <p className="text-gray-600 mont-font">Assigner ou créer un formateur pour la session</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {formateursLoading ? (
                  <div className="col-span-2 flex items-center space-x-2">
                    <LoadingSpinner />
                    <p className="text-gray-600 mont-font">Chargement des formateurs...</p>
                  </div>
                ) : formateursError ? (
                  <div className="col-span-2 border-l-4 border-red-500 p-4 rounded-lg bg-red-50 animate-fadeIn">
                    <div className="flex items-center space-x-2">
                      <AlertCircle size={18} className="text-red-700" />
                      <p className="text-red-700 mont-font">{formateursError.message || 'Erreur lors du chargement des formateurs'}</p>
                    </div>
                  </div>
                ) : (
                  <SelectField
                    label="Assigner un formateur"
                    name="selectedFormateur"
                    value={selectedFormateur}
                    onChange={(e) => setSelectedFormateur(e.target.value)}
                    options={[
                      { value: '', label: 'Sélectionner un formateur' },
                      ...formateurs.map((formateur) => ({
                        value: formateur.id,
                        label: formateur.name || `Formateur ${formateur.id}`,
                      })),
                    ]}
                    optional
                  />
                )}
              </div>
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 mont-font">Créer un nouveau formateur</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Nom"
                    name="name"
                    value={newFormateur.name}
                    onChange={handleFormateurChange}
                    error={errors.formateurName}
                  />
                  <InputField
                    label="Email"
                    name="email"
                    type="email"
                    value={newFormateur.email}
                    onChange={handleFormateurChange}
                    error={errors.formateurEmail}
                  />
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={handleCreateFormateur}
                      className="px-8 py-3 bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white rounded-lg hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-all duration-200 font-medium shadow-lg hover:shadow-xl mont-font flex items-center justify-center space-x-2"
                    >
                      <PlusCircle size={18} />
                      <span>Créer et sélectionner le formateur</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {(formError || createSession.isError || !token) && (
              <div className="border-l-4 border-red-500 p-4 rounded-lg bg-red-50 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={18} className="text-red-700" />
                  <p className="text-red-700 mont-font">
                    {formError || (!token ? 'Authentification requise. Veuillez vous connecter.' : createSession.error?.message || 'Échec de la création de la session')}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200 animate-fadeIn">
              <button
                type="button"
                onClick={() => navigate("/sessions")}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300 hover:border-gray-400 mont-font flex items-center justify-center space-x-2"
              >
                <X size={18} />
                <span>Annuler</span>
              </button>
              <button
                type="submit"
                disabled={createSession.isLoading || Object.values(errors).some((e) => e)}
                className="px-8 py-3 bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white rounded-lg hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed mont-font flex items-center justify-center space-x-2"
              >
                {createSession.isLoading && <LoadingSpinner />}
                <Save size={18} />
                <span>Créer la session</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SessionCreate;