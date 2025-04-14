import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Login from './components/Login/Login';
import Navbar from './components/NavBar/Navbar';
import NavLeft from './components/NavBar/NavLeft';
import Settings from './components/Admin/Settings';
import MyInfo from './components/user/MyInfo';
import AdminDashboard from './components/Admin/AdminDashboard'; // Ajout du dashboard admin
import { loadUser } from './features/authSlice';
import ListUsers from './components/Admin/ListUsers';
import DetailsUser from './components/Admin/DetailsUser';
import CreateUser from './components/Admin/CreateUser';
import ListSites from './components/Admin/sites/ListSites';
import CreateSite from './components/Admin/sites/CreateSite';
import SiteDetails from './components/Admin/sites/SiteDetails';
import ListSocietes from './components/Admin/societe/ListSocietes';
import SocieteDetail from './components/Admin/societe/SocieteDetail';
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
import StoryList from './components/Admin/Story/StoryAlbum';
import StoryAlbum from './components/Admin/Story/StoryAlbum';



function App() {
  const dispatch = useDispatch();
  const { isLoading, token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const { token, user } = useSelector((state) => state.auth);

  const isAdmin = user?.role === 'admin';
  const showNavbarAndNavLeft = location.pathname !== '/login';

  return (
    <>
      {showNavbarAndNavLeft && <Navbar />}
      <div className="middle-sidebar-bottom">
        {showNavbarAndNavLeft && <NavLeft />}
        <Routes>
          {/* Redirection par défaut */}
          <Route
            path="/"
            element={
              token ? (
                isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/settings" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Route de connexion */}
          <Route path="/login" element={token ? <Navigate to="/settings" replace /> : <Login />} />

          {/* Page utilisateur */}
          <Route path="/myinfo" element={token ? <MyInfo /> : <Navigate to="/login" replace />} />

          {/* Paramètres utilisateur */}
          <Route path="/settings" element={token ? <Settings /> : <Navigate to="/login" replace />} />

          
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
          <Route path="/stories" element={token ? <StoryAlbum /> : <Navigate to="/login" replace />} />
          <Route path="/story/:id" element={token ? <StoryDetails /> : <Navigate to="/login" replace />} />
          <Route path="/create-story" element={token ? <CreateStory /> : <Navigate to="/login" replace />} />
          
          {/* Page 404 */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </div>
    </>
  );
}

export default App;
