// src/components/StoryDetails.jsx

import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export const StoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: story, isLoading, error } = useStory(id);
  const updateStory = useUpdateStory();
  const deleteStory = useDeleteStory();
  const [caption, setCaption] = useState("");

  const handleUpdate = () => {
    updateStory.mutate(
      { id, caption, token: "" },
      {
        onSuccess: () => {
          alert("Story updated successfully");
          setCaption("");
        },
      }
    );
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this story?")) {
      deleteStory.mutate(
        { id },
        {
          onSuccess: () => {
            alert("Story deleted successfully");
            navigate("/stories");
          },
        }
      );
    }
  };

  if (isLoading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">Error: {error.message}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Story Details</h1>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="space-y-4">
          <p><strong>ID:</strong> {story.id}</p>
          <p><strong>Views:</strong> {story.viewsCount || 0}</p>
          <p><strong>Expired:</strong> {story.expired ? "Yes" : "No"}</p>
          <p><strong>Created:</strong> {new Date(story.createdAt).toLocaleDateString()}</p>
          {story.caption && <p><strong>Caption:</strong> {story.caption}</p>}
          
          {/* Update Form */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Update Caption</h3>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-2 border rounded-md mb-2"
              placeholder="New caption"
            />
            <button
              onClick={handleUpdate}
              disabled={updateStory.isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {updateStory.isLoading ? "Updating..." : "Update"}
            </button>
          </div>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={deleteStory.isLoading}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-red-300"
          >
            {deleteStory.isLoading ? "Deleting..." : "Delete Story"}
          </button>
        </div>
      </div>
    </div>
  );
};