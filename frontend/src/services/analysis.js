import api from "./api";

export const analysisService = {
  /**
   * Trigger a GDPR/CCPA compliance analysis on a document.
   * @param {string} documentId
   * @returns {Promise<object>} ComplianceAnalysisResponse
   */
  async analyzeDocument(documentId, workflowId = null) {
    let url = `/analyze-document?document_id=${encodeURIComponent(documentId)}`;
    if (workflowId) {
      url += `&workflow_id=${encodeURIComponent(workflowId)}`;
    }
    const response = await api.post(url);
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
