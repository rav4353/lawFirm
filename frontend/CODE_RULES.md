# Frontend Code Rules

## 1. Form Handling & Validation

- **Library**: ALWAYS use `react-hook-form` for form state management. Do not use standard React `useState` for form fields.
- **Browser Validation**: Disable default browser validation by adding the `noValidate` attribute to all `<form>` elements.
- **Inline Validation**: All forms must display inline error messages below each input field when validation fails. Do not rely solely on top-level alerts for field-specific errors.
- **Error Styling**: Use consistent styling for inline errors (e.g., text-red-400 with an AlertCircle icon).
- **Custom Warnings & Alerts**: Any top-level warnings, alerts, or toast notifications should use our custom UI components, not browser-native `alert()`, `confirm()`, or `prompt()`.

## 2. General Principles

- **Modern React**: Use functional components and hooks.
- **Styling**: Ensure all new components follow the existing dark mode aesthetic combining Tailwind CSS and Framer Motion.
