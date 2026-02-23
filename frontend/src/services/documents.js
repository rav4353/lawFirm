import api from "./api";

export const documentService = {
  async upload(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/documents/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async list() {
    const response = await api.get("/documents");
    return response.data;
  },

  async get(id) {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  },

  async remove(id) {
    await api.delete(`/documents/${id}`);
  },
};
