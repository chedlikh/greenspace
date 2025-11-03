import React, { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { useQueryClient } from '@tanstack/react-query';
import {
  useCabinetById,
  useUnassignSessionFromCabinet,
  useAllSessionsWithoutSort,
  useCreateSession,
  useAssignSessionToCabinet,
  useNotAssignedProgrammes,
  useCreateProgramme,
  useAssignProgrammeToSession,
  useAllFormateurs,
  useCreateFormateur,
  useAssignFormateurToSession,
  useAssignedSessionsForCabinet,
  useAssignMultipleProgrammesToSession,
  useSessionsByFormateur,
  useSessionsByProgramme,
  useCloneSession,
} from '../../../../services/formation';
import { Book, Edit, ChevronDown, ChevronUp, Trash, PlusCircle } from "lucide-react";
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { toast } from "react-toastify";

// Update the fetchNotAssignedProgrammes function to use the correct endpoint
export const fetchNotAssignedProgrammes = () => 
  fetchData(`/api/sessions/programmes/not-assigned`);

const themeColors = {
  red: {
    primary: "#ff3b30",
    secondary: "#ff2d55",
    bgLight: "#fef2f2",
    bgDark: "#3f0a0a",
    textLight: "#1f2937",
    textDark: "#f3f4f6",
    border: "#344054",
  },
  green: {
    primary: "#4cd964",
    secondary: "#34c759",
    bgLight: "#f0fdf4",
    bgDark: "#052e16",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    border: "#344054",
  },
  blue: {
    primary: "#132977",
    secondary: "#007aff",
    bgLight: "#eff6ff",
    bgDark: "#1e3a8a",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    border: "#344054",
  },
  pink: {
    primary: "#ff2d55",
    secondary: "#ff69b4",
    bgLight: "#fff1f2",
    bgDark: "#3f0713",
    textLight: "#1f2937",
    textDark: "#f3f4f6",
    border: "#344054",
  },
  yellow: {
    primary: "#ffcc00",
    secondary: "#ff9500",
    bgLight: "#fefce8",
    bgDark: "#3f2c00",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    border: "#344054",
  },
  orange: {
    primary: "#ff9500",
    secondary: "#ff7f50",
    bgLight: "#fff7eb",
    bgDark: "#3f2d0f",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    border: "#344054",
  },
  gray: {
    primary: "#8e8e93",
    secondary: "#a9a9a9",
    bgLight: "#f9fafb",
    bgDark: "#374151",
    textLight: "#1f2937",
    textDark: "#d1d5db",
    border: "#344054",
  },
  brown: {
    primary: "#D2691E",
    secondary: "#8B4513",
    bgLight: "#fef7e7",
    bgDark: "#2f1c0a",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    border: "#344054",
  },
  darkgreen: {
    primary: "#228B22",
    secondary: "#006400",
    bgLight: "#f0fdf4",
    bgDark: "#092e16",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    border: "#344054",
  },
  deeppink: {
    primary: "#FFC0CB",
    secondary: "#FF69B4",
    bgLight: "#fff1f2",
    bgDark: "#3f0f1e",
    textLight: "#1f2937",
    textDark: "#f3f4f6",
    border: "#344054",
  },
  cadetblue: {
    primary: "#5f9ea0",
    secondary: "#4682b4",
    bgLight: "#f0f9ff",
    bgDark: "#1c2f3a",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    border: "#344054",
  },
  darkorchid: {
    primary: "#9932cc",
    secondary: "#9400d3",
    bgLight: "#f5f3ff",
    bgDark: "#2e1a3f",
    textLight: "#1f2937",
    textDark: "#e5e7eb",
    border: "#344054",
  },
};

const CabinetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, darkMode } = useSelector((state) => state.theme);
  const { data: cabinet, isLoading: cabinetLoading, error: cabinetError } = useCabinetById(id);
  const { data: assignedSessions = [], isLoading: sessionsLoading, error: sessionsError } = useAssignedSessionsForCabinet(id);
  const { data: allSessions = [], isLoading: allSessionsLoading } = useAllSessionsWithoutSort();
  const unassignSession = useUnassignSessionFromCabinet();
  const createSession = useCreateSession();
  const assignSessionToCabinet = useAssignSessionToCabinet();
  const createProgramme = useCreateProgramme();
  const assignProgrammeToSession = useAssignProgrammeToSession();
  const assignMultipleProgrammesToSession = useAssignMultipleProgrammesToSession();
  const { data: formateurs = [], isLoading: formateursLoading } = useAllFormateurs();
  const createFormateur = useCreateFormateur();
  const assignFormateurToSession = useAssignFormateurToSession();
  const cloneSession = useCloneSession();
  const [expandedSections, setExpandedSections] = useState({});
  const [newSession, setNewSession] = useState({
    datedebut: "",
    datefin: "",
    objectifs: "",
    apport: "",
    affiche: "",
    theme: "",
    prix: "",
    mode: "ONLINE",
    cabinetId: id,
  });
  const [newProgramme, setNewProgramme] = useState({
    titre: "",
    duree: "",
    nbrdheureparjour: "",
    heuredebut: "",
    heurefin: "",
  });
  const [newFormateur, setNewFormateur] = useState({
    name: "",
    email: "",
  });
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedProgramme, setSelectedProgramme] = useState({});
  const [selectedFormateur, setSelectedFormateur] = useState({});
  const [selectedProgrammes, setSelectedProgrammes] = useState({});
  const [selectedFormateurId, setSelectedFormateurId] = useState("");
  const [selectedProgrammeId, setSelectedProgrammeId] = useState("");
  const [expandedSearchSections, setExpandedSearchSections] = useState({});

  // Filter sessions to show only those not assigned to any cabinet
  const availableSessions = allSessions.filter(
    (session) => !session.cabinetId
  );

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const toggleSearchSection = (sectionId) => {
    setExpandedSearchSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleUnassignSession = (sessionId) => {
    unassignSession.mutate(
      { cabinetId: id, sessionId },
      {
        onSuccess: () => {
          toast.success("Session désassignée avec succès !");
          queryClient.invalidateQueries({ queryKey: ['cabinets', id] });
          queryClient.invalidateQueries({ queryKey: ['sessions', id] });
          queryClient.invalidateQueries({ queryKey: ['sessions', 'unsorted'] });
        },
        onError: (error) => toast.error(error.message || "Erreur lors de la désassignation de la session"),
      }
    );
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    createSession.mutate(newSession, {
      onSuccess: (data) => {
        toast.success("Session créée avec succès !");
        assignSessionToCabinet.mutate(
          { cabinetId: id, sessionId: data.id },
          {
            onSuccess: () => {
              toast.success("Session assignée au cabinet avec succès !");
              setNewSession({
                datedebut: "",
                datefin: "",
                objectifs: "",
                apport: "",
                affiche: "",
                theme: "",
                prix: "",
                mode: "ONLINE",
                cabinetId: id,
              });
              queryClient.invalidateQueries({ queryKey: ['sessions', id] });
              queryClient.invalidateQueries({ queryKey: ['sessions', 'unsorted'] });
            },
            onError: (error) => toast.error(error.message || "Erreur lors de l'assignation de la session"),
          }
        );
      },
      onError: (error) => toast.error(error.message || "Erreur lors de la création de la session"),
    });
  };

  const handleAssignSession = () => {
    if (!selectedSession) {
      toast.error("Veuillez sélectionner une session.");
      return;
    }
    assignSessionToCabinet.mutate(
      { cabinetId: id, sessionId: selectedSession },
      {
        onSuccess: () => {
          toast.success("Session assignée avec succès !");
          setSelectedSession("");
          queryClient.invalidateQueries({ queryKey: ['sessions', id] });
          queryClient.invalidateQueries({ queryKey: ['sessions', 'unsorted'] });
        },
        onError: (error) => toast.error(error.message || "Erreur lors de l'assignation de la session"),
      }
    );
  };

  const handleCreateProgramme = (sessionId, e) => {
    e.preventDefault();
    createProgramme.mutate(
      { ...newProgramme, sessionId },
      {
        onSuccess: (data) => {
          toast.success("Programme créé avec succès !");
          setNewProgramme({ titre: "", duree: "", nbrdheureparjour: "", heuredebut: "", heurefin: "" });
          queryClient.invalidateQueries({ queryKey: ['sessions', id] });
          queryClient.invalidateQueries({ queryKey: ['programmes'] });
          queryClient.invalidateQueries({ queryKey: ['not-assigned-programmes'] });
        },
        onError: (error) => toast.error(error.message || "Erreur lors de la création du programme"),
      }
    );
  };

  const handleAssignProgramme = (sessionId) => {
    if (!selectedProgramme[sessionId]) {
      toast.error("Veuillez sélectionner un programme.");
      return;
    }
    assignProgrammeToSession.mutate(
      { sessionId, programmeId: selectedProgramme[sessionId] },
      {
        onSuccess: () => {
          toast.success("Programme assigné avec succès !");
          setSelectedProgramme((prev) => ({ ...prev, [sessionId]: "" }));
          queryClient.invalidateQueries({ queryKey: ['sessions', id] });
          queryClient.invalidateQueries({ queryKey: ['programmes'] });
          queryClient.invalidateQueries({ queryKey: ['not-assigned-programmes'] });
        },
        onError: (error) => toast.error(error.message || "Erreur lors de l'assignation du programme"),
      }
    );
  };

  const handleAssignMultipleProgrammes = (sessionId) => {
    if (!selectedProgrammes[sessionId] || selectedProgrammes[sessionId].length === 0) {
      toast.error("Veuillez sélectionner au moins un programme.");
      return;
    }
    assignMultipleProgrammesToSession.mutate(
      { sessionId, programmeIds: selectedProgrammes[sessionId] },
      {
        onSuccess: () => {
          toast.success("Programmes assignés avec succès !");
          setSelectedProgrammes((prev) => ({ ...prev, [sessionId]: [] }));
          queryClient.invalidateQueries({ queryKey: ['sessions', id] });
          queryClient.invalidateQueries({ queryKey: ['programmes'] });
          queryClient.invalidateQueries({ queryKey: ['not-assigned-programmes'] });
        },
        onError: (error) => toast.error(error.message || "Erreur lors de l'assignation des programmes"),
      }
    );
  };

  const handleCreateFormateur = (sessionId, e) => {
    e.preventDefault();
    createFormateur.mutate(newFormateur, {
      onSuccess: (data) => {
        toast.success("Formateur créé avec succès !");
        assignFormateurToSession.mutate(
          { sessionId, formateurId: data.id },
          {
            onSuccess: () => {
              toast.success("Formateur assigné à la session avec succès !");
              setNewFormateur({ name: "", email: "" });
              queryClient.invalidateQueries({ queryKey: ['sessions', id] });
              queryClient.invalidateQueries({ queryKey: ['formateurs'] });
            },
            onError: (error) => toast.error(error.message || "Erreur lors de l'assignation du formateur"),
          }
        );
      },
      onError: (error) => toast.error(error.message || "Erreur lors de la création du formateur"),
    });
  };

  const handleAssignFormateur = (sessionId) => {
    if (!selectedFormateur[sessionId]) {
      toast.error("Veuillez sélectionner un formateur.");
      return;
    }
    assignFormateurToSession.mutate(
      { sessionId, formateurId: selectedFormateur[sessionId] },
      {
        onSuccess: () => {
          toast.success("Formateur assigné avec succès !");
          setSelectedFormateur((prev) => ({ ...prev, [sessionId]: "" }));
          queryClient.invalidateQueries({ queryKey: ['sessions', id] });
          queryClient.invalidateQueries({ queryKey: ['formateurs'] });
        },
        onError: (error) => toast.error(error.message || "Erreur lors de l'assignation du formateur"),
      }
    );
  };

  const handleCloneSession = (sessionId) => {
    cloneSession.mutate(sessionId, {
      onSuccess: () => {
        toast.success("Session clonée avec succès !");
        queryClient.invalidateQueries({ queryKey: ['sessions', id] });
        queryClient.invalidateQueries({ queryKey: ['sessions', 'unsorted'] });
      },
      onError: (error) => toast.error(error.message || "Erreur lors du clonage de la session"),
    });
  };

  const handleSearchSessionsByFormateur = () => {
    if (!selectedFormateurId) {
      toast.error("Veuillez sélectionner un formateur.");
      return;
    }
  };

  const handleSearchSessionsByProgramme = () => {
    if (!selectedProgrammeId) {
      toast.error("Veuillez sélectionner un programme.");
      return;
    }
  };

  // Theme colors
  const primaryColor = themeColors[theme]?.primary || "#4cd964";
  const secondaryColor = themeColors[theme]?.secondary || "#34c759]";
  const bgColor = darkMode ? themeColors[theme]?.bgDark || "#374151" : themeColors[theme]?.bgLight || "#f9fafb";
  const textColor = darkMode ? themeColors[theme]?.textDark || "#d1d5db" : themeColors[theme]?.textLight || "#1f2937";
  const borderColor = themeColors[theme]?.border || "#344054";

  // ProgrammeSelection component
  const ProgrammeSelection = ({ sessionId }) => {
    const { data: notAssignedProgrammes = [], isLoading, error } = useNotAssignedProgrammes();

    if (isLoading) {
      return <div className="text-sm text-gray-500">Chargement des programmes...</div>;
    }

    if (error) {
      return <ErrorMessage message={error.message || "Erreur lors du chargement des programmes"} />;
    }

    if (!notAssignedProgrammes.length) {
      return <div className="text-sm text-gray-500">Aucun programme non assigné disponible.</div>;
    }

    return (
      <>
        <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>
          Assigner un Programme Unique
        </h4>
        <select
          value={selectedProgramme[sessionId] || ""}
          onChange={(e) => setSelectedProgramme({ ...selectedProgramme, [sessionId]: e.target.value })}
          className="input-field mb-4"
        >
          <option value="">Sélectionner un programme</option>
          {notAssignedProgrammes.map((programme) => (
            <option key={programme.id} value={programme.id}>
              {programme.titre || `Programme ${programme.id}`}
            </option>
          ))}
        </select>
        <button
          onClick={() => handleAssignProgramme(sessionId)}
          className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors mb-4"
          disabled={!selectedProgramme[sessionId]}
        >
          Assigner le Programme
        </button>
        <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>
          Assigner Plusieurs Programmes
        </h4>
        <div className="mb-4 max-h-40 overflow-y-auto border border-[color:var(--theme-border)] rounded-lg p-2">
          {notAssignedProgrammes.map((programme) => (
            <div key={programme.id} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectedProgrammes[sessionId]?.includes(programme.id) || false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSelectedProgrammes((prev) => ({
                    ...prev,
                    [sessionId]: checked
                      ? [...(prev[sessionId] || []), programme.id]
                      : (prev[sessionId] || []).filter((id) => id !== programme.id),
                  }));
                }}
                className="mr-2"
              />
              <label className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                {programme.titre || `Programme ${programme.id}`}
              </label>
            </div>
          ))}
        </div>
        <button
          onClick={() => handleAssignMultipleProgrammes(sessionId)}
          className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
          disabled={!selectedProgrammes[sessionId]?.length}
        >
          Assigner les Programmes Sélectionnés
        </button>
      </>
    );
  };

  // SearchSessions component
  const SearchSessions = () => {
    const { data: notAssignedProgrammes = [] } = useNotAssignedProgrammes();
    const { data: sessionsByFormateur = [], isLoading: formateurSessionsLoading } = useSessionsByFormateur(selectedFormateurId);
    const { data: sessionsByProgramme = [], isLoading: programmeSessionsLoading } = useSessionsByProgramme(selectedProgrammeId);

    return (
      <div className={`mb-8 bg-${darkMode ? "gray-800" : "white"} rounded-lg shadow-md border ${
        darkMode ? "border-gray-600" : "border-gray-200"
      } p-6 card-hover`}>
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSearchSection("searchSessions")}
        >
          <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
            Rechercher des Sessions
          </h2>
          {expandedSearchSections["searchSessions"] ? (
            <ChevronUp className={`w-6 h-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`} />
          ) : (
            <ChevronDown className={`w-6 h-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`} />
          )}
        </div>
        {expandedSearchSections["searchSessions"] && (
          <div className="mt-4">
            <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-4`}>
              Rechercher par Formateur
            </h3>
            <select
              value={selectedFormateurId}
              onChange={(e) => setSelectedFormateurId(e.target.value)}
              className="input-field mb-4"
            >
              <option value="">Sélectionner un formateur</option>
              {formateurs.map((formateur) => (
                <option key={formateur.id} value={formateur.id}>
                  {formateur.name || `Formateur ${formateur.id}`}
                </option>
              ))}
            </select>
            {formateurSessionsLoading ? (
              <div className="text-sm text-gray-500">Chargement des sessions...</div>
            ) : (
              <div className="mb-4">
                {sessionsByFormateur.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {sessionsByFormateur.map((session) => (
                      <li key={session.id} className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {session.theme || `Session ${session.id}`} (Du {new Date(session.datedebut).toLocaleDateString('fr-FR')} au {new Date(session.datefin).toLocaleDateString('fr-FR')})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Aucune session trouvée pour ce formateur.</p>
                )}
              </div>
            )}
            <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mt-6 mb-4`}>
              Rechercher par Programme
            </h3>
            <select
              value={selectedProgrammeId}
              onChange={(e) => setSelectedProgrammeId(e.target.value)}
              className="input-field mb-4"
            >
              <option value="">Sélectionner un programme</option>
              {notAssignedProgrammes.map((programme) => (
                <option key={programme.id} value={programme.id}>
                  {programme.titre || `Programme ${programme.id}`}
                </option>
              ))}
            </select>
            {programmeSessionsLoading ? (
              <div className="text-sm text-gray-500">Chargement des sessions...</div>
            ) : (
              <div className="mb-4">
                {sessionsByProgramme.length > 0 ? (
                  <ul className="list-disc pl-5">
                    {sessionsByProgramme.map((session) => (
                      <li key={session.id} className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        {session.theme || `Session ${session.id}`} (Du {new Date(session.datedebut).toLocaleDateString('fr-FR')} au {new Date(session.datefin).toLocaleDateString('fr-FR')})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Aucune session trouvée pour ce programme.</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (cabinetLoading || sessionsLoading || allSessionsLoading || formateursLoading) {
    return (
      <div
        className={`min-h-screen p-6 flex justify-center items-center ${
          darkMode
            ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700"
            : "bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100"
        }`}
        style={{ marginTop: "80px", marginLeft: "250px" }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (cabinetError || sessionsError) {
    return (
      <div
        className={`min-h-screen p-6 flex flex-col items-center justify-center ${
          darkMode
            ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700"
            : "bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100"
        }`}
        style={{ marginTop: "80px", marginLeft: "250px" }}
      >
        <ErrorMessage message={cabinetError?.message || sessionsError?.message || "Erreur inconnue"} />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-6 ${
        darkMode
          ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700"
          : "bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100"
      }`}
      style={{ marginTop: "80px", marginLeft: "250px" }}
    >
      <style>
        {`
          :root {
            --theme-primary: ${primaryColor};
            --theme-secondary: ${secondaryColor};
            --theme-bg: ${bgColor};
            --theme-text: ${textColor};
            --theme-border: ${borderColor};
          }
          .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            border-image: linear-gradient(45deg, var(--theme-primary), var(--theme-secondary)) 1;
          }
          .input-field {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--theme-border);
            border-radius: 8px;
            background: ${darkMode ? '#374151' : '#ffffff'};
            color: ${darkMode ? '#e5e7eb' : '#1f2937'};
          }
          .input-field:focus {
            outline: none;
            border-color: var(--theme-primary);
            box-shadow: 0 0 0 3px rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.3);
          }
        `}
      </style>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className={`mb-8 bg-${darkMode ? "gray-800" : "white"} rounded-lg shadow-md border ${
            darkMode ? "border-gray-600" : "border-gray-200"
          } p-6 card-hover`}>
            <div className="flex items-center space-x-3 mb-6">
              <Book className={`w-8 h-8 ${darkMode ? "text-gray-100" : "text-[color:var(--theme-primary)]"}`} />
              <h1 className={`text-3xl font-bold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                {cabinet?.nom || "Cabinet sans nom"}
              </h1>
            </div>
            {cabinet?.logo && (
              <div className="mb-6 flex justify-center">
                <img
                  src={cabinet.logo}
                  alt="Cabinet logo"
                  className="w-32 h-32 rounded-full object-cover border-2 border-[color:var(--theme-border)]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/150';
                  }}
                />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
              <p>
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Nom :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {cabinet?.nom || "Non disponible"}
                </span>
              </p>
              <p>
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Adresse :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {cabinet?.adresse || "Non disponible"}
                </span>
              </p>
              <p>
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Téléphone :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {cabinet?.tel || "Non disponible"}
                </span>
              </p>
              <p>
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Email :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {cabinet?.email || "Non disponible"}
                </span>
              </p>
              <p>
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Catalogue :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {cabinet?.catalogue || "Non disponible"}
                </span>
              </p>
              <p>
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Mots-clés :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {cabinet?.motscles || "Non disponible"}
                </span>
              </p>
              <p className="sm:col-span-2">
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Description :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {cabinet?.description || "Non disponible"}
                </span>
              </p>
            </div>
            <button
              onClick={() => navigate(`/cabinets/${id}/edit`)}
              className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-6 py-3 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
            >
              <Edit className="mr-2 w-5 h-5" /> Modifier le Cabinet
            </button>
          </div>

          {/* Search Sessions */}
          <SearchSessions />

          {/* Assign or Create and Assign Session */}
          <div className={`mb-8 bg-${darkMode ? "gray-800" : "white"} rounded-lg shadow-md border ${
            darkMode ? "border-gray-600" : "border-gray-200"
          } p-6 card-hover`}>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("assignSession")}
            >
              <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                Assigner ou Créer une Session
              </h2>
              {expandedSections["assignSession"] ? (
                <ChevronUp className={`w-6 h-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`} />
              ) : (
                <ChevronDown className={`w-6 h-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`} />
              )}
            </div>
            {expandedSections["assignSession"] && (
              <div className="mt-4">
                <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-4`}>
                  Assigner une Session Existante
                </h3>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="input-field mb-4"
                >
                  <option value="">Sélectionner une session</option>
                  {availableSessions.map((session) => (
                    <option key={session.id} value={session.id}>
                      {session.theme || `Session ${session.id}`} (Du {new Date(session.datedebut).toLocaleDateString('fr-FR')} au {new Date(session.datefin).toLocaleDateString('fr-FR')})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignSession}
                  className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                >
                  Assigner la Session
                </button>
                <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mt-6 mb-4`}>
                  Créer une Nouvelle Session
                </h3>
                <form onSubmit={handleCreateSession} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Date de Début</label>
                    <input
                      type="date"
                      value={newSession.datedebut}
                      onChange={(e) => setNewSession({ ...newSession, datedebut: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Date de Fin</label>
                    <input
                      type="date"
                      value={newSession.datefin}
                      onChange={(e) => setNewSession({ ...newSession, datefin: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Objectifs</label>
                    <input
                      type="text"
                      value={newSession.objectifs}
                      onChange={(e) => setNewSession({ ...newSession, objectifs: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Apport</label>
                    <input
                      type="text"
                      value={newSession.apport}
                      onChange={(e) => setNewSession({ ...newSession, apport: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Affiche (URL)</label>
                    <input
                      type="url"
                      value={newSession.affiche}
                      onChange={(e) => setNewSession({ ...newSession, affiche: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Thème</label>
                    <input
                      type="text"
                      value={newSession.theme}
                      onChange={(e) => setNewSession({ ...newSession, theme: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Prix</label>
                    <input
                      type="number"
                      value={newSession.prix}
                      onChange={(e) => setNewSession({ ...newSession, prix: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Mode</label>
                    <select
                      value={newSession.mode}
                      onChange={(e) => setNewSession({ ...newSession, mode: e.target.value })}
                      className="input-field"
                    >
                      <option value="ONLINE">En ligne</option>
                      <option value="HYBRID">Hybride</option>
                      <option value="IN_PERSON">En personne</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                    >
                      <PlusCircle className="mr-2 w-5 h-5" /> Créer et Assigner la Session
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Sessions List with Detailed Display */}
          {assignedSessions.length > 0 && (
            <div className={`mb-8 bg-${darkMode ? "gray-800" : "white"} rounded-lg shadow-md border ${
              darkMode ? "border-gray-600" : "border-gray-200"
            } p-6 card-hover`}>
              <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"} mb-4`}>
                Sessions Assignées
              </h2>
              {assignedSessions.map((session) => (
                <div key={session.id} className="mb-6 border-b border-[color:var(--theme-border)] pb-4">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection(`session-${session.id}`)}
                  >
                    <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                      {session.theme || `Session ${session.id}`} (Du {new Date(session.datedebut).toLocaleDateString('fr-FR')} au {new Date(session.datefin).toLocaleDateString('fr-FR')})
                    </h3>
                    {expandedSections[`session-${session.id}`] ? (
                      <ChevronUp className={`w-6 h-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`} />
                    ) : (
                      <ChevronDown className={`w-6 h-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`} />
                    )}
                  </div>
                  {expandedSections[`session-${session.id}`] && (
                    <div className="mt-4 pl-4 border-l-2 border-[color:var(--theme-primary)]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Objectifs :</span> {session.objectifs || "Non disponible"}
                        </p>
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Apport :</span> {session.apport || "Non disponible"}
                        </p>
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Prix :</span> {session.prix ? `${session.prix} €` : "Non disponible"}
                        </p>
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Mode :</span> {session.mode || "Non disponible"}
                        </p>
                        {session.affiche && (
                          <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                            <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Affiche :</span>
                            <a href={session.affiche} target="_blank" rel="noopener noreferrer" className="text-[color:var(--theme-primary)] hover:underline">
                              Voir l'affiche
                            </a>
                          </p>
                        )}
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Créé le :</span> {new Date(session.createdAt).toLocaleDateString('fr-FR')}
                        </p>
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Mis à jour le :</span> {new Date(session.updatedAt).toLocaleDateString('fr-FR')}
                        </p>
                      </div>

                      {/* Assigned Programmes */}
                      <div className="mb-4">
                        <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>
                          Programmes Assignés
                        </h4>
                        {session.programmes?.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {session.programmes.map((programme) => (
                              <li key={programme.id} className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{programme.titre || `Programme ${programme.id}`} :</span> 
                                Durée: {programme.duree || "N/A"} heures, {programme.nbrdheureparjour || "N/A"}h/jour, {programme.heuredebut || "N/A"} - {programme.heurefin || "N/A"}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Aucun programme assigné</p>
                        )}
                      </div>

                      {/* Assigned Formateurs */}
                      <div className="mb-4">
                        <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>
                          Formateurs Assignés
                        </h4>
                        {session.formateurs?.length > 0 ? (
                          <ul className="list-disc pl-5">
                            {session.formateurs.map((formateur) => (
                              <li key={formateur.id} className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{formateur.name || `Formateur ${formateur.id}`} :</span> {formateur.email || "Aucun email"}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Aucun formateur assigné</p>
                        )}
                      </div>

                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleUnassignSession(session.id)}
                          className="inline-flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <Trash className="mr-2 w-5 h-5" /> Désassigner
                        </button>
                        <button
                          onClick={() => handleCloneSession(session.id)}
                          className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                        >
                          <PlusCircle className="mr-2 w-5 h-5" /> Cloner la Session
                        </button>
                      </div>

                      {/* Assign or Create Programme */}
                      <div className="mt-6">
                        <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-4`}>
                          Assigner ou Créer un Programme
                        </h4>
                        
                        <ProgrammeSelection sessionId={session.id} />

                        <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mt-6 mb-4`}>
                          Créer un Nouveau Programme
                        </h4>
                        <form onSubmit={(e) => handleCreateProgramme(session.id, e)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Titre</label>
                            <input
                              type="text"
                              value={newProgramme.titre}
                              onChange={(e) => setNewProgramme({ ...newProgramme, titre: e.target.value })}
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Durée (heures)</label>
                            <input
                              type="number"
                              value={newProgramme.duree}
                              onChange={(e) => setNewProgramme({ ...newProgramme, duree: e.target.value })}
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Heures par jour</label>
                            <input
                              type="number"
                              value={newProgramme.nbrdheureparjour}
                              onChange={(e) => setNewProgramme({ ...newProgramme, nbrdheureparjour: e.target.value })}
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Heure de début</label>
                            <input
                              type="time"
                              value={newProgramme.heuredebut}
                              onChange={(e) => setNewProgramme({ ...newProgramme, heuredebut: e.target.value })}
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Heure de fin</label>
                            <input
                              type="time"
                              value={newProgramme.heurefin}
                              onChange={(e) => setNewProgramme({ ...newProgramme, heurefin: e.target.value })}
                              className="input-field"
                              required
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <button
                              type="submit"
                              className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                            >
                              <PlusCircle className="mr-2 w-5 h-5" /> Créer et Assigner le Programme
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Assign or Create Formateur */}
                      <div className="mt-6">
                        <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-4`}>
                          Assigner ou Créer un Formateur
                        </h4>
                        <select
                          value={selectedFormateur[session.id] || ""}
                          onChange={(e) => setSelectedFormateur({ ...selectedFormateur, [session.id]: e.target.value })}
                          className="input-field mb-4"
                        >
                          <option value="">Sélectionner un formateur</option>
                          {formateurs
                            .filter((formateur) => !session.formateurs?.some((f) => f.id === formateur.id))
                            .map((formateur) => (
                              <option key={formateur.id} value={formateur.id}>
                                {formateur.name || `Formateur ${formateur.id}`}
                              </option>
                            ))}
                        </select>
                        <button
                          onClick={() => handleAssignFormateur(session.id)}
                          className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                        >
                          Assigner le Formateur
                        </button>
                        <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mt-6 mb-4`}>
                          Créer un Nouveau Formateur
                        </h4>
                        <form onSubmit={(e) => handleCreateFormateur(session.id, e)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Nom</label>
                            <input
                              type="text"
                              value={newFormateur.name}
                              onChange={(e) => setNewFormateur({ ...newFormateur, name: e.target.value })}
                              className="input-field"
                              required
                            />
                          </div>
                          <div>
                            <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Email</label>
                            <input
                              type="email"
                              value={newFormateur.email}
                              onChange={(e) => setNewFormateur({ ...newFormateur, email: e.target.value })}
                              className="input-field"
                              required
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <button
                              type="submit"
                              className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                            >
                              <PlusCircle className="mr-2 w-5 h-5" /> Créer et Assigner le Formateur
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CabinetDetail;