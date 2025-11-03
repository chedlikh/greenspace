import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8089';

// Generic fetch utility with token authentication
const fetchData = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Authentication token not found. Please log in.');

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, use default message
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content responses
    if (response.status === 204) return null;

    return response.json();
  } catch (error) {
    throw new Error(`Fetch error: ${error.message}`);
  }
};

// --- Formation Endpoints ---
export const fetchAllFormations = async (page = 0, size = 10) => {
  const response = await fetchData(`/api/formations?page=${page}&size=${size}`);
  return Array.isArray(response) ? response : response.content || [];
};

export const createFormation = (data) => fetchData('/api/formations', { method: 'POST', body: JSON.stringify(data) });
export const updateFormation = (id, data) => fetchData(`/api/formations/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteFormation = (id) => fetchData(`/api/formations/${id}`, { method: 'DELETE' });
export const fetchFormationById = (id) => fetchData(`/api/formations/${id}`);
export const assignCabinetToFormation = (formationId, cabinetId) =>
  fetchData(`/api/formations/${formationId}/cabinets/${cabinetId}`, { method: 'POST' });
export const unassignCabinetFromFormation = (formationId, cabinetId) =>
  fetchData(`/api/formations/${formationId}/cabinets/${cabinetId}`, { method: 'DELETE' });
export const assignPosteToFormation = (formationId, posteId) =>
  fetchData(`/api/formations/${formationId}/postes/${posteId}`, { method: 'POST' });
export const unassignPosteFromFormation = (formationId, posteId) =>
  fetchData(`/api/formations/${formationId}/postes/${posteId}`, { method: 'DELETE' });

// --- Formation React Query Hooks ---
export const useAllFormations = (page = 0, size = 10) =>
  useQuery({
    queryKey: ['formations', page, size],
    queryFn: () => fetchAllFormations(page, size),
    keepPreviousData: true,
  });

export const useCreateFormation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFormation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formations'] }),
  });
};

export const useUpdateFormation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateFormation(id, data),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['formations', id] }),
  });
};

export const useDeleteFormation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFormation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formations'] }),
  });
};

export const useFormationById = (id) =>
  useQuery({
    queryKey: ['formations', id],
    queryFn: () => fetchFormationById(id),
    enabled: !!id,
  });

export const useAssignCabinetToFormation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formationId, cabinetId }) => assignCabinetToFormation(formationId, cabinetId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formations'] }),
  });
};

export const useUnassignCabinetFromFormation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formationId, cabinetId }) => unassignCabinetFromFormation(formationId, cabinetId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formations'] }),
  });
};

export const useAssignPosteToFormation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formationId, posteId }) => assignPosteToFormation(formationId, posteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formations'] }),
  });
};

export const useUnassignPosteFromFormation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ formationId, posteId }) => unassignPosteFromFormation(formationId, posteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formations'] }),
  });
};

// --- Cabinet Endpoints ---
export const createCabinet = (data) => fetchData('/api/cabinets', { method: 'POST', body: JSON.stringify(data) });
export const updateCabinet = (id, data) => fetchData(`/api/cabinets/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCabinet = (id) => fetchData(`/api/cabinets/${id}`, { method: 'DELETE' });
export const fetchCabinetById = (id) => fetchData(`/api/cabinets/${id}`);
export const fetchAllCabinets = async () => {
  return await fetchData('/api/cabinets');
};
export const assignSessionToCabinet = (cabinetId, sessionId) =>
  fetchData(`/api/cabinets/${cabinetId}/sessions/${sessionId}`, { method: 'POST' });
export const unassignSessionFromCabinet = (cabinetId, sessionId) =>
  fetchData(`/api/cabinets/${cabinetId}/sessions/${sessionId}`, { method: 'DELETE' });

// --- Cabinet React Query Hooks ---
export const useCreateCabinet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCabinet,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cabinets'] }),
  });
};

export const useUpdateCabinet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateCabinet(id, data),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['cabinets', id] }),
  });
};

export const useDeleteCabinet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCabinet,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cabinets'] }),
  });
};

export const useCabinetById = (id) =>
  useQuery({
    queryKey: ['cabinets', id],
    queryFn: () => fetchCabinetById(id),
    enabled: !!id,
  });

export const useAllCabinets = () =>
  useQuery({
    queryKey: ['cabinets'],
    queryFn: () => fetchAllCabinets(),
  });

export const useAssignSessionToCabinet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cabinetId, sessionId }) => assignSessionToCabinet(cabinetId, sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cabinets', 'formations', 'sessions'] }),
  });
};

