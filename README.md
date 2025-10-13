# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```


folder structure - 

crm-frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Footer.tsx
│   │   ├── auth/
│   │   │   ├── Login.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── QuickActions.tsx
│   │   ├── users/
│   │   │   ├── UserManagement.tsx
│   │   │   ├── UserForm.tsx
│   │   │   └── UserTable.tsx
│   │   ├── leads/
│   │   │   ├── LeadManagement.tsx
│   │   │   ├── LeadForm.tsx
│   │   │   ├── LeadTable.tsx
│   │   │   ├── BulkUpload.tsx
│   │   │   └── LeadStatusBadge.tsx
│   │   ├── tasks/
│   │   │   ├── TaskManagement.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   └── TaskBoard.tsx
│   │   ├── followups/
│   │   │   ├── FollowupManagement.tsx
│   │   │   ├── FollowupForm.tsx
│   │   │   ├── FollowupCalendar.tsx
│   │   │   └── ReminderList.tsx
│   │   ├── analytics/
│   │   │   ├── AnalyticsDashboard.tsx
│   │   │   ├── Charts/
│   │   │   │   ├── LeadsChart.tsx
│   │   │   │   ├── ConversionChart.tsx
│   │   │   │   └── PerformanceChart.tsx
│   │   │   └── Reports/
│   │   │       ├── LeadsReport.tsx
│   │   │       └── PerformanceReport.tsx
│   │   ├── common/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── Notification.tsx
│   │   │   └── SearchFilter.tsx
│   │   └── ui/
│   │       ├── CustomButton.tsx
│   │       ├── CustomTable.tsx
│   │       ├── CustomModal.tsx
│   │       └── FormElements/
│   │           ├── FormInput.tsx
│   │           ├── FormSelect.tsx
│   │           ├── FormDatePicker.tsx
│   │           └── FormUpload.tsx
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── NotificationContext.tsx
│   │   └── index.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── leadService.ts
│   │   ├── taskService.ts
│   │   ├── followupService.ts
│   │   ├── analyticsService.ts
│   │   └── types/
│   │       ├── user.ts
│   │       ├── lead.ts
│   │       ├── task.ts
│   │       ├── followup.ts
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   └── useNotification.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   └── exportUtils.ts
│   ├── styles/
│   │   ├── theme.ts
│   │   ├── globalStyles.ts
│   │   └── components/
│   │       ├── layoutStyles.ts
│   │       ├── formStyles.ts
│   │       └── tableStyles.ts
│   ├── types/
│   │   ├── index.ts
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── lead.ts
│   │   ├── task.ts
│   │   └── followup.ts
│   ├── config/
│   │   ├── routes.ts
│   │   ├── constants.ts
│   │   └── environment.ts
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.png
│   │   │   └── placeholder-avatar.png
│   │   ├── icons/
│   │   └── styles/
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   ├── index.css
│   └── react-app-env.d.ts
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts (or webpack.config.js)
├── eslint.config.js
├── prettier.config.js
├── .gitignore
└── README.md