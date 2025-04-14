// src/components/CreateStory.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const CreateStory = ({ userId }) => {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const createStory = useCreateStory();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    createStory.mutate(
      { userId, file, caption },
      {
        onSuccess: () => {
          alert("Story created successfully");
          setFile(null);
          setCaption("");
          navigate("/stories");
        },
      }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Story</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Media File</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Caption (Optional)</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Enter caption"
          />
        </div>
        <button
          type="submit"
          disabled={createStory.isLoading}
          className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-green-300"
        >
          {createStory.isLoading ? "Creating..." : "Create Story"}
        </button>
      </form>
    </div>
  );
};