export const useUnassignSessionFromCabinet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cabinetId, sessionId }) => unassignSessionFromCabinet(cabinetId, sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cabinets', 'formations', 'sessions'] }),
  });
};

export const useAssignedSessionsForCabinet = (cabinetId) =>
  useQuery({
    queryKey: ['sessions', cabinetId],
    queryFn: () => fetchData(`/api/cabinets/${cabinetId}/sessions`),
    enabled: !!cabinetId,
  });

// --- Session Endpoints ---
export const createSession = (data) => fetchData('/api/sessions', { method: 'POST', body: JSON.stringify(data) });
export const updateSession = (id, data) => fetchData(`/api/sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteSession = (id) => fetchData(`/api/sessions/${id}`, { method: 'DELETE' });
export const fetchSessionById = (id) => fetchData(`/api/sessions/${id}`);
export const fetchAllSessions = async (page = 0, size = 10) => {
  const response = await fetchData(`/api/sessions?page=${page}&size=${size}`);
  return response.content || [];
};
export const fetchAllSessionsWithoutSort = async () => {
  const response = await fetchData('/api/sessions');
  return Array.isArray(response) ? response : response.content || [];
};
export const assignFormateurToSession = (sessionId, formateurId) =>
  fetchData(`/api/sessions/${sessionId}/formateurs/${formateurId}`, { method: 'POST' });
export const unassignFormateurFromSession = (sessionId, formateurId) =>
  fetchData(`/api/sessions/${sessionId}/formateurs/${formateurId}`, { method: 'DELETE' });
export const assignProgrammeToSession = (sessionId, programmeId) =>
  fetchData(`/api/sessions/${sessionId}/programmes/${programmeId}`, { method: 'POST' });
export const unassignProgrammeFromSession = (sessionId, programmeId) =>
  fetchData(`/api/sessions/${sessionId}/programmes/${programmeId}`, { method: 'DELETE' });

// --- Session React Query Hooks ---
export const useCreateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions', 'formations'] }),
  });
};

export const useUpdateSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateSession(id, data),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['sessions', id, 'formations'] }),
  });
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions', 'formations'] }),
  });
};

export const useSessionById = (id) =>
  useQuery({
    queryKey: ['sessions', id],
    queryFn: () => fetchSessionById(id),
    enabled: !!id,
  });

export const useAllSessions = (page = 0, size = 10) =>
  useQuery({
    queryKey: ['sessions', page, size],
    queryFn: () => fetchAllSessions(page, size),
  });

export const useAllSessionsWithoutSort = () =>
  useQuery({
    queryKey: ['sessions', 'unsorted'],
    queryFn: () => fetchAllSessionsWithoutSort(),
  });

export const useAssignFormateurToSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, formateurId }) => assignFormateurToSession(sessionId, formateurId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions', 'formateurs'] }),
  });
};

export const useUnassignFormateurFromSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, formateurId }) => unassignFormateurFromSession(sessionId, formateurId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions', 'formateurs'] }),
  });
};

export const useAssignProgrammeToSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, programmeId }) => assignProgrammeToSession(sessionId, programmeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions', 'programmes', 'formations'] }),
  });
};

export const useUnassignProgrammeFromSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, programmeId }) => unassignProgrammeFromSession(sessionId, programmeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions', 'programmes', 'formations'] }),
  });
};

// --- Programme Endpoints ---
export const createProgramme = (data) => fetchData('/api/programmes', { method: 'POST', body: JSON.stringify(data) });
export const updateProgramme = (id, data) => fetchData(`/api/programmes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProgramme = (id) => fetchData(`/api/programmes/${id}`, { method: 'DELETE' });
export const fetchProgrammeById = (id) => fetchData(`/api/programmes/${id}`);
export const fetchAllProgrammes = async () => {
  const response = await fetchData('/api/programmes');
  return Array.isArray(response) ? response : response.content || [];
};

// --- Programme React Query Hooks ---
export const useCreateProgramme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProgramme,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['programmes', 'sessions', 'formations'] }),
  });
};

export const useUpdateProgramme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateProgramme(id, data),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['programmes', id, 'sessions', 'formations'] }),
  });
};

export const useDeleteProgramme = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProgramme,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['programmes', 'sessions', 'formations'] }),
  });
};

export const useProgrammeById = (id) =>
  useQuery({
    queryKey: ['programmes', id],
    queryFn: () => fetchProgrammeById(id),
    enabled: !!id,
  });

export const useAllProgrammes = () =>
  useQuery({
    queryKey: ['programmes'],
    queryFn: () => fetchAllProgrammes(),
  });

