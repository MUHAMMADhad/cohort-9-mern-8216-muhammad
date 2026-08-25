const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

const requestOptions = (options = {}) => ({
  ...options,
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  },
});

// GET /notes
export const getNotes = async () => {
  const response = await fetch(`${API_URL}/notes`, requestOptions());

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch notes");
  }

  return data;
};

// GET /notes/:id
export const getNote = async (id) => {
  const response = await fetch(
    `${API_URL}/notes/${id}`,
    requestOptions()
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch note");
  }

  return data;
};

// POST /notes
export const createNote = async (noteData) => {
  const response = await fetch(
    `${API_URL}/notes`,
    requestOptions({
      method: "POST",
      body: JSON.stringify(noteData),
    })
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create note");
  }

  return data;
};

// PUT /notes/:id
export const updateNote = async (id, noteData) => {
  const response = await fetch(
    `${API_URL}/notes/${id}`,
    requestOptions({
      method: "PUT",
      body: JSON.stringify(noteData),
    })
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update note");
  }

  return data;
};

// DELETE /notes/:id
export const deleteNote = async (id) => {
  const response = await fetch(
    `${API_URL}/notes/${id}`,
    requestOptions({
      method: "DELETE",
    })
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete note");
  }

  return data;
};