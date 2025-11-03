import React, { useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { useQueryClient } from '@tanstack/react-query';
import {
  useSessionById,
  useNotAssignedProgrammes,
  useCreateProgramme,
  useAssignProgrammeToSession,
  useAssignMultipleProgrammesToSession,
  useAllFormateurs,
  useCreateFormateur,
  useAssignFormateurToSession,
  useSessionsByFormateur,
  useSessionsByProgramme,
  useDemandesBySessionId,
  useApproveDemande,
  useRejectDemande,
} from '../../../../services/formation';
import { Book, Edit, ChevronDown, ChevronUp, PlusCircle } from "lucide-react";
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import { toast } from "react-toastify";

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
    bgLight: "#fff7f50",
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

const SessionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, darkMode } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const { data: session, isLoading: sessionLoading, error: sessionError } = useSessionById(id);
  const { data: formateurs = [], isLoading: formateursLoading } = useAllFormateurs();
  const { data: demandes = [], isLoading: demandesLoading, error: demandesError } = useDemandesBySessionId(id);
  const createProgramme = useCreateProgramme();
  const assignProgrammeToSession = useAssignProgrammeToSession();
  const assignMultipleProgrammesToSession = useAssignMultipleProgrammesToSession();
  const createFormateur = useCreateFormateur();
  const assignFormateurToSession = useAssignFormateurToSession();
  const approveDemande = useApproveDemande();
  const rejectDemande = useRejectDemande();
  const [expandedSections, setExpandedSections] = useState({});
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
  const [selectedProgramme, setSelectedProgramme] = useState({});
  const [selectedProgrammes, setSelectedProgrammes] = useState({});
  const [selectedFormateur, setSelectedFormateur] = useState({});
  const [selectedFormateurId, setSelectedFormateurId] = useState("");
  const [selectedProgrammeId, setSelectedProgrammeId] = useState("");
  const [expandedSearchSections, setExpandedSearchSections] = useState({});

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

  const handleCreateProgramme = (e) => {
    e.preventDefault();
    createProgramme.mutate(
      { ...newProgramme, sessionId: id },
      {
        onSuccess: () => {
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

  const handleAssignProgramme = () => {
    if (!selectedProgramme[id]) {
      toast.error("Veuillez sélectionner un programme.");
      return;
    }
    assignProgrammeToSession.mutate(
      { sessionId: id, programmeId: selectedProgramme[id] },
      {
        onSuccess: () => {
          toast.success("Programme assigné avec succès !");
          setSelectedProgramme((prev) => ({ ...prev, [id]: "" }));
          queryClient.invalidateQueries({ queryKey: ['sessions', id] });
          queryClient.invalidateQueries({ queryKey: ['programmes'] });
          queryClient.invalidateQueries({ queryKey: ['not-assigned-programmes'] });
        },
        onError: (error) => toast.error(error.message || "Erreur lors de l'assignation du programme"),
      }
    );
  };

  const handleAssignMultipleProgrammes = () => {
    if (!selectedProgrammes[id] || selectedProgrammes[id].length === 0) {
      toast.error("Veuillez sélectionner au moins un programme.");
      return;
    }
    assignMultipleProgrammesToSession.mutate(
      { sessionId: id, programmeIds: selectedProgrammes[id] },
      {
        onSuccess: () => {
          toast.success("Programmes assignés avec succès !");
          setSelectedProgrammes((prev) => ({ ...prev, [id]: [] }));
          queryClient.invalidateQueries({ queryKey: ['sessions', id] });
          queryClient.invalidateQueries({ queryKey: ['programmes'] });
          queryClient.invalidateQueries({ queryKey: ['not-assigned-programmes'] });
        },
        onError: (error) => toast.error(error.message || "Erreur lors de l'assignation des programmes"),
      }
    );
  };

  const handleCreateFormateur = (e) => {
    e.preventDefault();
    createFormateur.mutate(newFormateur, {
      onSuccess: (data) => {
        toast.success("Formateur créé avec succès !");
        assignFormateurToSession.mutate(
          { sessionId: id, formateurId: data.id },
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

  const handleAssignFormateur = () => {
    if (!selectedFormateur[id]) {
      toast.error("Veuillez sélectionner un formateur.");
      return;
    }
    assignFormateurToSession.mutate(
      { sessionId: id, formateurId: selectedFormateur[id] },
      {
        onSuccess: () => {
          toast.success("Formateur assigné avec succès !");
          setSelectedFormateur((prev) => ({ ...prev, [id]: "" }));
          queryClient.invalidateQueries({ queryKey: ['sessions', id] });
          queryClient.invalidateQueries({ queryKey: ['formateurs'] });
        },
        onError: (error) => toast.error(error.message || "Erreur lors de l'assignation du formateur"),
      }
    );
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

  const handleApproveDemande = (demandeId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
      navigate('/login');
      return;
    }
    if (!user?.id) {
      toast.error("Utilisateur non authentifié. Veuillez vous reconnecter.");
      navigate('/login');
      return;
    }
    approveDemande.mutate(
      { id: demandeId, adminId: user.id },
      {
        onSuccess: () => {
          toast.success("Demande approuvée avec succès !");
          queryClient.invalidateQueries({ queryKey: ['demandes', 'session', id] });
        },
        onError: (error) => {
          if (error.message?.includes('401')) {
            toast.error("Session expirée. Veuillez vous reconnecter.");
            navigate('/login');
          } else {
            toast.error(error.message || "Erreur lors de l'approbation de la demande");
          }
        },
      }
    );
  };

  const handleRejectDemande = (demandeId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error("Aucun jeton d'authentification trouvé. Veuillez vous reconnecter.");
      navigate('/login');
      return;
    }
    if (!user?.id) {
      toast.error("Utilisateur non authentifié. Veuillez vous reconnecter.");
      navigate('/login');
      return;
    }
    rejectDemande.mutate(
      { id: demandeId, adminId: user.id },
      {
        onSuccess: () => {
          toast.success("Demande rejetée avec succès !");
          queryClient.invalidateQueries({ queryKey: ['demandes', 'session', id] });
        },
        onError: (error) => {
          if (error.message?.includes('401')) {
            toast.error("Session expirée. Veuillez vous reconnecter.");
            navigate('/login');
          } else {
            toast.error(error.message || "Erreur lors du rejet de la demande");
          }
        },
      }
    );
  };

  const primaryColor = themeColors[theme]?.primary || "#4cd964";
  const secondaryColor = themeColors[theme]?.secondary || "#34c759";
  const bgColor = darkMode ? themeColors[theme]?.bgDark || "#374151" : themeColors[theme]?.bgLight || "#f9fafb";
  const textColor = darkMode ? themeColors[theme]?.textDark || "#d1d5db" : themeColors[theme]?.textLight || "#1f2937";
  const borderColor = themeColors[theme]?.border || "#344054";

  const ProgrammeSelection = () => {
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
          value={selectedProgramme[id] || ""}
          onChange={(e) => setSelectedProgramme({ ...selectedProgramme, [id]: e.target.value })}
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
          onClick={handleAssignProgramme}
          className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors mb-4"
          disabled={!selectedProgramme[id]}
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
                checked={selectedProgrammes[id]?.includes(programme.id) || false}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSelectedProgrammes((prev) => ({
                    ...prev,
                    [id]: checked
                      ? [...(prev[id] || []), programme.id]
                      : (prev[id] || []).filter((id) => id !== programme.id),
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
          onClick={handleAssignMultipleProgrammes}
          className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
          disabled={!selectedProgrammes[id]?.length}
        >
          Assigner les Programmes Sélectionnés
        </button>
      </>
    );
  };

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

  const DemandesSection = () => {
    if (demandesLoading) {
      return <div className="text-sm text-gray-500">Chargement des demandes...</div>;
    }

    if (demandesError) {
      return <ErrorMessage message={demandesError.message || "Erreur lors du chargement des demandes"} />;
    }

    if (!demandes.length) {
      return <div className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>Aucune demande pour cette session.</div>;
    }

    return (
      <div className="mt-4">
        <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>
          Demandes pour cette Session
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <tr>
                <th className={`px-4 py-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>ID</th>
                <th className={`px-4 py-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Utilisateur</th>
                <th className={`px-4 py-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Statut</th>
                <th className={`px-4 py-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Date de Création</th>
                <th className={`px-4 py-2 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((demande) => (
                <tr key={demande.id} className={`${darkMode ? "bg-gray-800" : "bg-white"} border-b ${darkMode ? "border-gray-600" : "border-gray-200"}`}>
                  <td className={`px-4 py-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{demande.id}</td>
                  <td className={`px-4 py-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{demande.userId || "N/A"}</td>
                  <td className={`px-4 py-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{demande.status || "N/A"}</td>
                  <td className={`px-4 py-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    {demande.createdAt ? new Date(demande.createdAt).toLocaleDateString('fr-FR') : "N/A"}
                  </td>
                  <td className="px-4 py-2">
                    {demande.status === "PENDING" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproveDemande(demande.id)}
                          className="bg-[color:var(--theme-primary)] text-white px-3 py-1 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                          disabled={approveDemande.isLoading}
                        >
                          Approuver
                        </button>
                        <button
                          onClick={() => handleRejectDemande(demande.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors"
                          disabled={rejectDemande.isLoading}
                        >
                          Rejeter
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (sessionLoading || formateursLoading || demandesLoading) {
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

  if (sessionError) {
    return (
      <div
        className={`min-h-screen p-6 flex flex-col items-center justify-center ${
          darkMode
            ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700"
            : "bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100"
        }`}
        style={{ marginTop: "80px", marginLeft: "250px" }}
      >
        <ErrorMessage message={sessionError?.message || "Erreur inconnue"} />
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
                {session?.theme || `Session ${id}`}
              </h1>
            </div>
            {session?.affiche && (
              <div className="mb-6 flex justify-center">
                <img
                  src={session.affiche}
                  alt="Session affiche"
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
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Date de Début :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {session?.datedebut ? new Date(session.datedebut).toLocaleDateString('fr-FR') : "Non disponible"}
                </span>
              </p>
              <p>
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Date de Fin :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {session?.datefin ? new Date(session.datefin).toLocaleDateString('fr-FR') : "Non disponible"}
                </span>
              </p>
              <p>
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Prix :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {session?.prix ? `${session.prix} €` : "Non disponible"}
                </span>
              </p>
              <p>
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Mode :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {session?.mode || "Non disponible"}
                </span>
              </p>
              <p className="sm:col-span-2">
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Objectifs :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {session?.objectifs || "Non disponible"}
                </span>
              </p>
              <p className="sm:col-span-2">
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Apport :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {session?.apport || "Non disponible"}
                </span>
              </p>
              {session?.affiche && (
                <p className="sm:col-span-2">
                  <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Affiche :</span>
                  <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                    <a href={session.affiche} target="_blank" rel="noopener noreferrer" className="text-[color:var(--theme-primary)] hover:underline">
                      Voir l'affiche
                    </a>
                  </span>
                </p>
              )}
              <p>
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Créé le :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {session?.createdAt ? new Date(session.createdAt).toLocaleDateString('fr-FR') : "Non disponible"}
                </span>
              </p>
              <p>
                <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Mis à jour le :</span>
                <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {session?.updatedAt ? new Date(session.updatedAt).toLocaleDateString('fr-FR') : "Non disponible"}
                </span>
              </p>
            </div>
            <button
              onClick={() => navigate(`/sessions/${id}/edit`)}
              className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-6 py-3 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
            >
              <Edit className="mr-2 w-5 h-5" /> Modifier la Session
            </button>
          </div>

          {/* Search Sessions */}
          <SearchSessions />

          {/* Programmes Section */}
          <div className={`mb-8 bg-${darkMode ? "gray-800" : "white"} rounded-lg shadow-md border ${
            darkMode ? "border-gray-600" : "border-gray-200"
          } p-6 card-hover`}>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("programmes")}
            >
              <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                Programmes
              </h2>
              {expandedSections["programmes"] ? (
                <ChevronUp className={`w-6 h-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`} />
              ) : (
                <ChevronDown className={`w-6 h-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`} />
              )}
            </div>
            {expandedSections["programmes"] && (
              <div className="mt-4">
                <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>
                  Programmes Assignés
                </h4>
                {session?.programmes?.length > 0 ? (
                  <ul className="list-disc pl-5 mb-4">
                    {session.programmes.map((programme) => (
                      <li key={programme.id} className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                          {programme.titre || `Programme ${programme.id}`}
                        </span>: Durée: {programme.duree || "N/A"} heures, {programme.nbrdheureparjour || "N/A"}h/jour, {programme.heuredebut || "N/A"} - {programme.heurefin || "N/A"} (
                        <span
                          className="text-[color:var(--theme-primary)] hover:underline cursor-pointer"
                          onClick={() => navigate(`/programmes/${programme.id}`)}
                        >
                          Voir
                        </span>
                        )
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} mb-4`}>Aucun programme assigné</p>
                )}

                <ProgrammeSelection />

                <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mt-6 mb-4`}>
                  Créer un Nouveau Programme
                </h4>
                <form onSubmit={handleCreateProgramme} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            )}
          </div>

          {/* Formateurs Section */}
          <div className={`mb-8 bg-${darkMode ? "gray-800" : "white"} rounded-lg shadow-md border ${
            darkMode ? "border-gray-600" : "border-gray-200"
          } p-6 card-hover`}>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("formateurs")}
            >
              <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                Formateurs
              </h2>
              {expandedSections["formateurs"] ? (
                <ChevronUp className={`w-6 h-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`} />
              ) : (
                <ChevronDown className={`w-6 h-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`} />
              )}
            </div>
            {expandedSections["formateurs"] && (
              <div className="mt-4">
                <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>
                  Formateurs Assignés
                </h4>
                {session?.formateurs?.length > 0 ? (
                  <ul className="list-disc pl-5 mb-4">
                    {session.formateurs.map((formateur) => (
                      <li key={formateur.id} className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                        <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                          {formateur.name || `Formateur ${formateur.id}`}
                        </span>: {formateur.email || "Aucun email"} (
                        <span
                          className="text-[color:var(--theme-primary)] hover:underline cursor-pointer"
                          onClick={() => navigate(`/formateurs/${formateur.id}`)}
                        >
                          Voir
                        </span>
                        )
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} mb-4`}>Aucun formateur assigné</p>
                )}

                <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>
                  Assigner un Formateur
                </h4>
                <select
                  value={selectedFormateur[id] || ""}
                  onChange={(e) => setSelectedFormateur({ ...selectedFormateur, [id]: e.target.value })}
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
                  onClick={handleAssignFormateur}
                  className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors mb-4"
                  disabled={!selectedFormateur[id]}
                >
                  Assigner le Formateur
                </button>

                <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mt-6 mb-4`}>
                  Créer un Nouveau Formateur
                </h4>
                <form onSubmit={handleCreateFormateur} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            )}
          </div>

          {/* Demandes Section */}
          <div className={`mb-8 bg-${darkMode ? "gray-800" : "white"} rounded-lg shadow-md border ${
            darkMode ? "border-gray-600" : "border-gray-200"
          } p-6 card-hover`}>
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("demandes")}
            >
              <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                Demandes
              </h2>
              {expandedSections["demandes"] ? (
                <ChevronUp className={`w-6 h-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`} />
              ) : (
                <ChevronDown className={`w-6 h-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`} />
              )}
            </div>
            {expandedSections["demandes"] && <DemandesSection />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;