// --- Formateur Endpoints ---
export const createFormateur = (data) => fetchData('/api/formateurs', { method: 'POST', body: JSON.stringify(data) });
export const updateFormateur = (id, data) => fetchData(`/api/formateurs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteFormateur = (id) => fetchData(`/api/formateurs/${id}`, { method: 'DELETE' });
export const fetchFormateurById = (id) => fetchData(`/api/formateurs/${id}`);
export const fetchAllFormateurs = async () => {
  const response = await fetchData('/api/formateurs');
  return Array.isArray(response) ? response : response.content || [];
};

// --- Formateur React Query Hooks ---
export const useCreateFormateur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFormateur,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formateurs'] }),
  });
};

export const useUpdateFormateur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateFormateur(id, data),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['formateurs', id] }),
  });
};

export const useDeleteFormateur = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFormateur,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formateurs'] }),
  });
};

export const useFormateurById = (id) =>
  useQuery({
    queryKey: ['formateurs', id],
    queryFn: () => fetchFormateurById(id),
    enabled: !!id,
  });

export const useAllFormateurs = () =>
  useQuery({
    queryKey: ['formateurs'],
    queryFn: () => fetchAllFormateurs(),
  });

// --- Demande Endpoints ---
export const createDemande = (data) => fetchData('/api/demandes', { method: 'POST', body: JSON.stringify(data) });
export const updateDemande = (id, data) => fetchData(`/api/demandes/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteDemande = (id) => fetchData(`/api/demandes/${id}`, { method: 'DELETE' });
export const fetchDemandeById = (id) => fetchData(`/api/demandes/${id}`);
export const fetchAllDemandes = async (page = 0, size = 10) => {
  const response = await fetchData(`/api/demandes?page=${page}&size=${size}`);
  return response.content || [];
};
export const approveDemande = (id, adminId) =>
  fetchData(`/api/demandes/${id}/approve?adminId=${adminId}`, { method: 'POST' });
export const rejectDemande = (id, adminId) =>
  fetchData(`/api/demandes/${id}/reject?adminId=${adminId}`, { method: 'POST' });

// --- Demande React Query Hooks ---
export const useCreateDemande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDemande,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['demandes'] }),
  });
};

export const useUpdateDemande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateDemande(id, data),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['demandes', id] }),
  });
};

export const useDeleteDemande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDemande,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['demandes'] }),
  });
};

export const useDemandeById = (id) =>
  useQuery({
    queryKey: ['demandes', id],
    queryFn: () => fetchDemandeById(id),
    enabled: !!id,
  });

export const useAllDemandes = (page = 0, size = 10) =>
  useQuery({
    queryKey: ['demandes', page, size],
    queryFn: () => fetchAllDemandes(page, size),
  });

export const useApproveDemande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminId }) => approveDemande(id, adminId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['demandes'] }),
  });
};

export const useRejectDemande = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminId }) => rejectDemande(id, adminId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['demandes'] }),
  });
};

// --- FormationRequest Endpoints ---
export const createFormationRequest = (data) =>
  fetchData('/api/formation-requests', { method: 'POST', body: JSON.stringify(data) });
