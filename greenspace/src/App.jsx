// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Login from './components/Login/Login';
import Navbar from './components/NavBar/Navbar';
import NavLeft from './components/NavBar/NavLeft';
import Settings from './components/Admin/Settings';
import MyInfo from './components/user/MyInfo';
import AdminDashboard from './components/Admin/AdminDashboard';
import { loadUser } from './features/authSlice';
import ListUsers from './components/Admin/ListUsers';
import DetailsUser from './components/Admin/DetailsUser';
import CreateUser from './components/Admin/CreateUser';
import ListSites from './components/Admin/sites/ListSites';
import CreateSite from './components/Admin/sites/CreateSite';
import SiteDetails from './components/Admin/sites/SiteDetails';
import ListSocietes from './components/Admin/societe/ListSocietes';
import SocieteDetail from './components/Admin/societe/SocieteDetail';
import CabinetCreate from './components/Admin/Formation/Cabinet/CabinetCreate';
import CabinetDetail from './components/Admin/Formation/Cabinet/CabinetDetail';
import CabinetEdit from './components/Admin/Formation/Cabinet/CabinetEdit';
import CabinetList from './components/Admin/Formation/Cabinet/CabinetList';
import ListServices from './components/Admin/Services/ListServices';
import ServiceDetail from './components/Admin/Services/ServiceDetail';
import GserviceCreate from './components/Admin/Services/GserviceCreate';
import CreateSociete from './components/Admin/societe/CreateSociete';
import ListPostes from './components/Admin/Poste/ListPostes';
import CreatePoste from './components/Admin/Poste/CreatePoste';
import PosteDetail from './components/Admin/Poste/PosteDetail';
import ListSondage from './components/Admin/Sondage/ListSondage';
import SondageDetail from './components/Admin/Sondage/SondageDetail';
import CreateSondage from './components/Admin/Sondage/CreateSondage';
import { StoryDetails } from './components/Admin/Story/StoryDetails';
import { CreateStory } from './components/Admin/Story/CreateStory';
import StoryAlbum from './components/Admin/Story/StoryAlbum';
import ProfilePage from './components/FrontOffice/ProfilePage';
import NotificationManager from './components/NotificationManager';
import ChatManager from './components/ChatManager';
import ChatLayout from './components/ChatLayout'; // New layout component
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomePage from './components/FrontOffice/HomePage';
import GroupList from './components/FrontOffice/Group/GroupList';
import GroupProfile from './components/FrontOffice/Group/GroupProfile';
import CreateGroupForm from './components/FrontOffice/Group/CreateGroupForm';
import SondageResponseForm from './components/FrontOffice/Sondage/SondageResponseForm';
import UserSondageResponse from './components/FrontOffice/Sondage/UserSondageResponse';
import FormationList from './components/Admin/Formation/FormationList';
import FormationDetail from './components/Admin/Formation/FormationDetail';
import FormationCreate from './components/Admin/Formation/FormationCreate';
import FormationEdit from './components/Admin/Formation/FormationEdit';
import SessionCreate from './components/Admin/Formation/Session/SessionCreate';
import SessionDetail from './components/Admin/Formation/Session/SessionDetail';
import SessionEdit from './components/Admin/Formation/Session/SessionEdit';
import SessionList from './components/Admin/Formation/Session/SessionList';
import ProgrammeCreate from './components/Admin/Formation/Programme/ProgrammeCreate';
import ProgrammeDetail from './components/Admin/Formation/Programme/ProgrammeDetail';
import ProgrammeEdit from './components/Admin/Formation/Programme/ProgrammeEdit';
import ProgrammeList from './components/Admin/Formation/Programme/ProgrammeList';
import FormationRequestDetail from './components/Admin/Formation/FormationRequest/FormationRequestDetail';
import FormationRequestEdit from './components/Admin/Formation/FormationRequest/FormationRequestEdit';
import FormationRequestList from './components/Admin/Formation/FormationRequest/FormationRequestList';
import FormateurCreate from './components/Admin/Formation/Formateur/FormateurCreate';
import FormateurDetail from './components/Admin/Formation/Formateur/FormateurDetail';
import FormateurEdit from './components/Admin/Formation/Formateur/FormateurEdit';
import FormateurList from './components/Admin/Formation/Formateur/FormateurList';
import DemandeDetail from './components/Admin/Formation/Demande/DemandeDetail';
import DemandeEdit from './components/Admin/Formation/Demande/DemandeEdit';
import DemandeList from './components/Admin/Formation/Demande/DemandeList';
import DemandeCreate from './components/Admin/Formation/Demande/DemandeCreate';
import FormationRequestCreate from './components/Admin/Formation/FormationRequest/FormationRequestCreate';
import SondageStatsResponse from './components/Admin/Sondage/SondageStatsResponse';
import UserDemandeManager from './components/Admin/Formation/UserDemandeManager';
import ForgotPassword from './components/Login/ForgotPassword';
import ErrorBoundary from './components/ErrorBoundary';
import WebSocketTest from './components/WebSocketTest';
import { WebSocketProvider,useWebSocketContext } from './features/WebSocketProvider';

