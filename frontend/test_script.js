const fs = require('fs');

const payload = {
  cases: [
    {
      title: "Meta GDPR Violation",
      court: "DPC",
      jurisdiction: "Ireland",
      year: 2023,
      regulation: "GDPR",
      summary: "Fined €1200000000 by DPC for Illegal data transfer to US without adequate safeguards",
      key_ruling: "Fine: €1200000000",
      id: "case-meta-1",
    }
  ],
  ai_summary: "Test summary",
  total: 1
};
console.log("Payload created.");
