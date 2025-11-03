import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateCabinet,
  useCreateSession,
  useAssignSessionToCabinet,
  useCreateProgramme,
  useAssignProgrammeToSession,
  useAllFormateurs,
  useCreateFormateur,
  useAssignFormateurToSession,
  useNotAssignedProgrammes,
  useSessionsByFormateur,
  useSessionsByProgramme,
} from '../../../../services/formation';
import { ArrowLeft, ChevronDown, ChevronUp, PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

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

const CabinetCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { theme, darkMode } = useSelector((state) => state.theme);
  const createCabinet = useCreateCabinet();
  const createSession = useCreateSession();
  const assignSessionToCabinet = useAssignSessionToCabinet();
  const createProgramme = useCreateProgramme();
  const assignProgrammeToSession = useAssignProgrammeToSession();
  const { data: formateurs = [], isLoading: formateursLoading } = useAllFormateurs();
  const createFormateur = useCreateFormateur();
  const assignFormateurToSession = useAssignFormateurToSession();
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    tel: '',
    logo: '',
    catalogue: '',
    motscles: '',
    description: ''
  });
  const [logoPreview, setLogoPreview] = useState('');
  const [newSession, setNewSession] = useState({
    datedebut: "",
    datefin: "",
    objectifs: "",
    apport: "",
    affiche: "",
    theme: "",
    prix: "",
    mode: "ONLINE",
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
  const [selectedProgramme, setSelectedProgramme] = useState("");
  const [selectedFormateur, setSelectedFormateur] = useState("");
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedFormateurId, setSelectedFormateurId] = useState("");
  const [selectedProgrammeId, setSelectedProgrammeId] = useState("");
  const [expandedSearchSections, setExpandedSearchSections] = useState({});

  const primaryColor = themeColors[theme]?.primary || "#132977";
  const secondaryColor = themeColors[theme]?.secondary || "#007aff";
  const bgColor = darkMode ? themeColors[theme]?.bgDark || "#374151" : themeColors[theme]?.bgLight || "#f9fafb";
  const textColor = darkMode ? themeColors[theme]?.textDark || "#d1d5db" : themeColors[theme]?.textLight || "#1f2937";
  const borderColor = themeColors[theme]?.border || "#344054";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'logo') {
      setLogoPreview(value);
    }
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    return new Promise((resolve, reject) => {
      createSession.mutate(newSession, {
        onSuccess: (data) => {
          toast.success("Session créée avec succès !");
          setNewSession({
            datedebut: "",
            datefin: "",
            objectifs: "",
            apport: "",
            affiche: "",
            theme: "",
            prix: "",
            mode: "ONLINE",
          });
          resolve(data.id);
        },
        onError: (error) => {
          toast.error(error.message || "Erreur lors de la création de la session");
          reject(error);
        },
      });
    });
  };

  const handleCreateProgramme = (sessionId, e) => {
    e.preventDefault();
    createProgramme.mutate(
      { ...newProgramme, sessionId },
      {
        onSuccess: () => {
          toast.success("Programme créé et assigné avec succès !");
          setNewProgramme({ titre: "", duree: "", nbrdheureparjour: "", heuredebut: "", heurefin: "" });
          queryClient.invalidateQueries({ queryKey: ['programmes'] });
          queryClient.invalidateQueries({ queryKey: ['not-assigned-programmes'] });
        },
        onError: (error) => toast.error(error.message || "Erreur lors de la création du programme"),
      }
    );
  };

  const handleAssignProgramme = (sessionId) => {
    if (!selectedProgramme) {
      toast.error("Veuillez sélectionner un programme.");
      return;
    }
    assignProgrammeToSession.mutate(
      { sessionId, programmeId: selectedProgramme },
      {
        onSuccess: () => {
          toast.success("Programme assigné avec succès !");
          setSelectedProgramme("");
          queryClient.invalidateQueries({ queryKey: ['programmes'] });
          queryClient.invalidateQueries({ queryKey: ['not-assigned-programmes'] });
        },
        onError: (error) => toast.error(error.message || "Erreur lors de l'assignation du programme"),
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
    if (!selectedFormateur) {
      toast.error("Veuillez sélectionner un formateur.");
      return;
    }
    assignFormateurToSession.mutate(
      { sessionId, formateurId: selectedFormateur },
      {
        onSuccess: () => {
          toast.success("Formateur assigné avec succès !");
          setSelectedFormateur("");
          queryClient.invalidateQueries({ queryKey: ['formateurs'] });
        },
        onError: (error) => toast.error(error.message || "Erreur lors de l'assignation du formateur"),
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    createCabinet.mutate(formData, {
      onSuccess: async (data) => {
        toast.success('Cabinet créé avec succès !');
        const cabinetId = data.id;

        // Create and assign session if provided
        if (newSession.theme || newSession.datedebut || newSession.datefin) {
          try {
            const sessionId = await handleCreateSession(e);
            await new Promise((resolve, reject) => {
              assignSessionToCabinet.mutate(
                { cabinetId, sessionId },
                {
                  onSuccess: () => {
                    toast.success("Session assignée au cabinet avec succès !");
                    queryClient.invalidateQueries({ queryKey: ['sessions', cabinetId] });
                    resolve();
                  },
                  onError: (error) => {
                    toast.error(error.message || "Erreur lors de l'assignation de la session");
                    reject(error);
                  },
                }
              );
            });

            // Create and assign programme if provided
            if (newProgramme.titre) {
              await new Promise((resolve, reject) => {
                createProgramme.mutate(
                  { ...newProgramme, sessionId },
                  {
                    onSuccess: () => {
                      toast.success("Programme créé et assigné avec succès !");
                      queryClient.invalidateQueries({ queryKey: ['programmes'] });
                      queryClient.invalidateQueries({ queryKey: ['not-assigned-programmes'] });
                      resolve();
                    },
                    onError: (error) => {
                      toast.error(error.message || "Erreur lors de la création du programme");
                      reject(error);
                    },
                  }
                );
              });
            }

            // Assign existing programme if selected
            if (selectedProgramme) {
              await new Promise((resolve, reject) => {
                assignProgrammeToSession.mutate(
                  { sessionId, programmeId: selectedProgramme },
                  {
                    onSuccess: () => {
                      toast.success("Programme assigné avec succès !");
                      queryClient.invalidateQueries({ queryKey: ['programmes'] });
                      queryClient.invalidateQueries({ queryKey: ['not-assigned-programmes'] });
                      resolve();
                    },
                    onError: (error) => {
                      toast.error(error.message || "Erreur lors de l'assignation du programme");
                      reject(error);
                    },
                  }
                );
              });
            }

            // Create and assign formateur if provided
            if (newFormateur.name || newFormateur.email) {
              await new Promise((resolve, reject) => {
                createFormateur.mutate(newFormateur, {
                  onSuccess: (formateurData) => {
                    assignFormateurToSession.mutate(
                      { sessionId, formateurId: formateurData.id },
                      {
                        onSuccess: () => {
                          toast.success("Formateur assigné à la session avec succès !");
                          queryClient.invalidateQueries({ queryKey: ['formateurs'] });
                          resolve();
                        },
                        onError: (error) => {
                          toast.error(error.message || "Erreur lors de l'assignation du formateur");
                          reject(error);
                        },
                      }
                    );
                  },
                  onError: (error) => {
                    toast.error(error.message || "Erreur lors de la création du formateur");
                    reject(error);
                  },
                });
              });
            }

            // Assign existing formateur if selected
            if (selectedFormateur) {
              await new Promise((resolve, reject) => {
                assignFormateurToSession.mutate(
                  { sessionId, formateurId: selectedFormateur },
                  {
                    onSuccess: () => {
                      toast.success("Formateur assigné avec succès !");
                      queryClient.invalidateQueries({ queryKey: ['formateurs'] });
                      resolve();
                    },
                    onError: (error) => {
                      toast.error(error.message || "Erreur lors de l'assignation du formateur");
                      reject(error);
                    },
                  }
                );
              });
            }
          } catch (error) {
            console.error("Error during session/programme/formateur creation:", error);
          }
        }

        navigate(`/cabinets/${cabinetId}`);
      },
      onError: (error) => toast.error(error.message || "Erreur lors de la création du cabinet"),
    });
  };

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
          Assigner un Programme Existants
        </h4>
        <select
          value={selectedProgramme}
          onChange={(e) => setSelectedProgramme(e.target.value)}
          className="input-field mb-4"
        >
          <option value="">Sélectionner un programme</option>
          {notAssignedProgrammes.map((programme) => (
            <option key={programme.id} value={programme.id}>
              {programme.titre || `Programme ${programme.id}`}
            </option>
          ))}
        </select>
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

  if (formateursLoading) {
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
          <div className="flex items-center justify-between mb-8">
            <h1 className={`text-3xl font-bold ${darkMode ? "text-gray-100" : "text-gray-800"} mont-font`}>Créer un Cabinet</h1>
            <button
              onClick={() => navigate('/cabinets')}
              className={`flex items-center ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} mont-font`}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
          </div>

          <form onSubmit={handleSubmit} className={`bg-${darkMode ? "gray-800" : "white"} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl p-6 shadow-lg card-hover transition-all`}>
            {/* Logo Preview */}
            <div className="mb-6 flex flex-col items-center">
              {logoPreview && (
                <div className="mb-4 w-32 h-32 rounded-full overflow-hidden border-2 border-[color:var(--theme-border)]">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
              )}
              <div className="w-full">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mont-font`} htmlFor="logo">
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logo"
                  value={formData.logo}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="input-field"
                  aria-label="Logo URL"
                />
              </div>
            </div>

            {/* Cabinet Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mont-font`} htmlFor="nom">
                  Nom
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mont-font`} htmlFor="tel">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="tel"
                  value={formData.tel}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mont-font`} htmlFor="adresse">
                  Adresse
                </label>
                <textarea
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="input-field"
                  rows="3"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mont-font`} htmlFor="catalogue">
                  Catalogue
                </label>
                <input
                  type="text"
                  name="catalogue"
                  value={formData.catalogue}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mont-font`} htmlFor="motscles">
                  Mots-clés (séparés par des virgules)
                </label>
                <input
                  type="text"
                  name="motscles"
                  value={formData.motscles}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} mont-font`} htmlFor="description">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  rows="5"
                />
              </div>
            </div>

            {/* Search Sessions */}
            <SearchSessions />

            {/* Create Session Section */}
            <div className={`mb-8 bg-${darkMode ? "gray-800" : "white"} rounded-lg shadow-md border ${
              darkMode ? "border-gray-600" : "border-gray-200"
            } p-6 card-hover`}>
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection("createSession")}
              >
                <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                  Créer une Session
                </h2>
                {expandedSections["createSession"] ? (
                  <ChevronUp className={`w-6 h-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`} />
                ) : (
                  <ChevronDown className={`w-6 h-6 ${darkMode ? "text-gray-100" : "text-gray-800"}`} />
                )}
              </div>
              {expandedSections["createSession"] && (
                <div className="mt-4">
                  <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-4`}>
                    Créer une Nouvelle Session
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Date de Début</label>
                      <input
                        type="date"
                        value={newSession.datedebut}
                        onChange={(e) => setNewSession({ ...newSession, datedebut: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Date de Fin</label>
                      <input
                        type="date"
                        value={newSession.datefin}
                        onChange={(e) => setNewSession({ ...newSession, datefin: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Objectifs</label>
                      <input
                        type="text"
                        value={newSession.objectifs}
                        onChange={(e) => setNewSession({ ...newSession, objectifs: e.target.value })}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Apport</label>
                      <input
                        type="text"
                        value={newSession.apport}
                        onChange={(e) => setNewSession({ ...newSession, apport: e.target.value })}
                        className="input-field"
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
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Prix</label>
                      <input
                        type="number"
                        value={newSession.prix}
                        onChange={(e) => setNewSession({ ...newSession, prix: e.target.value })}
                        className="input-field"
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
                  </div>

                  {/* Programme Section */}
                  <div className="mt-6">
                    <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-4`}>
                      Assigner ou Créer un Programme
                    </h4>
                    <ProgrammeSelection />

                    <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mt-6 mb-4`}>
                      Créer un Nouveau Programme
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Titre</label>
                        <input
                          type="text"
                          value={newProgramme.titre}
                          onChange={(e) => setNewProgramme({ ...newProgramme, titre: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Durée (heures)</label>
                        <input
                          type="number"
                          value={newProgramme.duree}
                          onChange={(e) => setNewProgramme({ ...newProgramme, duree: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Heures par jour</label>
                        <input
                          type="number"
                          value={newProgramme.nbrdheureparjour}
                          onChange={(e) => setNewProgramme({ ...newProgramme, nbrdheureparjour: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Heure de début</label>
                        <input
                          type="time"
                          value={newProgramme.heuredebut}
                          onChange={(e) => setNewProgramme({ ...newProgramme, heuredebut: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Heure de fin</label>
                        <input
                          type="time"
                          value={newProgramme.heurefin}
                          onChange={(e) => setNewProgramme({ ...newProgramme, heurefin: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Formateur Section */}
                  <div className="mt-6">
                    <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-4`}>
                      Assigner ou Créer un Formateur
                    </h4>
                    <select
                      value={selectedFormateur}
                      onChange={(e) => setSelectedFormateur(e.target.value)}
                      className="input-field mb-4"
                    >
                      <option value="">Sélectionner un formateur</option>
                      {formateurs.map((formateur) => (
                        <option key={formateur.id} value={formateur.id}>
                          {formateur.name || `Formateur ${formateur.id}`}
                        </option>
                      ))}
                    </select>

                    <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mt-6 mb-4`}>
                      Créer un Nouveau Formateur
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Nom</label>
                        <input
                          type="text"
                          value={newFormateur.name}
                          onChange={(e) => setNewFormateur({ ...newFormateur, name: e.target.value })}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Email</label>
                        <input
                          type="email"
                          value={newFormateur.email}
                          onChange={(e) => setNewFormateur({ ...newFormateur, email: e.target.value })}
                          className="input-field"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/cabinets')}
                className={`px-5 py-2.5 rounded-xl border ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'} mont-font font-medium transition-colors`}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createCabinet.isLoading}
                className={`px-5 py-2.5 bg-[color:var(--theme-primary)] text-white rounded-xl font-medium mont-font hover:bg-[color:var(--theme-secondary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {createCabinet.isLoading ? 'Création...' : 'Créer le Cabinet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CabinetCreate;