function App() {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <ToastContainer />
      <WebSocketProvider>
        <AppContent />
      </WebSocketProvider>
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const { token, user } = useSelector((state) => state.auth);
  const { connected } = useWebSocketContext();

  const isAdmin = user?.role === 'ADMIN';
  const isAuthPage = ['/login', '/forgot-password', '/reset-password'].includes(location.pathname);
  const hideNavLeft = location.pathname.startsWith('/conversations');
  const showNavbar = !isAuthPage;
  const showNavLeft = showNavbar && !hideNavLeft;

  useEffect(() => {
    if (token && !connected) {
      console.log('WebSocket not connected, waiting for connection...');
    }
  }, [connected, token]);

  return (
    <>
      {showNavbar && <Navbar />}
      <div className={`middle-sidebar-bottom ${!showNavLeft ? 'full-width-content' : ''}`}>
        {showNavLeft && <NavLeft />}
        {token && <NotificationManager />}
        <Routes>
          <Route
            path="/"
            element={
              token ? (
                isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/home" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="/login" element={token ? <Navigate to="/home" replace /> : <Login />} />
          <Route
            path="/forgot-password"
            element={
              <ErrorBoundary>
                <ForgotPassword />
              </ErrorBoundary>
            }
          />
          <Route
            path="/reset-password"
            element={
              <ErrorBoundary>
                <ForgotPassword />
              </ErrorBoundary>
            }
          />

          {/* Protected Routes */}
          <Route path="/home" element={token ? <HomePage /> : <Navigate to="/login" replace />} />
          <Route path="/myinfo" element={token ? <MyInfo /> : <Navigate to="/login" replace />} />
          <Route path="/settings" element={token ? <Settings /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={token ? <ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="/profile/:username" element={token ? <ProfilePage /> : <Navigate to="/login" replace />} />
          <Route path="/test-ws" element={token ? <WebSocketTest /> : <Navigate to="/login" replace />} />

          {/* Groups */}
          <Route path="/groups" element={token ? <GroupList /> : <Navigate to="/login" replace />} />
          <Route path="/create-group" element={token ? <CreateGroupForm /> : <Navigate to="/login" replace />} />
          <Route path="/groups/:id" element={token ? <GroupProfile /> : <Navigate to="/login" replace />} />

          {/* Sondages */}
          <Route path="/sondage/:id" element={token ? <UserSondageResponse /> : <Navigate to="/login" replace />} />
          <Route path="/sondage/:id/responses" element={token ? <UserSondageResponse /> : <Navigate to="/login" replace />} />
          <Route path="/sondages/:id/stats" element={token ? <SondageStatsResponse /> : <Navigate to="/login" replace />} />

          {/* Stories */}
          <Route path="/stories" element={token ? <StoryAlbum /> : <Navigate to="/login" replace />} />

          {/* Chat Routes */}
          <Route
            path="/conversations"
            element={
              token ? (
                <ChatLayout showConversationListOnly />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/conversations/:id"
            element={
              token ? (
                <ChatLayout />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/conversation"
            element={token ? <Navigate to="/conversations" replace /> : <Navigate to="/login" replace />}
          />

          {/* Admin Routes */}
          <Route path="/admin" element={token ? <AdminDashboard /> : <Navigate to="/login" replace />} />
          <Route path="/users" element={token ? <ListUsers /> : <Navigate to="/login" replace />} />
          <Route path="/u/:username" element={token ? <DetailsUser /> : <Navigate to="/login" replace />} />
          <Route path="/create-user" element={token ? <CreateUser /> : <Navigate to="/login" replace />} />
          <Route path="/sites" element={token ? <ListSites /> : <Navigate to="/login" replace />} />
          <Route path="/create-site" element={token ? <CreateSite /> : <Navigate to="/login" replace />} />
          <Route path="/site/:id" element={token ? <SiteDetails /> : <Navigate to="/login" replace />} />
          <Route path="/societe" element={token ? <ListSocietes /> : <Navigate to="/login" replace />} />
          <Route path="/create-societe" element={token ? <CreateSociete /> : <Navigate to="/login" replace />} />
          <Route path="/societe/:id" element={token ? <SocieteDetail /> : <Navigate to="/login" replace />} />
          <Route path="/Services" element={token ? <ListServices /> : <Navigate to="/login" replace />} />
          <Route path="/services/:id" element={token ? <ServiceDetail /> : <Navigate to="/login" replace />} />
          <Route path="/services/new" element={token ? <GserviceCreate /> : <Navigate to="/login" replace />} />
          <Route path="/postes" element={token ? <ListPostes /> : <Navigate to="/login" replace />} />
          <Route path="/poste/:id" element={token ? <PosteDetail /> : <Navigate to="/login" replace />} />
          <Route path="/create-poste" element={token ? <CreatePoste /> : <Navigate to="/login" replace />} />
          <Route path="/sondages" element={token ? <ListSondage /> : <Navigate to="/login" replace />} />
          <Route path="/sondages/:id" element={token ? <SondageDetail /> : <Navigate to="/login" replace />} />
          <Route path="/sondages/create" element={token ? <CreateSondage /> : <Navigate to="/login" replace />} />
          <Route path="/story/:id" element={token ? <StoryDetails /> : <Navigate to="/login" replace />} />
          <Route path="/create-story" element={token ? <CreateStory /> : <Navigate to="/login" replace />} />
          <Route path="/formations" element={token ? <FormationList /> : <Navigate to="/login" replace />} />
          <Route path="/formations/:id" element={token ? <FormationDetail /> : <Navigate to="/login" replace />} />
          <Route path="/formations/create" element={token ? <FormationCreate /> : <Navigate to="/login" replace />} />
          <Route path="/formations/:id/edit" element={token ? <FormationEdit /> : <Navigate to="/login" replace />} />
          <Route path="/sessions" element={token ? <SessionList /> : <Navigate to="/login" replace />} />
          <Route path="/sessions/:id" element={token ? <SessionDetail /> : <Navigate to="/login" replace />} />
          <Route path="/sessions/create" element={token ? <SessionCreate /> : <Navigate to="/login" replace />} />
          <Route path="/sessions/:id/edit" element={token ? <SessionEdit /> : <Navigate to="/login" replace />} />
          <Route path="/programmes" element={token ? <ProgrammeList /> : <Navigate to="/login" replace />} />
          <Route path="/programmes/:id" element={token ? <ProgrammeDetail /> : <Navigate to="/login" replace />} />
          <Route path="/programmes/create" element={token ? <ProgrammeCreate /> : <Navigate to="/login" replace />} />
          <Route path="/programmes/:id/edit" element={token ? <ProgrammeEdit /> : <Navigate to="/login" replace />} />
          <Route path="/formateurs" element={token ? <FormateurList /> : <Navigate to="/login" replace />} />
          <Route path="/formateurs/:id" element={token ? <FormateurDetail /> : <Navigate to="/login" replace />} />
          <Route path="/formateurs/create" element={token ? <FormateurCreate /> : <Navigate to="/login" replace />} />
          <Route path="/formateurs/:id/edit" element={token ? <FormateurEdit /> : <Navigate to="/login" replace />} />
          <Route path="/cabinets" element={token ? <CabinetList /> : <Navigate to="/login" replace />} />
          <Route path="/cabinets/:id" element={token ? <CabinetDetail /> : <Navigate to="/login" replace />} />
          <Route path="/cabinets/create" element={token ? <CabinetCreate /> : <Navigate to="/login" replace />} />
          <Route path="/cabinets/:id/edit" element={token ? <CabinetEdit /> : <Navigate to="/login" replace />} />
          <Route path="/demandes" element={token ? <DemandeList /> : <Navigate to="/login" replace />} />
          <Route path="/demande" element={token ? <UserDemandeManager /> : <Navigate to="/login" replace />} />
          <Route path="/demandes/:id" element={token ? <DemandeDetail /> : <Navigate to="/login" replace />} />
          <Route path="/demandes/create" element={token ? <DemandeCreate /> : <Navigate to="/login" replace />} />
          <Route path="/demandes/:id/edit" element={token ? <DemandeEdit /> : <Navigate to="/login" replace />} />
          <Route path="/formation-requests" element={token ? <FormationRequestList /> : <Navigate to="/login" replace />} />
          <Route path="/formation-requests/:id" element={token ? <FormationRequestDetail /> : <Navigate to="/login" replace />} />
          <Route path="/formation-requests/create" element={token ? <FormationRequestCreate /> : <Navigate to="/login" replace />} />
          <Route path="/formation-requests/:id/edit" element={token ? <FormationRequestEdit /> : <Navigate to="/login" replace />} />

          {/* 404 Route */}
          <Route path="*" element={token ? <div>404 Not Found</div> : <Navigate to="/login" replace />} />
        </Routes>
      </div>
    </>
  );
}

export default App;