import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useAllSessionsWithoutSort,
  useCreateDemande,
  useUpdateDemande,
  useDeleteDemande,
  useDemandesByUserId,
} from '../../../services/formation';
import { Calendar, Save, X, Loader2, AlertCircle, Image, Trash2, Edit, User, MapPin, BookOpen, CheckCircle, DollarSign, Globe, Building, ChevronDown, ChevronUp, Info } from "lucide-react";
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

// LoadingSpinner component
const LoadingSpinner = ({ size = 18 }) => (
  <Loader2 size={size} className="animate-spin text-gray-500" />
);

// SessionDetailsModal component
const SessionDetailsModal = ({ session, isOpen, onClose, theme }) => {
  const primaryColor = themeColors[theme]?.primary || '#132977';
  const secondaryColor = themeColors[theme]?.secondary || '#007aff';

  const formatDateRange = (start, end) => {
    const startDate = new Date(start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const endDate = new Date(end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${startDate} - ${endDate}`;
  };

  const formatTime = (time) => {
    return time ? new Date(`1970-01-01T${time}Z`).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  };

  const getAfficheContent = () => {
    if (!session.affiche) return <p className="text-gray-500 mont-font italic">Aucune affiche disponible</p>;
    if (session.affiche.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return (
        <img
          src={session.affiche}
          alt="Affiche"
          className="w-full max-h-64 object-cover rounded-lg shadow-md"
          onError={() => <p className="text-red-500 mont-font">Erreur lors du chargement de l'image</p>}
        />
      );
    }
    return <p className="text-red-500 mont-font">Format non supporté</p>;
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-4 my-8 p-6 transform transition-all duration-300 animate-fadeIn max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 py-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mont-font">Détails de la session</h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-200"
            aria-label="Fermer la modale"
            title="Fermer"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-6">
          {getAfficheContent()}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <BookOpen size={20} className="text-[color:var(--theme-primary)]" />
              <div>
                <p className="text-sm font-medium text-gray-700 mont-font">Thème</p>
                <p className="text-base text-gray-900 mont-font">{session.theme || 'Session sans titre'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calendar size={20} className="text-[color:var(--theme-primary)]" />
              <div>
                <p className="text-sm font-medium text-gray-700 mont-font">Dates</p>
                <p className="text-base text-gray-900 mont-font">{formatDateRange(session.datedebut, session.datefin)}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin size={20} className="text-[color:var(--theme-primary)]" />
              <div>
                <p className="text-sm prestige-font">Lieu</p>
                <p className="text-base text-gray-900 prestige-font">{session.lieu || 'Lieu non spécifié'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <BookOpen size={20} className="text-[color:var(--theme-primary)]" />
              <div>
                <p className="text-sm prestige-font">Objectifs</p>
                <p className="text-base text-gray-900 prestige-font">{session.objectifs || 'Objectifs non spécifiés'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <BookOpen size={20} className="text-[color:var(--theme-primary)]" />
              <div>
                <p className="text-sm prestige-font">Apport</p>
                <p className="text-base text-gray-900 prestige-font">{session.apport || 'Apport non spécifié'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <DollarSign size={20} className="text-[color:var(--theme-primary)]" />
              <div>
                <p className="text-sm prestige-font">Prix</p>
                <p className="text-base text-gray-900 prestige-font">{session.prix ? `${session.prix.toFixed(2)} €` : 'Prix non spécifié'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Globe size={20} className="text-[color:var(--theme-primary)]" />
              <div>
                <p className="text-sm prestige-font">Mode</p>
                <p className="text-base text-gray-900 prestige-font">{session.mode || 'Mode non spécifié'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Building size={20} className="text-[color:var(--theme-primary)]" />
              <div>
                <p className="text-sm prestige-font">Cabinet</p>
                <p className="text-base text-gray-900 prestige-font">{session.cabinetId ? `Cabinet ID: ${session.cabinetId}` : 'Cabinet non spécifié'}</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm prestige-font mb-2">Formateurs ({session.formateurs?.length || 0})</p>
            {session.formateurs?.length > 0 ? (
              session.formateurs.map((formateur) => (
                <div key={formateur.id} className="p-4 bg-gray-50 rounded-lg mb-2">
                  <p className="text-base font-medium text-gray-900 mont-font">{formateur.name}</p>
                  <p className="text-sm text-gray-600 mont-font">{formateur.email}</p>
                  <p className="text-sm text-gray-600 mont-font">{formateur.phone}</p>
                  <p className="text-sm text-gray-600 mont-font">{formateur.specialization}</p>
                  <p className="text-sm text-gray-600 mont-font">{formateur.bio}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 mont-font italic">Aucun formateur spécifié</p>
            )}
          </div>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm prestige-font mb-2">Programmes ({session.programmes?.length || 0})</p>
            {session.programmes?.length > 0 ? (
              session.programmes.map((programme) => (
                <div key={programme.id} className="p-4 bg-gray-50 rounded-lg mb-2">
                  <p className="text-base font-medium text-gray-900 mont-font">{programme.titre}</p>
                  <p className="text-sm text-gray-600 mont-font">Durée: {programme.duree} heures</p>
                  <p className="text-sm text-gray-600 mont-font">Heures par jour: {programme.nbrdheureparjour}</p>
                  <p className="text-sm text-gray-600 mont-font">Horaire: {formatTime(programme.heuredebut)} - {formatTime(programme.heurefin)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 mont-font italic">Aucun programme spécifié</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ConfirmationModal component
const ConfirmationModal = ({ session, isOpen, onConfirm, onCancel, theme, isLoading }) => {
  const primaryColor = themeColors[theme]?.primary || '#132977';
  const secondaryColor = themeColors[theme]?.secondary || '#007aff';

  if (!isOpen || !session) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all duration-300 animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle size={24} className="text-[color:var(--theme-primary)]" />
          <h2 className="text-xl font-bold text-gray-900 mont-font">Confirmer la sélection</h2>
        </div>
        <p className="text-gray-600 mont-font mb-4">
          Voulez-vous créer une demande pour la session suivante ?
        </p>
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <p className="text-base font-medium text-[color:var(--theme-primary)] mont-font">{session.theme || 'Session sans titre'}</p>
          <p className="text-sm text-gray-600 mont-font">ID: {session.id}</p>
          <p className="text-sm text-gray-600 mont-font">
            Dates: {new Date(session.datedebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} -{' '}
            {new Date(session.datefin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="text-sm text-gray-600 mont-font">Prix: {session.prix ? `${session.prix.toFixed(2)} €` : 'Non spécifié'}</p>
          <p className="text-sm text-gray-600 mont-font">Mode: {session.mode || 'Non spécifié'}</p>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-200"
            aria-label="Annuler la confirmation"
            title="Annuler"
          >
            <X size={18} />
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="p-2 bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white rounded-full hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Confirmer la sélection"
            title="Confirmer"
          >
            {isLoading ? <LoadingSpinner /> : <Save size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// SessionCard component
const SessionCard = ({ session, isSelected, onSelect, onViewDetails, disabled }) => {
  const { theme } = useSelector((state) => state.theme);
  const [isFormateursOpen, setIsFormateursOpen] = useState(false);
  const [isProgrammesOpen, setIsProgrammesOpen] = useState(false);

  const primaryColor = themeColors[theme]?.primary || '#132977';
  const secondaryColor = themeColors[theme]?.secondary || '#007aff';

  const formatDateRange = (start, end) => {
    const startDate = new Date(start).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const endDate = new Date(end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${startDate} - ${endDate}`;
  };

  const formatTime = (time) => {
    return time ? new Date(`1970-01-01T${time}Z`).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
  };

  const getAfficheContent = () => {
    if (!session.affiche) return <p className="text-gray-500 mont-font italic">Aucune affiche disponible</p>;
    if (session.affiche.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return (
        <img
          src={session.affiche}
          alt="Affiche"
          className="w-full h-48 object-cover rounded-lg"
          onError={() => <p className="text-red-500 mont-font">Erreur lors du chargement de l'image</p>}
        />
      );
    }
    return <p className="text-red-500 mont-font">Format non supporté</p>;
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    console.log('Selected session ID:', session.id);
    onSelect(session.id);
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    onViewDetails(session);
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${isSelected ? 'border-[color:var(--theme-primary)]' : 'border-gray-200'} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      role="button"
      aria-label={`Sélectionner la session ${session.theme}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 mont-font truncate">{session.theme || 'Session sans titre'}</h3>
          {isSelected && <CheckCircle size={20} className="text-[color:var(--theme-primary)]" />}
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-500" />
            <p className="text-sm text-gray-600 mont-font">{formatDateRange(session.datedebut, session.datefin)}</p>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin size={16} className="text-gray-500" />
            <p className="text-sm text-gray-600 mont-font">{session.lieu || 'Lieu non spécifié'}</p>
          </div>
          <div className="flex items-start space-x-2">
            <BookOpen size={16} className="text-gray-500" />
            <p className="text-sm text-gray-600 mont-font">{session.objectifs || 'Objectifs non spécifiés'}</p>
          </div>
          <div className="flex items-start space-x-2">
            <BookOpen size={16} className="text-gray-500" />
            <p className="text-sm text-gray-600 mont-font">{session.apport || 'Apport non spécifié'}</p>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign size={16} className="text-gray-500" />
            <p className="text-sm text-gray-600 mont-font">{session.prix ? `${session.prix.toFixed(2)} €` : 'Prix non spécifié'}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Globe size={16} className="text-gray-500" />
            <p className="text-sm text-gray-600 mont-font">{session.mode || 'Mode non spécifié'}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Building size={16} className="text-gray-500" />
            <p className="text-sm text-gray-600 mont-font">{session.cabinetId ? `Cabinet ID: ${session.cabinetId}` : 'Cabinet non spécifié'}</p>
          </div>
          <div className="border-t border-gray-200 pt-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsFormateursOpen(!isFormateursOpen); }}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mont-font hover:text-[color:var(--theme-primary)]"
            >
              <span>Formateurs ({session.formateurs?.length || 0})</span>
              {isFormateursOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isFormateursOpen && (
              <div className="mt-2 space-y-2 animate-fadeIn">
                {session.formateurs?.length > 0 ? (
                  session.formateurs.map((formateur) => (
                    <div key={formateur.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mont-font">{formateur.name}</p>
                      <p className="text-xs text-gray-600 mont-font">{formateur.email}</p>
                      <p className="text-xs text-gray-600 mont-font">{formateur.phone}</p>
                      <p className="text-xs text-gray-600 mont-font">{formateur.specialization}</p>
                      <p className="text-xs text-gray-600 mont-font">{formateur.bio}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 mont-font italic">Aucun formateur spécifié</p>
                )}
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 pt-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsProgrammesOpen(!isProgrammesOpen); }}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mont-font hover:text-[color:var(--theme-primary)]"
            >
              <span>Programmes ({session.programmes?.length || 0})</span>
              {isProgrammesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isProgrammesOpen && (
              <div className="mt-2 space-y-2 animate-fadeIn">
                {session.programmes?.length > 0 ? (
                  session.programmes.map((programme) => (
                    <div key={programme.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mont-font">{programme.titre}</p>
                      <p className="text-xs text-gray-600 mont-font">Durée: {programme.duree} heures</p>
                      <p className="text-xs text-gray-600 mont-font">Heures par jour: {programme.nbrdheureparjour}</p>
                      <p className="text-xs text-gray-600 mont-font">Horaire: {formatTime(programme.heuredebut)} - {formatTime(programme.heurefin)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 mont-font italic">Aucun programme spécifié</p>
                )}
              </div>
            )}
          </div>
          <div className="mt-4">{getAfficheContent()}</div>
          <div className="flex space-x-4 mt-4">
            <button
              className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-200"
              onClick={handleViewDetails}
              aria-label="Voir les détails de la session"
              title="Voir détails"
            >
              <Info size={18} />
            </button>
            {!disabled && (
              <button
                className="p-2 bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white rounded-full hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-all duration-200"
                onClick={handleSelect}
                aria-label="Sélectionner la session"
                title="Sélectionner"
              >
                <CheckCircle size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// DemandeCreateForm component
const DemandeCreateForm = ({ sessions, onSubmit, isLoading, formError }) => {
  const { theme } = useSelector((state) => state.theme);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDetailsSession, setSelectedDetailsSession] = useState(null);
  const [errors, setErrors] = useState({ sessionId: null });

  const primaryColor = themeColors[theme]?.primary || '#132977';
  const secondaryColor = themeColors[theme]?.secondary || '#007aff';

  const handleSelect = useCallback((sessionId) => {
    const id = Number(sessionId);
    setSelectedSessionId(id);
    setErrors({ sessionId: null });
    setIsConfirmationOpen(true);
    console.log('DemandeCreateForm selected session ID:', id);
  }, []);

  const handleViewDetails = useCallback((session) => {
    setSelectedDetailsSession(session);
    setIsDetailsOpen(true);
  }, []);

  const handleConfirm = () => {
    if (!selectedSessionId) {
      setErrors({ sessionId: 'Veuillez sélectionner une session' });
      console.log('Confirmation failed: No session selected');
      setIsConfirmationOpen(false);
      return;
    }
    onSubmit({ sessionId: selectedSessionId });
    setIsConfirmationOpen(false);
  };

  const handleCancel = () => {
    setSelectedSessionId(null);
    setIsConfirmationOpen(false);
  };

  const selectedSession = sessions.find(s => s.id === selectedSessionId);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
      <div className="border-l-4 border-[color:var(--theme-primary)] pl-4 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1 mont-font">Nouvelle demande</h3>
        <p className="text-gray-600 mont-font">Sélectionnez une session pour votre demande</p>
        {selectedSessionId && (
          <p className="text-sm text-[color:var(--theme-primary)] mont-font">
            Session sélectionnée: {selectedSession?.theme || 'Inconnu'} (ID: {selectedSessionId})
          </p>
        )}
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isSelected={selectedSessionId === session.id}
              onSelect={handleSelect}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
        {errors.sessionId && (
          <div className="border-l-4 border-red-500 p-4 rounded-lg bg-red-50 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <AlertCircle size={18} className="text-red-700" />
              <p className="text-red-700 mont-font">{errors.sessionId}</p>
            </div>
          </div>
        )}
        {formError && (
          <div className="border-l-4 border-red-500 p-4 rounded-lg bg-red-50 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <AlertCircle size={18} className="text-red-700" />
              <p className="text-red-700 mont-font">{formError}</p>
            </div>
          </div>
        )}
      </div>
      <SessionDetailsModal
        session={selectedDetailsSession}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        theme={theme}
      />
      <ConfirmationModal
        session={selectedSession}
        isOpen={isConfirmationOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        theme={theme}
        isLoading={isLoading}
      />
    </div>
  );
};

// DemandeEditForm component
const DemandeEditForm = ({ demande, sessions, onSubmit, onCancel, isLoading, formError }) => {
  const { theme } = useSelector((state) => state.theme);
  const [selectedSessionId, setSelectedSessionId] = useState(demande.sessionId || null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDetailsSession, setSelectedDetailsSession] = useState(null);
  const [errors, setErrors] = useState({ sessionId: null });

  const primaryColor = themeColors[theme]?.primary || '#132977';
  const secondaryColor = themeColors[theme]?.secondary || '#007aff';

  const handleSelect = useCallback((sessionId) => {
    const id = Number(sessionId);
    setSelectedSessionId(id);
    setErrors({ sessionId: null });
    console.log('DemandeEditForm selected session ID:', id);
  }, []);

  const handleViewDetails = useCallback((session) => {
    setSelectedDetailsSession(session);
    setIsDetailsOpen(true);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSessionId) {
      setErrors({ sessionId: 'Veuillez sélectionner une session' });
      console.log('Form submission failed: No session selected');
      return;
    }
    console.log('Submitting edit demande with sessionId:', selectedSessionId);
    onSubmit({ sessionId: selectedSessionId });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200">
      <div className="border-l-4 border-[color:var(--theme-primary)] pl-4 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1 mont-font">Modifier la demande #{demande.id}</h3>
        <p className="text-gray-600 mont-font">Mettez à jour la session de la demande</p>
        {selectedSessionId && (
          <p className="text-sm text-[color:var(--theme-primary)] mont-font">
            Session sélectionnée: {sessions.find(s => s.id === selectedSessionId)?.theme || 'Inconnu'} (ID: {selectedSessionId})
          </p>
        )}
      </div>
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isSelected={selectedSessionId === session.id}
              onSelect={handleSelect}
              onViewDetails={handleViewDetails}
              disabled={demande.status !== 'PENDING'}
            />
          ))}
        </div>
        {errors.sessionId && (
          <div className="border-l-4 border-red-500 p-4 rounded-lg bg-red-50 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <AlertCircle size={18} className="text-red-700" />
              <p className="text-red-700 mont-font">{errors.sessionId}</p>
            </div>
          </div>
        )}
        {formError && (
          <div className="border-l-4 border-red-500 p-4 rounded-lg bg-red-50 animate-fadeIn">
            <div className="flex items-center space-x-2">
              <AlertCircle size={18} className="text-red-700" />
              <p className="text-red-700 mont-font">{formError}</p>
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-200"
            aria-label="Annuler la modification"
            title="Annuler"
          >
            <X size={18} />
          </button>
          <button
            type="submit"
            disabled={isLoading || !selectedSessionId || demande.status !== 'PENDING'}
            className="p-2 bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] text-white rounded-full hover:from-[color:var(--theme-secondary)] hover:to-[color:var(--theme-primary)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Mettre à jour la demande"
            title="Mettre à jour"
          >
            {isLoading ? <LoadingSpinner /> : <Save size={18} />}
          </button>
        </div>
      </form>
      <SessionDetailsModal
        session={selectedDetailsSession}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        theme={theme}
      />
    </div>
  );
};

// UserDemandeManager component
const UserDemandeManager = () => {
  const navigate = useNavigate();
  const { theme } = useSelector((state) => state.theme);
  const token = useSelector((state) => state.auth.token);
  const userId = useSelector((state) => state.auth.user?.id);
  const { data: sessions = [], isLoading: sessionsLoading, error: sessionsError } = useAllSessionsWithoutSort();
  const { data: demandes = [], isLoading: demandesLoading, error: demandesError } = useDemandesByUserId(userId);
  const createDemande = useCreateDemande();
  const updateDemande = useUpdateDemande();
  const deleteDemande = useDeleteDemande();
  const [editingDemande, setEditingDemande] = useState(null);
  const [formError, setFormError] = useState(null);

  const primaryColor = themeColors[theme]?.primary || '#132977';
  const secondaryColor = themeColors[theme]?.secondary || '#007aff';

  const handleCreateSubmit = async (formData) => {
    if (!token || !userId) {
      setFormError('Authentification requise. Veuillez vous connecter.');
      console.log('Form submission failed: Missing token or userId');
      toast.error('Authentification requise. Veuillez vous connecter.');
      return;
    }

    if (!formData.sessionId || isNaN(formData.sessionId)) {
      setFormError('ID de session invalide.');
      console.log('Form submission failed: Invalid sessionId', formData.sessionId);
      toast.error('Erreur: ID de session invalide.');
      return;
    }

    try {
      console.log('Sending create demande with data:', { userId, sessionId: formData.sessionId, status: 'PENDING' });
      await createDemande.mutateAsync(
        {
          userId,
          sessionId: formData.sessionId,
          status: 'PENDING',
        },
        {
          onSuccess: () => {
            toast.success('Demande de formation envoyée avec succès !');
            navigate('/demande');
          },
          onError: (error) => {
            const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'envoi de la demande';
            setFormError(errorMessage);
            console.log('Create demande error:', error);
            toast.error(errorMessage);
          },
        }
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'envoi de la demande';
      setFormError(errorMessage);
      console.log('Create demande catch error:', error);
      toast.error(errorMessage);
    }
  };

  const handleEditSubmit = async (formData) => {
    if (!token || !userId) {
      setFormError('Authentification requise. Veuillez vous connecter.');
      console.log('Form submission failed: Missing token or userId');
      toast.error('Authentification requise. Veuillez vous connecter.');
      return;
    }

    if (!formData.sessionId || isNaN(formData.sessionId)) {
      setFormError('ID de session invalide.');
      console.log('Form submission failed: Invalid sessionId', formData.sessionId);
      toast.error('Erreur: ID de session invalide.');
      return;
    }

    try {
      console.log('Sending update demande with data:', { id: editingDemande.id, data: { userId, sessionId: formData.sessionId, status: editingDemande.status } });
      await updateDemande.mutateAsync(
        {
          id: editingDemande.id,
          data: {
            userId,
            sessionId: formData.sessionId,
            status: editingDemande.status,
          },
        },
        {
          onSuccess: () => {
            toast.success('Demande mise à jour avec succès !');
            setEditingDemande(null);
          },
          onError: (error) => {
            const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour de la demande';
            setFormError(errorMessage);
            console.log('Update demande error:', error);
            toast.error(errorMessage);
          },
        }
      );
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la mise à jour de la demande';
      setFormError(errorMessage);
      console.log('Update demande catch error:', error);
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (demandeId) => {
    if (!token || !userId) {
      setFormError('Authentification requise. Veuillez vous connecter.');
      console.log('Delete failed: Missing token or userId');
      toast.error('Authentification requise. Veuillez vous connecter.');
      return;
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) {
      try {
        console.log('Deleting demande with ID:', demandeId);
        await deleteDemande.mutateAsync(
          demandeId,
          {
            onSuccess: () => {
              toast.success('Demande supprimée avec succès !');
            },
            onError: (error) => {
              const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la suppression de la demande';
              toast.error(errorMessage);
              console.log('Delete demande error:', error);
            },
          }
        );
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de la suppression de la demande';
        toast.error(errorMessage);
        console.log('Delete demande catch error:', error);
      }
    }
  };

  if (sessionsLoading || demandesLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center mt-[var(--topbar-height)]">
        <LoadingSpinner size={24} />
      </div>
    );
  }

  if (sessionsError || demandesError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center mt-[var(--topbar-height)]">
        <div className="border-l-4 border-red-500 p-4 rounded-lg bg-red-50 animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertCircle size={18} className="text-red-700" />
            <p className="text-red-700 mont-font">{sessionsError?.message || demandesError?.message || 'Erreur inconnue'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
            --navbar-width: 256px;
            --topbar-height: 64px;
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
          .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
          }
          @media (max-width: 1024px) {
            .content-container {
              margin-left: 0 !important;
              width: 100% !important;
            }
          }
        `}
      </style>
      <div className="content-container flex-1 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8 ml-[var(--navbar-width)] max-w-[calc(100%-var(--navbar-width))] mt-[var(--topbar-height)]">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[color:var(--theme-primary)] to-[color:var(--theme-secondary)] px-8 py-12 rounded-t-2xl">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Calendar size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mont-font">Gérer mes demandes de formation</h1>
                <p className="text-white/80 mt-2 mont-font text-lg">Explorez les sessions disponibles et gérez vos demandes</p>
              </div>
            </div>
          </div>

          <DemandeCreateForm
            sessions={sessions}
            onSubmit={handleCreateSubmit}
            isLoading={createDemande.isLoading}
            formError={formError}
          />

          {editingDemande && (
            <DemandeEditForm
              demande={editingDemande}
              sessions={sessions}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingDemande(null)}
              isLoading={updateDemande.isLoading}
              formError={formError}
            />
          )}

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="border-l-4 border-[color:var(--theme-primary)] pl-4 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1 mont-font">Mes demandes</h3>
              <p className="text-gray-600 mont-font">Liste de vos demandes de formation</p>
            </div>
            {demandes.length === 0 ? (
              <p className="text-gray-600 mont-font">Aucune demande trouvée.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider mont-font">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider mont-font">Session</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider mont-font">Statut</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider mont-font">Date de création</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider mont-font">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {demandes.map((demande) => {
                      const session = sessions.find((s) => s.id === demande.sessionId);
                      return (
                        <tr key={demande.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 mont-font">{demande.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 mont-font">
                            {session?.theme || `Session du ${session ? new Date(session.datedebut).toLocaleDateString('fr-FR') : 'Inconnu'}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm mont-font">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                demande.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                demande.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}
                            >
                              {demande.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 mont-font">
                            {new Date(demande.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {demande.status === 'PENDING' && (
                              <button
                                onClick={() => setEditingDemande(demande)}
                                className="text-[color:var(--theme-primary)] hover:text-[color:var(--theme-secondary)] mr-4"
                                aria-label="Modifier la demande"
                                title="Modifier"
                              >
                                <Edit size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(demande.id)}
                              className="text-red-600 hover:text-red-800"
                              disabled={deleteDemande.isLoading}
                              aria-label="Supprimer la demande"
                              title="Supprimer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDemandeManager;