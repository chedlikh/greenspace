import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import {
  useSiteById,
  useUpdateSite,
  useDeleteSite,
  useAssignUsersToSite,
  useUsers,
} from "../../../services/hooks";

// Draggable UserCard Component
function UserCard({ user }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: user.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="cursor-grab rounded-lg bg-white p-4 shadow-md hover:shadow-lg transition-shadow duration-200"
      style={style}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{user.username}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
    </div>
  );
}

// Droppable Column Component
function Column({ id, title, users }) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className="flex w-80 flex-col rounded-lg bg-gradient-to-b from-neutral-50 to-neutral-100 p-4 border border-neutral-200"
    >
      <h2 className="mb-4 font-semibold text-neutral-700 text-lg">{title}</h2>
      <div className="flex flex-1 flex-col gap-3">
        {users.map((user) => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}

// SiteDetails Component
const SiteDetails = () => {
  const { id } = useParams(); // Get site ID from URL
  const token = useSelector((state) => state.auth.token); // Get token from Redux
  const navigate = useNavigate();

  // Fetch site details using custom hook
  const { data: site, isLoading, isError, error } = useSiteById(id, token);

  // Fetch all users
  const { usersQuery } = useUsers();
  const { data: users = [], isUsersLoading, isUsersError } = usersQuery;

  // Update site mutation
  const updateSiteMutation = useUpdateSite(id, token);

  // Delete site mutation
  const deleteSiteMutation = useDeleteSite(id, token);

  // Assign users to site mutation
  const assignUsersMutation = useAssignUsersToSite(id);

  // Local state for editable fields
  const [editableSite, setEditableSite] = useState({
    nom: "",
    adresse: "",
    type: "",
  });

  // Local state for available and assigned users
  const [availableUsers, setAvailableUsers] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);

  // Update local state when site data is fetched
  useEffect(() => {
    if (site) {
      setEditableSite(site);
    }
  }, [site]);

  // Initialize available and assigned users when users data is fetched
  useEffect(() => {
    if (users.length > 0) {
      setAvailableUsers(users);
      setAssignedUsers([]); // Initially, no users are assigned
    }
  }, [users]);

  // Handle drag end event
  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;

      if (!over) return; // If dropped outside a droppable area, do nothing

      const userId = active.id;
      const destinationId = over.id;

      const user = [...availableUsers, ...assignedUsers].find((u) => u.id === userId);
      if (!user) {
        console.error("User not found");
        return;
      }

      // Move user between lists
      if (destinationId === "availableUsers") {
        setAssignedUsers((prev) => prev.filter((u) => u.id !== userId));
        setAvailableUsers((prev) => [...prev, user]);
      } else if (destinationId === "assignedUsers") {
        setAvailableUsers((prev) => prev.filter((u) => u.id !== userId));
        setAssignedUsers((prev) => [...prev, user]);

        // Assign the user to the site
        assignUsersMutation.mutate([user.username], {
          onSuccess: () => {
            console.log("User assigned to site successfully");
          },
          onError: (error) => {
            console.error("Error assigning user to site:", error);
          },
        });
      }
    },
    [availableUsers, assignedUsers, assignUsersMutation]
  );

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableSite((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle update button click
  const handleUpdate = () => {
    updateSiteMutation.mutate(editableSite);
  };

  // Handle delete button click
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${editableSite.nom}?`)) {
      deleteSiteMutation.mutate();
      navigate("/sites"); // Redirect to the sites list after deletion
    }
  };

  if (isLoading || isUsersLoading) {
    return <div>Loading...</div>;
  }

  if (isError || isUsersError) {
    return <div>Error: {error?.message || usersError?.message}</div>;
  }

  return (
    <div className="main-content bg-lightblue theme-dark-bg right-chat-active">
      <div className="middle-sidebar-bottom">
        <div className="middle-wrap">
          <div className="card w-100 border-0 bg-white shadow-xs p-0 mb-4">
            <div className="card-body p-4 w-100 bg-blue-gradiant border-0 d-flex rounded-3">
              <h4 className="font-xs text-white fw-600 ms-4 mb-0 mt-2">Site Details</h4>
            </div>
            <div className="card-body p-lg-5 p-4 w-100 border-0">
              <div className="row justify-content-center">
                <div className="col-lg-4 text-center">
                  <h2 className="fw-700 font-sm text-grey-900 mt-3">{editableSite.nom}</h2>
                  <h4 className="text-grey-500 fw-500 mb-3 font-xsss mb-4">
                    {editableSite.adresse}
                  </h4>
                </div>
              </div>

              {/* Editable site details form */}
              <form>
                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nom"
                      value={editableSite.nom || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      name="adresse"
                      value={editableSite.adresse || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <label className="mont-font fw-600 font-xsss">Type</label>
                    <select
                      className="form-control"
                      name="type"
                      value={editableSite.type || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value={editableSite.type || ""}>{editableSite.type || ""}</option>
                      <option value="MAGASIN">Magasin</option>
                      <option value="SIEGE">Siege</option>
                    </select>
                  </div>
                </div>

                {/* Drag-and-Drop Interface */}
                <div className="row mt-4">
                  <div className="col-lg-12">
                    <DndContext onDragEnd={handleDragEnd}>
                      <div className="flex gap-8 justify-center p-6 bg-neutral-50 rounded-lg">
                        {/* Available Users Column */}
                        <Column id="availableUsers" title="Available Users" users={availableUsers} />

                        {/* Assigned Users Column */}
                        <Column id="assignedUsers" title="Assigned Users" users={assignedUsers} />
                      </div>
                    </DndContext>
                  </div>
                </div>

                <div className="row mt-4">
                  <div className="col-lg-12 text-center">
                    <button
                      type="button"
                      className="btn btn-primary me-2"
                      onClick={handleUpdate}
                    >
                      Update
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger me-2"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteDetails;