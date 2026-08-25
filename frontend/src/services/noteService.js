const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

const requestOptions = (options = {}) => ({
  ...options,
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  },
});

const request = async (url, options, fallbackMessage) => {
  let response;

  try {
    response = await fetch(url, requestOptions(options));
  } catch (error) {
    throw new Error(`${fallbackMessage}: service unavailable`, { cause: error });
  }

  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    if (response.ok) {
      throw new Error(`${fallbackMessage}: invalid server response`, {
        cause: error,
      });
    }
  }

  if (!response.ok) throw new Error(data.message || fallbackMessage);
  return data;
};

// GET /notes
export const getNotes = async () => {
  return request(`${API_URL}/notes`, undefined, "Failed to fetch notes");
};

// GET /notes/:id
export const getNote = async (id) => {
  return request(`${API_URL}/notes/${id}`, undefined, "Failed to fetch note");
};

// POST /notes
export const createNote = async (noteData) => {
  return request(
    `${API_URL}/notes`,
    { method: "POST", body: JSON.stringify(noteData) },
    "Failed to create note",
  );
};

// PUT /notes/:id
export const updateNote = async (id, noteData) => {
  return request(
    `${API_URL}/notes/${id}`,
    { method: "PUT", body: JSON.stringify(noteData) },
    "Failed to update note",
  );
};

// DELETE /notes/:id
export const deleteNote = async (id) => {
  return request(
    `${API_URL}/notes/${id}`,
    { method: "DELETE" },
    "Failed to delete note",
  );
};