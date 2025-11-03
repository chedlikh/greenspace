import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useFormationById,
  useCreateCabinet,
  useAssignCabinetToFormation,
  useUnassignCabinetFromFormation,
  useCreateSession,
  useAssignSessionToCabinet,
  useUnassignSessionFromCabinet,
  useAssignFormateurToSession,
  useUnassignFormateurFromSession,
  useCreateProgramme,
  useAssignProgrammeToSession,
  useUnassignProgrammeFromSession,
  useAllCabinets,
  useAllSessions,
  useAllFormateurs,
  useAllProgrammes,
  useAssignPosteToFormation,
  useUnassignPosteFromFormation,
} from "../../../services/formation";
import { usePostes } from "../../../services/hooks";
import { Book, Plus, Edit, ChevronDown, ChevronUp, Calendar, Clock, User, Briefcase, X } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import Modal from "./Modal";
import { toast } from "react-toastify";

// Theme color mapping
const themeColors = {
  red: { primary: "#ff3b30", secondary: "#ff2d55", bgLight: "#fef2f2", bgDark: "#3f0a0a", textLight: "#1f2937", textDark: "#f3f4f6", border: "#344054" },
  green: { primary: "#4cd964", secondary: "#34c759", bgLight: "#f0fdf4", bgDark: "#052e16", textLight: "#1f2937", textDark: "#e5e7eb", border: "#344054" },
  blue: { primary: "#132977", secondary: "#007aff", bgLight: "#eff6ff", bgDark: "#1e3a8a", textLight: "#1f2937", textDark: "#e5e7eb", border: "#344054" },
  pink: { primary: "#ff2d55", secondary: "#ff69b4", bgLight: "#fff1f2", bgDark: "#3f0713", textLight: "#1f2937", textDark: "#f3f4f6", border: "#344054" },
  yellow: { primary: "#ffcc00", secondary: "#ff9500", bgLight: "#fefce8", bgDark: "#3f2c00", textLight: "#1f2937", textDark: "#e5e7eb", border: "#344054" },
  orange: { primary: "#ff9500", secondary: "#ff7f50", bgLight: "#fff7eb", bgDark: "#3f2d0f", textLight: "#1f2937", textDark: "#e5e7eb", border: "#344054" },
  gray: { primary: "#8e8e93", secondary: "#a9a9a9", bgLight: "#f9fafb", bgDark: "#374151", textLight: "#1f2937", textDark: "#d1d5db", border: "#344054" },
  brown: { primary: "#D2691E", secondary: "#8B4513", bgLight: "#fef7e7", bgDark: "#2f1c0a", textLight: "#1f2937", textDark: "#e5e7eb", border: "#344054" },
  darkgreen: { primary: "#228B22", secondary: "#006400", bgLight: "#f0fdf4", bgDark: "#092e16", textLight: "#1f2937", textDark: "#e5e7eb", border: "#344054" },
  deeppink: { primary: "#FFC0CB", secondary: "#FF69B4", bgLight: "#fff1f2", bgDark: "#3f0f1e", textLight: "#1f2937", textDark: "#f3f4f6", border: "#344054" },
  cadetblue: { primary: "#5f9ea0", secondary: "#4682b4", bgLight: "#f0f9ff", bgDark: "#1c2f3a", textLight: "#1f2937", textDark: "#e5e7eb", border: "#344054" },
  darkorchid: { primary: "#9932cc", secondary: "#9400d3", bgLight: "#f5f3ff", bgDark: "#2e1a3f", textLight: "#1f2937", textDark: "#e5e7eb", border: "#344054" },
};

// Status badge color mapping
const statusColors = {
  COMING_SOON: { bg: "#fef3c7", text: "#b45309", bgDark: "#78350f", textDark: "#fef3c7" },
  ACTIVE: { bg: "#d1fae5", text: "#047857", bgDark: "#064e3b", textDark: "#d1fae5" },
  COMPLETED: { bg: "#e5e7eb", text: "#4b5563", bgDark: "#4b5563", textDark: "#e5e7eb" },
  CANCELLED: { bg: "#fee2e2", text: "#b91c1c", bgDark: "#7f1d1d", textDark: "#fee2e2" },
  UNKNOWN: { bg: "#e0e7ff", text: "#3730a3", bgDark: "#312e81", textDark: "#e0e7ff" },
};

// Mode badge color mapping
const modeColors = {
  ONLINE: { bg: "#bfdbfe", text: "#1e40af", bgDark: "#1e3a8a", textDark: "#bfdbfe" },
  HYBRID: { bg: "#e9d5ff", text: "#6b21a8", bgDark: "#4c1d95", textDark: "#e9d5ff" },
  IN_PERSON: { bg: "#c7d2fe", text: "#3730a3", bgDark: "#312e81", textDark: "#c7d2fe" },
};

const FormationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, darkMode } = useSelector((state) => state.theme);
  const { data: formation, isLoading, error } = useFormationById(id);
  const { data: cabinets } = useAllCabinets(0, 100);
  const { data: sessions } = useAllSessions(0, 100);
  const { data: formateurs } = useAllFormateurs(0, 100);
  const { data: programmes } = useAllProgrammes(0, 100);
  const { data: postes } = usePostes?.(0, 100) || { data: [] };

  const createCabinet = useCreateCabinet();
  const assignCabinet = useAssignCabinetToFormation();
  const unassignCabinet = useUnassignCabinetFromFormation();
  const createSession = useCreateSession();
  const assignSession = useAssignSessionToCabinet();
  const unassignSession = useUnassignSessionFromCabinet();
  const assignFormateur = useAssignFormateurToSession();
  const unassignFormateur = useUnassignFormateurFromSession();
  const createProgramme = useCreateProgramme();
  const assignProgramme = useAssignProgrammeToSession();
  const unassignProgramme = useUnassignProgrammeFromSession();
  const assignPoste = useAssignPosteToFormation();
  const unassignPoste = useUnassignPosteFromFormation();

  const [modal, setModal] = useState({ isOpen: false, type: "", title: "" });
  const [cabinetForm, setCabinetForm] = useState({ nom: "", adresse: "", logo: "", tel: "", catalogue: "", motscles: "", description: "" });
  const [sessionForm, setSessionForm] = useState({
    datedebut: "", datefin: "", prix: "", mode: "ONLINE", objectifs: "", apport: "", affiche: "", theme: ""
  });
  const [programmeForm, setProgrammeForm] = useState({ titre: "", duree: "", nbrdheureparjour: "", heuredebut: "", heurefin: "" });
  const [assignForm, setAssignForm] = useState({ cabinetId: "", sessionId: "", formateurId: "", programmeId: "", posteId: "" });
  const [expandedSections, setExpandedSections] = useState({});
  const [activeImage, setActiveImage] = useState(0);

  const openModal = (type, title) => setModal({ isOpen: true, type, title });
  const closeModal = () => {
    setModal({ isOpen: false, type: "", title: "" });
    setCabinetForm({ nom: "", adresse: "", logo: "", tel: "", catalogue: "", motscles: "", description: "" });
    setSessionForm({ datedebut: "", datefin: "", prix: "", mode: "ONLINE", objectifs: "", apport: "", affiche: "", theme: "" });
    setProgrammeForm({ titre: "", duree: "", nbrdheureparjour: "", heuredebut: "", heurefin: "" });
    setAssignForm({ cabinetId: "", sessionId: "", formateurId: "", programmeId: "", posteId: "" });
  };

  const toggleSection = (sectionId) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const handleCreateCabinet = (e) => {
    e.preventDefault();
    if (!cabinetForm.nom.trim()) {
      toast.error("Le nom du cabinet est requis");
      return;
    }
    createCabinet.mutate(cabinetForm, {
      onSuccess: (data) => {
        toast.success("Cabinet créé avec succès !");
        assignCabinet.mutate(
          { formationId: id, cabinetId: data.id },
          {
            onSuccess: () => {
              toast.success("Cabinet assigné à la formation !");
              closeModal();
            },
            onError: (error) => toast.error(error.message || "Erreur lors de l'assignation du cabinet"),
          }
        );
      },
      onError: (error) => toast.error(error.message || "Erreur lors de la création du cabinet"),
    });
  };

  const handleAssignCabinet = (e) => {
    e.preventDefault();
    if (!assignForm.cabinetId) {
      toast.error("Veuillez sélectionner un cabinet");
      return;
    }
    assignCabinet.mutate(
      { formationId: id, cabinetId: assignForm.cabinetId },
      {
        onSuccess: () => {
          toast.success("Cabinet assigné avec succès !");
          closeModal();
        },
        onError: (error) => toast.error(error.message || "Erreur lors de l'assignation du cabinet"),
      }
    );
  };

  const handleUnassignCabinet = (cabinetId) => {
    if (!window.confirm("Voulez-vous vraiment désassigner ce cabinet ?")) return;
    unassignCabinet.mutate(
      { formationId: id, cabinetId },
      {
        onSuccess: () => {
          toast.success("Cabinet désassigné avec succès !");
        },
        onError: (error) => toast.error(error.message || "Erreur lors de la désassignation du cabinet"),
      }
    );
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!sessionForm.theme.trim() || !sessionForm.datedebut || !sessionForm.datefin || !sessionForm.prix) {
      toast.error("Les champs thème, date de début, date de fin et prix sont requis");
      return;
    }
    createSession.mutate(
      { ...sessionForm, prix: parseFloat(sessionForm.prix) || 0 },
      {
        onSuccess: (data) => {
          toast.success("Session créée avec succès !");
          if (assignForm.cabinetId) {
            assignSession.mutate(
              { cabinetId: assignForm.cabinetId, sessionId: data.id },
              {
                onSuccess: () => {
                  toast.success("Session assignée au cabinet !");
                  closeModal();
                },
                onError: (error) => toast.error(error.message || "Erreur lors de l'assignation de la session"),
              }
            );
          } else {
            closeModal();
          }
        },
        onError: (error) => toast.error(error.message || "Erreur lors de la création de la session"),
      }
    );
  };

  const handleAssignSession = (e) => {
    e.preventDefault();
    if (!assignForm.sessionId || !assignForm.cabinetId) {
      toast.error("Veuillez sélectionner une session et un cabinet");
      return;
    }
    assignSession.mutate(
      { cabinetId: assignForm.cabinetId, sessionId: assignForm.sessionId },
      {
        onSuccess: () => {
          toast.success("Session assignée avec succès !");
          closeModal();
        },
        onError: (error) => toast.error(error.message || "Erreur lors de l'assignation de la session"),
      }
    );
  };

  const handleUnassignSession = (sessionId, cabinetId) => {
    if (!window.confirm("Voulez-vous vraiment désassigner cette session ?")) return;
    unassignSession.mutate(
      { cabinetId, sessionId },
      {
        onSuccess: () => {
          toast.success("Session désassignée avec succès !");
        },
        onError: (error) => toast.error(error.message || "Erreur lors de la désassignation de la session"),
      }
    );
  };

  const handleAssignFormateur = (e) => {
    e.preventDefault();
    if (!assignForm.sessionId || !assignForm.formateurId) {
      toast.error("Veuillez sélectionner une session et un formateur");
      return;
    }
    assignFormateur.mutate(
      { sessionId: assignForm.sessionId, formateurId: assignForm.formateurId },
      {
        onSuccess: () => {
          toast.success("Formateur assigné à la session !");
          closeModal();
        },
        onError: (error) => toast.error(error.message || "Erreur lors de l'assignation du formateur"),
      }
    );
  };

  const handleUnassignFormateur = (sessionId, formateurId) => {
    if (!window.confirm("Voulez-vous vraiment désassigner ce formateur ?")) return;
    unassignFormateur.mutate(
      { sessionId, formateurId },
      {
        onSuccess: () => {
          toast.success("Formateur désassigné avec succès !");
        },
        onError: (error) => toast.error(error.message || "Erreur lors de la désassignation du formateur"),
      }
    );
  };

  const handleCreateProgramme = (e) => {
    e.preventDefault();
    if (!programmeForm.titre.trim() || !programmeForm.duree) {
      toast.error("Les champs titre et durée sont requis");
      return;
    }
    createProgramme.mutate(
      { ...programmeForm, duree: parseInt(programmeForm.duree) || 0, nbrdheureparjour: parseInt(programmeForm.nbrdheureparjour) || 0 },
      {
        onSuccess: (data) => {
          toast.success("Programme créé avec succès !");
          if (assignForm.sessionId) {
            assignProgramme.mutate(
              { sessionId: assignForm.sessionId, programmeId: data.id },
              {
                onSuccess: () => {
                  toast.success("Programme assigné à la session !");
                  closeModal();
                },
                onError: (error) => toast.error(error.message || "Erreur lors de l'assignation du programme"),
              }
            );
          } else {
            closeModal();
          }
        },
        onError: (error) => toast.error(error.message || "Erreur lors de la création du programme"),
      }
    );
  };

  const handleAssignProgramme = (e) => {
    e.preventDefault();
    if (!assignForm.sessionId || !assignForm.programmeId) {
      toast.error("Veuillez sélectionner une session et un programme");
      return;
    }
    assignProgramme.mutate(
      { sessionId: assignForm.sessionId, programmeId: assignForm.programmeId },
      {
        onSuccess: () => {
          toast.success("Programme assigné avec succès !");
          closeModal();
        },
        onError: (error) => toast.error(error.message || "Erreur lors de l'assignation du programme"),
      }
    );
  };

  const handleUnassignProgramme = (sessionId, programmeId) => {
    if (!window.confirm("Voulez-vous vraiment désassigner ce programme ?")) return;
    unassignProgramme.mutate(
      { sessionId, programmeId },
      {
        onSuccess: () => {
          toast.success("Programme désassigné avec succès !");
        },
        onError: (error) => toast.error(error.message || "Erreur lors de la désassignation du programme"),
      }
    );
  };

  const handleAssignPoste = (e) => {
    e.preventDefault();
    if (!assignForm.posteId) {
      toast.error("Veuillez sélectionner un poste");
      return;
    }
    assignPoste.mutate(
      { formationId: id, posteId: assignForm.posteId },
      {
        onSuccess: () => {
          toast.success("Poste assigné avec succès !");
          closeModal();
        },
        onError: (error) => toast.error(error.message || "Erreur lors de l'assignation du poste"),
      }
    );
  };

  const handleUnassignPoste = (posteId) => {
    if (!window.confirm("Voulez-vous vraiment désassigner ce poste ?")) return;
    unassignPoste.mutate(
      { formationId: id, posteId },
      {
        onSuccess: () => {
          toast.success("Poste désassigné avec succès !");
        },
        onError: (error) => toast.error(error.message || "Erreur lors de la désassignation du poste"),
      }
    );
  };

  const formatPosteOption = (poste) => {
    const stripHtml = (html) => (html ? html.replace(/<[^>]+>/g, "").trim() : "Aucune description");
    let label = poste.titre || "Poste sans nom";
    if (poste.gservices?.length > 0) {
      const servicesSummary = poste.gservices
        .map((service) => {
          const serviceName = service.name || "Service sans nom";
          const sitesSummary = service.sites?.length > 0
            ? ` (${service.sites.map((site) => site.nom || "Site sans nom").join(", ")})`
            : "";
          return `${serviceName}${sitesSummary}`;
        })
        .join("; ");
      label += ` - ${servicesSummary}`;
    }
    return label;
  };

  const primaryColor = themeColors[theme]?.primary || "#4cd964";
  const secondaryColor = themeColors[theme]?.secondary || "#34c759";
  const bgColor = darkMode ? themeColors[theme]?.bgDark : themeColors[theme]?.bgLight;
  const textColor = darkMode ? themeColors[theme]?.textDark : themeColors[theme]?.textLight;
  const borderColor = themeColors[theme]?.border || "#344054";

  const getStatusBadgeStyles = (status) => {
    const statusKey = status || "UNKNOWN";
    const colors = statusColors[statusKey] || statusColors.UNKNOWN;
    return {
      backgroundColor: darkMode ? colors.bgDark : colors.bg,
      color: darkMode ? colors.textDark : colors.text,
    };
  };

  const getModeBadgeStyles = (mode) => {
    const modeKey = mode || "ONLINE";
    const colors = modeColors[modeKey] || modeColors.ONLINE;
    return {
      backgroundColor: darkMode ? colors.bgDark : colors.bg,
      color: darkMode ? colors.textDark : colors.text,
    };
  };

  const images = formation?.affiche ? formation.affiche.split(",").map((img) => img.trim()) : [];

  const counts = {
    cabinets: formation?.cabinets?.length || formation?.cabinetsCount || 0,
    sessions: formation?.sessions?.length || formation?.sessionsCount || 0,
    programmes: formation?.programmes?.length || formation?.programmesCount || 0,
    formateurs: formation?.formateurs?.length || formation?.formateursCount || 0,
    postes: formation?.postes?.length || formation?.postesCount || 0,
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-screen p-6 flex justify-center items-center ${
          darkMode
            ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700"
            : "bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100"
        }`}
        style={{ marginTop: "80px", marginLeft: "250px" }}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[color:var(--theme-primary)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen p-6 flex flex-col items-center justify-center ${
          darkMode
            ? "bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700"
            : "bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100"
        }`}
        style={{ marginTop: "80px", marginLeft: "250px" }}
      >
        <p className={`text-lg font-semibold ${darkMode ? "text-red-400" : "text-red-600"}`}>
          Erreur lors du chargement de la formation : {error.message || "Erreur inconnue"}
        </p>
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
        `}
      </style>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6">
              <Book className={`w-8 h-8 ${darkMode ? "text-gray-100" : "text-[color:var(--theme-primary)]"}`} />
              <h1 className={`text-3xl font-bold ${darkMode ? "text-gray-100" : "text-gray-800"}`}>
                {formation.titre || "Formation sans nom"}
              </h1>
            </div>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <p className={`text-lg ${darkMode ? "text-gray-300" : "text-gray-600"} mb-4`}>
                  {formation.description || "Aucune description disponible"}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
                  <div>
                    <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Cabinets :</span>
                    <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{counts.cabinets}</span>
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Sessions :</span>
                    <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{counts.sessions}</span>
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Programmes :</span>
                    <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{counts.programmes}</span>
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Formateurs :</span>
                    <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{counts.formateurs}</span>
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Postes :</span>
                    <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{counts.postes}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Mode :</span>
                    <span
                      className="ml-2 inline-block px-3 py-1 rounded-full text-xs font-medium"
                      style={getModeBadgeStyles(formation.mode)}
                    >
                      {formation.mode === "ONLINE"
                        ? "En ligne"
                        : formation.mode === "HYBRID"
                        ? "Hybride"
                        : formation.mode === "IN_PERSON"
                        ? "En personne"
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Statut :</span>
                    <span
                      className="ml-2 inline-block px-3 py-1 rounded-full text-xs font-medium"
                      style={getStatusBadgeStyles(formation.status)}
                    >
                      {formation.status === "COMING_SOON"
                        ? "À venir"
                        : formation.status === "ACTIVE"
                        ? "Active"
                        : formation.status === "COMPLETED"
                        ? "Terminée"
                        : formation.status === "CANCELLED"
                        ? "Annulée"
                        : "Inconnu"}
                    </span>
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Prix :</span>
                    <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      €{formation.prix ? formation.prix.toFixed(2) : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Durée :</span>
                    <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {formation.duree || 0} heures
                    </span>
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Date de début :</span>
                    <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {formation.datedebut ? new Date(formation.datedebut).toLocaleDateString("fr-FR") : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Date de fin :</span>
                    <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {formation.datefin ? new Date(formation.datefin).toLocaleDateString("fr-FR") : "N/A"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/formations/${id}/edit`)}
                  className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-6 py-3 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                >
                  <Edit className="mr-2 w-5 h-5" /> Modifier la Formation
                </button>
              </div>
              {images.length > 0 && (
                <div className="w-full lg:w-1/3">
                  <div className="relative h-64 bg-gray-200 rounded-lg shadow-lg overflow-hidden">
                    <img
                      src={images[activeImage] || "/api/placeholder/400/300"}
                      alt={`Image ${activeImage + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/400/300";
                        e.target.onerror = null;
                      }}
                    />
                    {images.length > 1 && (
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                        {images.map((_, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveImage(index);
                            }}
                            className={`w-2 h-2 rounded-full ${activeImage === index ? "bg-white" : "bg-gray-400"}`}
                            aria-label={`Voir l'image ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Objectives and Benefits */}
          <div
            className={`bg-${darkMode ? "gray-800" : "white"} rounded-lg shadow-md p-6 mb-8 border ${
              darkMode ? "border-gray-600" : "border-gray-200"
            }`}
          >
            <h2
              className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? "text-gray-200" : "text-gray-800"} mb-4`}
            >
              <Book className="w-5 h-5 text-[color:var(--theme-primary)]" />
              <span>Objectifs et Résultats</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className={`text-lg font-medium ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>Objectifs</h3>
                <ul className={`list-disc pl-5 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {(formation?.objectif?.split(";") || []).map((obj, index) => (
                    <li key={index}>{obj || "N/A"}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className={`text-lg font-medium ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>Résultats</h3>
                <ul className={`list-disc pl-5 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                  {(formation?.apport?.split(";") || []).map((resultat, index) => (
                    <li key={index}>{resultat || "N/A"}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Cabinets Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}
              >
                <Book className="w-5 h-5 text-[color:var(--theme-primary)]" />
                <span>Cabinets de Formation</span>
              </h2>
              <div className="space-x-3">
                <button
                  onClick={() => openModal("createCabinet", "Créer un Cabinet")}
                  className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                >
                  <Plus className="mr-2 w-4 h-4" /> Créer
                </button>
                <button
                  onClick={() => openModal("assignCabinet", "Assigner un Cabinet")}
                  className="inline-flex items-center bg-white text-gray-900 border-2 border-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 hover:border-gray-700 transition-colors"
                >
                  <Plus className="mr-2 w-4 h-4 text-gray-900" /> Assigner
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formation.cabinets?.length > 0 ? (
                formation.cabinets.map((cabinet) => (
                  <div
                    key={cabinet.id || `cabinet-${Math.random()}`}
                    className={`bg-${darkMode ? "gray-800" : "white"} p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 border ${
                      darkMode ? "border-gray-600" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center mb-4">
                      <img
                        src={cabinet.logo || "/api/placeholder/48/48"}
                        alt={`Logo de ${cabinet.nom || "Cabinet"}`}
                        className="w-12 h-12 rounded-full mr-4 object-cover"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/48/48";
                          e.target.onerror = null;
                        }}
                      />
                      <h3 className={`text-lg font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                        {cabinet.nom || "Cabinet sans nom"}
                      </h3>
                    </div>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} mb-2 flex items-center`}>
                      <Book className="w-4 h-4 mr-2" /> {cabinet.description || "Aucune description"}
                    </p>
                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => navigate(`/cabinets/${cabinet.id}`)}
                        className={`text-[color:var(--theme-primary)] hover:underline inline-block text-sm`}
                      >
                        Voir Détails
                      </button>
                      <button
                        onClick={() => handleUnassignCabinet(cabinet.id)}
                        className="text-red-500 hover:text-red-700 inline-block text-sm"
                      >
                        Désassigner
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"} col-span-full`}>
                  Aucun Cabinet assigné.
                </p>
              )}
            </div>
          </div>

          {/* Sessions Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}
              >
                <Book className="w-5 h-5 text-[color:var(--theme-primary)]" />
                <span>Sessions</span>
              </h2>
              <div className="space-x-3">
                <button
                  onClick={() => openModal("createSession", "Créer une Session")}
                  className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                >
                  <Plus className="mr-2 w-4 h-4" /> Créer
                </button>
                <button
                  onClick={() => openModal("assignSession", "Assigner une Session")}
                  className="inline-flex items-center bg-white text-gray-900 border-2 border-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 hover:border-gray-700 transition-colors"
                >
                  <Plus className="mr-2 w-4 h-4 text-gray-900" /> Assigner
                </button>
                <button
                  onClick={() => openModal("assignFormateur", "Assigner un Formateur")}
                  className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                >
                  <Plus className="mr-2 w-4 h-4" /> Formateur
                </button>
                <button
                  onClick={() => openModal("createProgramme", "Créer un Programme")}
                  className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
                >
                  <Plus className="mr-2 w-4 h-4" /> Programme
                </button>
                <button
                  onClick={() => openModal("assignProgramme", "Assigner un Programme")}
                  className="inline-flex items-center bg-white text-gray-900 border-2 border-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 hover:border-gray-700 transition-colors"
                >
                  <Plus className="mr-2 w-4 h-4 text-gray-900" /> Assigner Programme
                </button>
              </div>
            </div>
            <div className="space-y-6">
              {formation.sessions?.length > 0 ? (
                formation.sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`bg-${darkMode ? "gray-800" : "white"} rounded-lg shadow-md border ${
                      darkMode ? "border-gray-600" : "border-gray-200"
                    }`}
                  >
                    <div
                      className="p-6 flex justify-between items-center cursor-pointer"
                      onClick={() => toggleSection(`session-${session.id}`)}
                    >
                      <div>
                        <h3 className={`text-lg font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                          {session.theme || "Session sans nom"}
                        </h3>
                        <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                          {session.datedebut
                            ? new Date(session.datedebut).toLocaleDateString("fr-FR")
                            : "N/A"}{" "}
                          - {session.datefin ? new Date(session.datefin).toLocaleDateString("fr-FR") : "N/A"}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {session.cabinetId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUnassignSession(session.id, session.cabinetId);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Désassigner Cabinet
                          </button>
                        )}
                        {expandedSections[`session-${session.id}`] ? (
                          <ChevronUp className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                        ) : (
                          <ChevronDown className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                        )}
                      </div>
                    </div>
                    {expandedSections[`session-${session.id}`] && (
                      <div className="p-6 border-t border-[color:var(--theme-border)]">
                        {session.affiche && (
                          <div className="relative h-48 bg-gray-200 mb-4 rounded-lg overflow-hidden">
                            <img
                              src={session.affiche.split(",")[0].trim() || "/api/placeholder/400/300"}
                              alt={session.theme || "Session"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = "/api/placeholder/400/300";
                                e.target.onerror = null;
                              }}
                            />
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                          <p>
                            <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Prix :</span>{" "}
                            <span className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              €{session.prix ? session.prix.toFixed(2) : "N/A"}
                            </span>
                          </p>
                          <p>
                            <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Mode :</span>{" "}
                            <span
                              className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                              style={getModeBadgeStyles(session.mode)}
                            >
                              {session.mode === "ONLINE"
                                ? "En ligne"
                                : session.mode === "HYBRID"
                                ? "Hybride"
                                : session.mode === "IN_PERSON"
                                ? "En personne"
                                : "N/A"}
                            </span>
                          </p>
                          <p>
                            <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Objectif :</span>{" "}
                            <span className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              {session.objectifs || "N/A"}
                            </span>
                          </p>
                          <p>
                            <span className={`font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"}`}>Résultat :</span>{" "}
                            <span className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                              {session.apport || "N/A"}
                            </span>
                          </p>
                        </div>
                        <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mb-2`}>
                          Programmes
                        </h4>
                        <div className="space-y-4">
                          {session.programmes?.length > 0 ? (
                            session.programmes.map((programme) => (
                              <div
                                key={programme.id}
                                className={`bg-${darkMode ? "gray-700" : "gray-50"} p-4 rounded-lg flex justify-between items-center`}
                              >
                                <div>
                                  <p className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                                    {programme.titre || "Programme sans nom"}
                                  </p>
                                  <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} flex items-center`}>
                                    <Clock className="w-4 h-4 mr-2" /> {programme.duree || 0} heures (
                                    {programme.nbrdheureparjour || "N/A"}h/jour, {programme.heuredebut || "N/A"} -{" "}
                                    {programme.heurefin || "N/A"})
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleUnassignProgramme(session.id, programme.id)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Désassigner
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Aucun programme assigné.
                            </p>
                          )}
                        </div>
                        <h4 className={`text-md font-semibold ${darkMode ? "text-gray-200" : "text-gray-700"} mt-4 mb-2`}>
                          Formateurs
                        </h4>
                        <div className="space-y-2">
                          {session.formateurs?.length > 0 ? (
                            session.formateurs.map((formateur) => (
                              <div
                                key={formateur.id}
                                className={`flex justify-between items-center text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}
                              >
                                <p className="flex items-center">
                                  <User className="w-4 h-4 mr-2" /> {formateur.name || "Formateur sans nom"} (
                                  {formateur.specialization || "N/A"})
                                </p>
                                <button
                                  onClick={() => handleUnassignFormateur(session.id, formateur.id)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  Désassigner
                                </button>
                              </div>
                            ))
                          ) : (
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                              Aucun formateur assigné.
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => navigate(`/sessions/${session.id}`)}
                          className={`text-[color:var(--theme-primary)] hover:underline mt-4 inline-block text-sm`}
                        >
                          Voir les Détails de la Session
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Aucune session disponible.</p>
              )}
            </div>
          </div>

          {/* Postes Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-xl font-semibold flex items-center space-x-2 ${darkMode ? "text-gray-200" : "text-gray-800"}`}
              >
                <Briefcase className="w-5 h-5 text-[color:var(--theme-primary)]" />
                <span>Postes Assignés</span>
              </h2>
              <button
                onClick={() => openModal("assignPoste", "Assigner un Poste")}
                className="inline-flex items-center bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-lg hover:bg-[color:var(--theme-secondary)] transition-colors"
              >
                <Plus className="mr-2 w-4 h-4" /> Assigner
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formation.postes?.length > 0 ? (
                formation.postes.map((poste) => (
                  <div
                    key={poste.id}
                    className={`bg-${darkMode ? "gray-800" : "white"} p-6 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 border ${
                      darkMode ? "border-gray-600" : "border-gray-200"
                    }`}
                  >
                    <h3 className={`text-lg font-medium ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
                      {poste.titre || "Poste sans nom"}
                    </h3>
                    <button
                      onClick={() => handleUnassignPoste(poste.id)}
                      className="text-red-500 hover:text-red-700 mt-4 inline-block text-sm"
                    >
                      Désassigner
                    </button>
                  </div>
                ))
              ) : (
                <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"} col-span-full`}>
                  Aucun poste assigné.
                </p>
              )}
            </div>
          </div>

          {/* Modals */}
          <Modal isOpen={modal.isOpen} onClose={closeModal} title={modal.title}>
            {modal.type === "createCabinet" && (
              <form onSubmit={handleCreateCabinet} className="space-y-4">
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="nom">
                    Nom du Cabinet *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    value={cabinetForm.nom}
                    onChange={(e) => setCabinetForm({ ...cabinetForm, nom: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                    placeholder="Nom du cabinet"
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="adresse">
                    Adresse
                  </label>
                  <input
                    type="text"
                    id="adresse"
                    value={cabinetForm.adresse}
                    onChange={(e) => setCabinetForm({ ...cabinetForm, adresse: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="Adresse"
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="logo">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    id="logo"
                    value={cabinetForm.logo}
                    onChange={(e) => setCabinetForm({ ...cabinetForm, logo: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="URL du logo"
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="tel">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    id="tel"
                    value={cabinetForm.tel}
                    onChange={(e) => setCabinetForm({ ...cabinetForm, tel: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="Numéro de téléphone"
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={cabinetForm.description}
                    onChange={(e) => setCabinetForm({ ...cabinetForm, description: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="Description"
                    rows="3"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={createCabinet.isLoading}
                  className={`w-full bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-md hover:bg-[color:var(--theme-secondary)] transition-colors text-sm ${
                    createCabinet.isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {createCabinet.isLoading ? "Création..." : "Créer et Assigner"}
                </button>
              </form>
            )}
            {modal.type === "assignCabinet" && (
              <form onSubmit={handleAssignCabinet} className="space-y-4">
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="cabinetId">
                    Sélectionner un Cabinet *
                  </label>
                  <select
                    id="cabinetId"
                    value={assignForm.cabinetId}
                    onChange={(e) => setAssignForm({ ...assignForm, cabinetId: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                  >
                    <option value="">Choisir un Cabinet</option>
                    {cabinets?.map((cabinet) => (
                      <option key={cabinet.id} value={cabinet.id}>
                        {cabinet.nom || "Cabinet sans nom"}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={assignCabinet.isLoading}
                  className={`w-full bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-md hover:bg-[color:var(--theme-secondary)] transition-colors text-sm ${
                    assignCabinet.isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {assignCabinet.isLoading ? "Assignation..." : "Assigner"}
                </button>
              </form>
            )}
            {modal.type === "createSession" && (
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="theme">
                    Thème *
                  </label>
                  <input
                    type="text"
                    id="theme"
                    value={sessionForm.theme}
                    onChange={(e) => setSessionForm({ ...sessionForm, theme: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                    placeholder="Thème"
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="datedebut">
                    Date de Début *
                  </label>
                  <input
                    type="date"
                    id="datedebut"
                    value={sessionForm.datedebut}
                    onChange={(e) => setSessionForm({ ...sessionForm, datedebut: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="datefin">
                    Date de Fin *
                  </label>
                  <input
                    type="date"
                    id="datefin"
                    value={sessionForm.datefin}
                    onChange={(e) => setSessionForm({ ...sessionForm, datefin: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="prix">
                    Prix (€) *
                  </label>
                  <input
                    type="number"
                    id="prix"
                    value={sessionForm.prix}
                    onChange={(e) => setSessionForm({ ...sessionForm, prix: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    min="0"
                    step="0.01"
                    required
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="mode">
                    Mode
                  </label>
                  <select
                    id="mode"
                    value={sessionForm.mode}
                    onChange={(e) => setSessionForm({ ...sessionForm, mode: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="ONLINE">En ligne</option>
                    <option value="HYBRID">Hybride</option>
                    <option value="IN_PERSON">En personne</option>
                  </select>
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="objectifs">
                    Objectifs
                  </label>
                  <textarea
                    id="objectifs"
                    value={sessionForm.objectifs}
                    onChange={(e) => setSessionForm({ ...sessionForm, objectifs: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="Objectifs"
                    rows="3"
                  ></textarea>
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="apport">
                    Résultat
                  </label>
                  <textarea
                    id="apport"
                    value={sessionForm.apport}
                    onChange={(e) => setSessionForm({ ...sessionForm, apport: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="Résultat"
                    rows="3"
                  ></textarea>
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="affiche">
                    Affiche URL
                  </label>
                  <input
                    type="text"
                    id="affiche"
                    value={sessionForm.affiche}
                    onChange={(e) => setSessionForm({ ...sessionForm, affiche: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="URL de l'affiche"
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="cabinetId">
                    Assigner à un Cabinet
                  </label>
                  <select
                    id="cabinetId"
                    value={assignForm.cabinetId}
                    onChange={(e) => setAssignForm({ ...assignForm, cabinetId: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="">Aucun</option>
                    {formation.cabinets?.map((cabinet) => (
                      <option key={cabinet.id} value={cabinet.id}>
                        {cabinet.nom || "Cabinet sans nom"}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={createSession.isLoading}
                  className={`w-full bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-md hover:bg-[color:var(--theme-secondary)] transition-colors text-sm ${
                    createSession.isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {createSession.isLoading ? "Création..." : "Créer"}
                </button>
              </form>
            )}
            {modal.type === "assignSession" && (
              <form onSubmit={handleAssignSession} className="space-y-4">
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="sessionId">
                    Sélectionner une Session *
                  </label>
                  <select
                    id="sessionId"
                    value={assignForm.sessionId}
                    onChange={(e) => setAssignForm({ ...assignForm, sessionId: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                  >
                    <option value="">Choisir une session</option>
                    {sessions?.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.theme || "Session sans nom"} (
                        {session.datedebut ? new Date(session.datedebut).toLocaleDateString("fr-FR") : "N/A"})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="cabinetId">
                    Sélectionner un Cabinet *
                  </label>
                  <select
                    id="cabinetId"
                    value={assignForm.cabinetId}
                    onChange={(e) => setAssignForm({ ...assignForm, cabinetId: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                  >
                    <option value="">Choisir un cabinet</option>
                    {cabinets?.map((cabinet) => (
                      <option key={cabinet.id} value={cabinet.id}>
                        {cabinet.nom || "Cabinet sans nom"}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={assignSession.isLoading}
                  className={`w-full bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-md hover:bg-[color:var(--theme-secondary)] transition-colors text-sm ${
                    assignSession.isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {assignSession.isLoading ? "Assignation..." : "Assigner"}
                </button>
              </form>
            )}
            {modal.type === "assignFormateur" && (
              <form onSubmit={handleAssignFormateur} className="space-y-4">
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="sessionId">
                    Sélectionner une Session *
                  </label>
                  <select
                    id="sessionId"
                    value={assignForm.sessionId}
                    onChange={(e) => setAssignForm({ ...assignForm, sessionId: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                  >
                    <option value="">Choisir une session</option>
                    {formation.sessions?.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.theme || "Session sans nom"} (
                        {session.datedebut ? new Date(session.datedebut).toLocaleDateString("fr-FR") : "N/A"})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="formateurId">
                    Sélectionner un Formateur *
                  </label>
                  <select
                    id="formateurId"
                    value={assignForm.formateurId}
                    onChange={(e) => setAssignForm({ ...assignForm, formateurId: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                  >
                    <option value="">Choisir un formateur</option>
                    {formateurs?.map((formateur) => (
                      <option key={formateur.id} value={formateur.id}>
                        {formateur.name || "Formateur sans nom"}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={assignFormateur.isLoading}
                  className={`w-full bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-md hover:bg-[color:var(--theme-secondary)] transition-colors text-sm ${
                    assignFormateur.isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {assignFormateur.isLoading ? "Assignation..." : "Assigner"}
                </button>
              </form>
            )}
            {modal.type === "createProgramme" && (
              <form onSubmit={handleCreateProgramme} className="space-y-4">
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="titre">
                    Titre du Programme *
                  </label>
                  <input
                    type="text"
                    id="titre"
                    value={programmeForm.titre}
                    onChange={(e) => setProgrammeForm({ ...programmeForm, titre: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                    placeholder="Titre du programme"
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="duree">
                    Durée (heures) *
                  </label>
                  <input
                    type="number"
                    id="duree"
                    value={programmeForm.duree}
                    onChange={(e) => setProgrammeForm({ ...programmeForm, duree: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    min="0"
                    required
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="nbrdheureparjour">
                    Heures par jour
                  </label>
                  <input
                    type="number"
                    id="nbrdheureparjour"
                    value={programmeForm.nbrdheureparjour}
                    onChange={(e) => setProgrammeForm({ ...programmeForm, nbrdheureparjour: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="heuredebut">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    id="heuredebut"
                    value={programmeForm.heuredebut}
                    onChange={(e) => setProgrammeForm({ ...programmeForm, heuredebut: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="HH:MM"
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="heurefin">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    id="heurefin"
                    value={programmeForm.heurefin}
                    onChange={(e) => setProgrammeForm({ ...programmeForm, heurefin: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="HH:MM"
                  />
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="sessionId">
                    Assigner à une Session
                  </label>
                  <select
                    id="sessionId"
                    value={assignForm.sessionId}
                    onChange={(e) => setAssignForm({ ...assignForm, sessionId: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <option value="">Aucune</option>
                    {formation.sessions?.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.theme || "Session sans nom"} (
                        {session.datedebut ? new Date(session.datedebut).toLocaleDateString("fr-FR") : "N/A"})
                                              </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={createProgramme.isLoading}
                  className={`w-full bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-md hover:bg-[color:var(--theme-secondary)] transition-colors text-sm ${
                    createProgramme.isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {createProgramme.isLoading ? "Création..." : "Créer"}
                </button>
              </form>
            )}
            {modal.type === "assignProgramme" && (
              <form onSubmit={handleAssignProgramme} className="space-y-4">
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="sessionId">
                    Sélectionner une Session *
                  </label>
                  <select
                    id="sessionId"
                    value={assignForm.sessionId}
                    onChange={(e) => setAssignForm({ ...assignForm, sessionId: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                  >
                    <option value="">Choisir une session</option>
                    {formation.sessions?.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.theme || "Session sans nom"} (
                        {session.datedebut ? new Date(session.datedebut).toLocaleDateString("fr-FR") : "N/A"})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="programmeId">
                    Sélectionner un Programme *
                  </label>
                  <select
                    id="programmeId"
                    value={assignForm.programmeId}
                    onChange={(e) => setAssignForm({ ...assignForm, programmeId: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                  >
                    <option value="">Choisir un programme</option>
                    {programmes?.map((programme) => (
                      <option key={programme.id} value={programme.id}>
                        {programme.titre || "Programme sans nom"}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={assignProgramme.isLoading}
                  className={`w-full bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-md hover:bg-[color:var(--theme-secondary)] transition-colors text-sm ${
                    assignProgramme.isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {assignProgramme.isLoading ? "Assignation..." : "Assigner"}
                </button>
              </form>
            )}
            {modal.type === "assignPoste" && (
              <form onSubmit={handleAssignPoste} className="space-y-4">
                <div>
                  <label className={`block ${darkMode ? "text-gray-200" : "text-gray-700"} font-medium mb-1`} htmlFor="posteId">
                    Sélectionner un Poste *
                  </label>
                  <select
                    id="posteId"
                    value={assignForm.posteId}
                    onChange={(e) => setAssignForm({ ...assignForm, posteId: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--theme-primary)] ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-300" : "bg-white border-gray-300 text-gray-900"
                    }`}
                    required
                  >
                    <option value="">Choisir un poste</option>
                    {postes?.map((poste) => (
                      <option key={poste.id} value={poste.id}>
                        {formatPosteOption(poste)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={assignPoste.isLoading}
                  className={`w-full bg-[color:var(--theme-primary)] text-white px-4 py-2 rounded-md hover:bg-[color:var(--theme-secondary)] transition-colors text-sm ${
                    assignPoste.isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {assignPoste.isLoading ? "Assignation..." : "Assigner"}
                </button>
              </form>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default FormationDetail;