export const updateFormationRequest = (id, data) =>
  fetchData(`/api/formation-requests/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteFormationRequest = (id) => fetchData(`/api/formation-requests/${id}`, { method: 'DELETE' });
export const fetchFormationRequestById = (id) => fetchData(`/api/formation-requests/${id}`);
export const fetchAllFormationRequests = async (page = 0, size = 10) => {
  const response = await fetchData(`/api/formation-requests?page=${page}&size=${size}`);
  return response.content || [];
};
export const approveFormationRequest = (id, adminId) =>
  fetchData(`/api/formation-requests/${id}/approve?adminId=${adminId}`, { method: 'POST' });
export const rejectFormationRequest = (id, adminId) =>
  fetchData(`/api/formation-requests/${id}/reject?adminId=${adminId}`, { method: 'POST' });

// --- FormationRequest React Query Hooks ---
export const useCreateFormationRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFormationRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-requests'] }),
  });
};

export const useUpdateFormationRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => updateFormationRequest(id, data),
    onSuccess: (_, { id }) => queryClient.invalidateQueries({ queryKey: ['formation-requests', id] }),
  });
};

export const useDeleteFormationRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFormationRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-requests'] }),
  });
};

export const useFormationRequestById = (id) =>
  useQuery({
    queryKey: ['formation-requests', id],
    queryFn: () => fetchFormationRequestById(id),
    enabled: !!id,
  });

export const useAllFormationRequests = (page = 0, size = 10) =>
  useQuery({
    queryKey: ['formation-requests', page, size],
    queryFn: () => fetchAllFormationRequests(page, size),
  });

export const useApproveFormationRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminId }) => approveFormationRequest(id, adminId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-requests'] }),
  });
};

export const useRejectFormationRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, adminId }) => rejectFormationRequest(id, adminId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['formation-requests'] }),
  });
};
// Add these to your existing Session Endpoints section:



// Assign multiple programmes to a session
export const assignMultipleProgrammesToSession = (sessionId, programmeIds) =>
  fetchData(`/api/sessions/${sessionId}/programmes/batch-assign`, {
    method: 'POST',
    body: JSON.stringify(programmeIds)
  });

// Get sessions by formateur
export const fetchSessionsByFormateur = (formateurId) =>
  fetchData(`/api/sessions/formateurs/${formateurId}`);

// Get sessions by programme
export const fetchSessionsByProgramme = (programmeId) =>
  fetchData(`/api/sessions/programmes/${programmeId}`);

// Clone session
export const cloneSession = (sessionId) =>
  fetchData(`/api/sessions/${sessionId}/clone`, { method: 'POST' });

// Add these to your existing Session React Query Hooks section:

export const fetchNotAssignedProgrammes = () => 
  fetchData('/api/sessions/programmes/not-assigned');

export const useNotAssignedProgrammes = () =>
  useQuery({
    queryKey: ['not-assigned-programmes'],
    queryFn: () => fetchNotAssignedProgrammes(),
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error.message.includes('401')) return false;
      return failureCount < 3;
    }
  });

export const useAssignMultipleProgrammesToSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, programmeIds }) => assignMultipleProgrammesToSession(sessionId, programmeIds),
    onSuccess: () => queryClient.invalidateQueries({ 
      queryKey: ['sessions', 'programmes', 'formations'] 
    }),
  });
};

export const useSessionsByFormateur = (formateurId) =>
  useQuery({
    queryKey: ['sessions', 'formateur', formateurId],
    queryFn: () => fetchSessionsByFormateur(formateurId),
    enabled: !!formateurId,
  });

export const useSessionsByProgramme = (programmeId) =>
  useQuery({
    queryKey: ['sessions', 'programme', programmeId],
    queryFn: () => fetchSessionsByProgramme(programmeId),
    enabled: !!programmeId,
  });

export const useCloneSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cloneSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessions'] }),
  });
};
// --- Demande Endpoints ---
export const fetchDemandesByUserId = async (userId, page = 0, size = 10) => {
  const response = await fetchData(`/api/demandes/user/${userId}?page=${page}&size=${size}`);
  return response || [];
};

// --- Demande React Query Hooks ---
export const useDemandesByUserId = (userId, page = 0, size = 10) =>
  useQuery({
    queryKey: ['demandes', 'user', userId, page, size],
    queryFn: () => fetchDemandesByUserId(userId, page, size),
    enabled: !!userId,
  });
  // --- Demande Endpoints ---
  export const fetchDemandesBySessionId = async (sessionId, page = 0, size = 10) => {
    const response = await fetchData(`/api/demandes/session/${sessionId}?page=${page}&size=${size}`);
    return response || [];
  };

  // --- Demande React Query Hooks ---
  export const useDemandesBySessionId = (sessionId, page = 0, size = 10) =>
    useQuery({
      queryKey: ['demandes', 'session', sessionId, page, size],
      queryFn: () => fetchDemandesBySessionId(sessionId, page, size),
      enabled: !!sessionId,
    });

    export const fetchFormationsByPoste = async (posteId) => {
  const response = await fetchData(`/api/formations/poste/${posteId}`);
  return Array.isArray(response) ? response : response.content || [];
};

export const fetchUpcomingFormations = async () => {
  const response = await fetchData('/api/formations/upcoming');
  return Array.isArray(response) ? response : response.content || [];
};

export const fetchStartedFormations = async () => {
  const response = await fetchData('/api/formations/started');
  return Array.isArray(response) ? response : response.content || [];
};

export const fetchFinishedFormations = async () => {
  const response = await fetchData('/api/formations/finished');
  return Array.isArray(response) ? response : response.content || [];
};
export const useFormationsByPoste = (posteId) =>
  useQuery({
    queryKey: ['formations', 'poste', posteId],
    queryFn: () => fetchFormationsByPoste(posteId),
    enabled: !!posteId,
  });

export const useUpcomingFormations = () =>
  useQuery({
    queryKey: ['formations', 'upcoming'],
    queryFn: () => fetchUpcomingFormations(),
  });

export const useStartedFormations = () =>
  useQuery({
    queryKey: ['formations', 'started'],
    queryFn: () => fetchStartedFormations(),
  });

export const useFinishedFormations = () =>
  useQuery({
    queryKey: ['formations', 'finished'],
    queryFn: () => fetchFinishedFormations(),
  });
