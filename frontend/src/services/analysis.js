import api from "./api";

export const analysisService = {
  /**
   * Trigger a GDPR/CCPA compliance analysis on a document.
   * @param {string} documentId
   * @returns {Promise<object>} ComplianceAnalysisResponse
   */
  async analyzeDocument(documentId) {
    const response = await api.post(
      `/analyze-document?document_id=${encodeURIComponent(documentId)}`
    );
    return response.data;
  },

  /**
   * Retrieve the latest compliance analysis for a document.
   * @param {string} documentId
   * @returns {Promise<object>} ComplianceAnalysisResponse
   */
  async getAnalysis(documentId) {
    const response = await api.get(`/analysis/${encodeURIComponent(documentId)}`);
    return response.data;
  },
};
