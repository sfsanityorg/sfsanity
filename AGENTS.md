# AGENTS.md

This document provides guidance for AI agents to effectively contribute to the `sfsanity` project.

## Project Overview

`sfsanity` is a web application designed to display and browse tech events. It features a modern, responsive user interface with both tile and list views for events, search functionality, and a clean design aesthetic. The frontend is a single-page application (SPA) built with React, and it fetches data from a Supabase backend.

## Tech Stack

To work on this project, you should be familiar with the following technologies:

- **Frontend:**
  - **Framework:** React (v18+) with TypeScript
  - **Build Tool:** Vite
  - **Styling:** Tailwind CSS
  - **Animation:** Framer Motion
  - **Icons:** Lucide React
  - **Routing:** React Router DOM
  - **Linting:** ESLint
- **Backend:**
  - **Database:** Supabase (PostgreSQL)
- **Package Manager:** npm

## Project Structure

The repository is organized into two main parts: the frontend application and the Supabase database configuration.

```
/
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   │   ├── common/     # Generic, shared components
│   │   │   └── layout/     # Layout components (nav, footer, etc.)
│   │   ├── config/         # Application configuration (e.g., app settings)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Library initializations (e.g., Supabase client)
│   │   ├── pages/          # Top-level page components
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main application component and routing setup
│   │   └── main.tsx        # Application entry point
│   ├── package.json        # Project dependencies and scripts
│   └── tailwind.config.js  # Tailwind CSS configuration
│
└── supabase/               # Supabase configuration and SQL scripts
    ├── clear_rows.sql
    └── create_table_full.sql
```

## Development Workflow

Follow these steps to set up and run the development environment.

### 1. Install Dependencies

Navigate to the `frontend` directory and install the required npm packages.

```bash
cd frontend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `frontend` directory by copying the example file.

```bash
cp .env.example .env
```

You will need to populate this file with your Supabase project URL and anon key. These are required for the application to connect to the database.

### 3. Run the Development Server

Once dependencies are installed and the environment is configured, start the Vite development server.

```bash
npm run dev
```

The application will be available at `http://localhost:5173` by default.

### 4. Linting

The project uses ESLint to enforce code quality. Before committing changes, run the linter to check for issues.

```bash
npm run lint
```

## Coding Conventions

Adherence to existing conventions is critical for maintaining code quality and consistency.

- **Modularity:** Keep components small and focused on a single responsibility. Extract complex logic into custom hooks (`hooks/`) or utility functions (`utils/`).
- **State Management:** For simple, local state, use `useState`. For state shared across multiple components, use React Context (`AppContext`). Avoid prop drilling.
- **Component Structure:**
  - Define components as functional components using arrow functions (`const MyComponent: React.FC<Props> = () => { ... }`).
  - Use TypeScript for all components and define props with interfaces.
  - Keep JSX readable and well-formatted. Use `clsx` or a similar utility if class names become complex.
- **Styling:** Use Tailwind CSS utility classes directly in the JSX. Avoid writing custom CSS files unless absolutely necessary. Follow the design tokens and color palette defined in `tailwind.config.js`.
- **File Naming:** Use PascalCase for component files (e.g., `MyComponent.tsx`) and camelCase for non-component files (e.g., `dateUtils.ts`).
- **Imports:** Organize imports with React imports first, followed by third-party libraries, and then local project imports.

## Refactoring and Contribution Guidelines

When refactoring or adding new features, please follow these guidelines:

1.  **Analyze Existing Code:** Before making changes, thoroughly read the surrounding files to understand the existing patterns, style, and architecture.
2.  **Start Small:** Begin with simple, low-risk changes to build context and understanding. For example, extracting a small component or moving a utility function.
3.  **Maintain Consistency:** Ensure your changes are idiomatic and align with the established conventions outlined above.
4.  **Verify Changes:** After making changes, always run the linter (`npm run lint`) and manually test the application to ensure that functionality is not broken.
5.  **Communicate Intent:** When proposing changes, clearly explain the "why" behind them. For example, "Refactor the `Events` page to extract the event list into a shared `EventList` component to reduce code duplication and improve maintainability."
