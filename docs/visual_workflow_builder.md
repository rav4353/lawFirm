# Module: Visual Workflow Builder

The Visual Workflow Builder is the primary interface for legal teams to design compliance checks. It is built using **React Flow**, providing an interactive and intuitive canvas.

## Features
- **Interactive Canvas:** Drag-and-drop nodes, connect them to define data flow, and delete nodes/edges.
- **Node Types:**
    - `Document Upload`: File input for NDAs and contracts.
    - `Extract Text`: AI-driven text extraction from PDFs.
    - `Analyze GDPR`: Specialized node for European privacy compliance.
    - `Analyze CCPA`: Specialized node for California privacy compliance.
    - `Score Compliance`: Aggregates analysis into a final score.
- **Real-Time Validation:** Ensuring workflow logic is sound (e.g., an analysis node needs a text input).
- **Persistence:** Workflows are saved to and loaded from the PostgreSQL backend.

## Role-Based Access
- **Associate:** Full access to create, modify, and save workflow templates.
- **Paralegal:** Executional access only—can trigger existing workflows and view results but cannot modify the canvas.

## Workflow Engine Rule
- **No Hardcoded Logic:** All workflow progression and node logic MUST be managed by the backend engine. The frontend is a visual representation only.
- **Validation:** Workflows must be validated against the schema and role permissions before execution.
- **Persistence:** Definitions are stored in PostgreSQL; executions are logged to the immutable audit trail.

## UI/UX & Responsiveness
- **Adaptive Canvas:** The React Flow canvas must resize gracefully to the viewport.
- **Mobile Navigation:** Sidebars and toolbars must collapse or adapt for smaller screens.
- **Interactive Scaling:** Support for pinch-to-zoom and touch gestures.
