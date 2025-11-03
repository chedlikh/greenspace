import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useSessionById, useUpdateSession } from '../../../../services/formation';
import { Calendar, Save, X, Loader2, AlertCircle, Image } from "lucide-react";
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

const SessionEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.theme);
  const token = useSelector((state) => state.auth.token);
  const { data: session, isLoading, error } = useSessionById(id);
  const updateSession = useUpdateSession();
  const [formData, setFormData] = useState(null);
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
  });
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (session) {
      setFormData({
        datedebut: session.datedebut ? new Date(session.datedebut).toISOString().split('T')[0] : '',
        datefin: session.datefin ? new Date(session.datefin).toISOString().split('T')[0] : '',
        prix: session.prix || '',
        mode: session.mode || 'ONLINE',
        objectifs: session.objectifs || '',
        apport: session.apport || '',
        affiche: session.affiche || '',
        theme: session.theme || '',
      });
      if (session.affiche) {
        if (session.affiche.match(/\.(jpg|jpeg|png|gif)$/i)) {
          setPreviewContent(
            <img
              src={session.affiche}
              alt="Affiche Preview"
              className="mt-4 max-w-full h-auto rounded-lg shadow-md"
              onError={() => setPreviewError('Erreur lors du chargement de l\'image')}
            />
          );
        } else if (session.affiche.match(/\.pdf$/i)) {
          setPreviewContent(
            <iframe
              src={session.affiche}
              title="Affiche PDF Preview"
              className="mt-4 w-full h-96 rounded-lg shadow-md"
            />
          );
        } else {
          setPreviewContent(null);
          setPreviewError('Format non supporté. Veuillez fournir une URL vers une image (jpg, png, gif) ou un PDF.');
        }
      }
    }
  }, [session]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'prix' ? (value ? parseFloat(value) : '') : value }));
    setErrors((prev) => ({ ...prev, [name]: value.trim() ? null : name !== 'prix' && name !== 'affiche' ? 'Ce champ est requis' : null }));
    setFormError(null);

    if (name === 'affiche' && value) {
      setPreviewError(null);
      if (value.match(/\.(jpg|jpeg|png|gif)$/i)) {
        setPreviewContent(
          <img
            src={value}
            alt="Affiche Preview"
            className="mt-4 max-w-full h-auto rounded-lg shadow-md"
            onError={() => setPreviewError('Erreur lors du chargement de l\'image')}
          />
        );
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

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData?.datedebut) newErrors.datedebut = 'Ce champ est requis';
    if (!formData?.datefin) newErrors.datefin = 'Ce champ est requis';
    if (!formData?.objectifs) newErrors.objectifs = 'Ce champ est requis';
    if (!formData?.apport) newErrors.apport = 'Ce champ est requis';
    if (!formData?.theme) newErrors.theme = 'Ce champ est requis';
    if (formData?.prix && isNaN(formData.prix)) newErrors.prix = 'Le prix doit être un nombre valide';
    if (formData?.affiche && !formData.affiche.match(/\.(jpg|jpeg|png|gif|pdf)$/i)) {
      newErrors.affiche = 'L\'URL doit pointer vers une image (jpg, png, gif) ou un PDF';
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setFormError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    if (!token) {
      setFormError('Authentification requise. Veuillez vous connecter.');
      return;
    }

    try {
      await updateSession.mutateAsync(
        { id, data: formData },
        {
          onSuccess: () => {
            toast.success('Session mise à jour avec succès !');
            navigate(`/sessions/${id}`);
          },
        }
      );
    } catch (error) {
      setFormError(error.message || 'Erreur lors de la mise à jour de la session');
    }
  };

  const LoadingSpinner = ({ size = 18 }) => (
    <Loader2 size={size} className="animate-spin text-gray-500" />
  );

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-center" style={{ marginTop: '80px', marginLeft: '250px' }}>
        <LoadingSpinner size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center" style={{ marginTop: '80px', marginLeft: '250px' }}>
        <div className="border-l-4 border-red-500 p-4 rounded-lg bg-red-50 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertCircle size={18} className="text-red-700" />
            <p className="text-red-700 mont-font">{error.message || 'Erreur inconnue'}</p>
          </div>
        </div>
      </div>
    );
  }

  const primaryColor = themeColors[theme]?.primary || '#132977';
  const secondaryColor = themeColors[theme]?.secondary || '#007aff';

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
                <h1 className="text-3xl font-bold text-white mont-font">Modifier la session</h1>
                <p className="text-white/80 mt-1 mont-font">Mettez à jour les informations de la session ci-dessous</p>
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

            {(formError || updateSession.isError || !token) && (
              <div className="border-l-4 border-red-500 p-4 rounded-lg bg-red-50 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <AlertCircle size={18} className="text-red-700" />
                  <p className="text-red-700 mont-font">
                    {formError || (!token ? 'Authentification requise. Veuillez vous connecter.' : updateSession.error?.message || 'Échec de la mise à jour de la session')}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200 animate-fadeIn">
              <button
                type="button"
                onClick={() => navigate(`/sessions/${id}`)}
                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium border border-gray-300 hover:border-gray-400 mont-font flex items-center justify-center space-x-2"
              >
                <X size={18} />
                <span>Annuler</span>
              </button>
              <button
                type="submit"
                disabled={updateSession.isLoading || Object.values(errors).some((e) => e)}
                className="px-8 py-3 bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white rounded-lg hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed mont-font flex items-center justify-center space-x-2"
              >
                {updateSession.isLoading && <LoadingSpinner />}
                <Save size={18} />
                <span>Mettre à jour la session</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SessionEdit;