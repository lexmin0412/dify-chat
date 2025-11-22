# Qwen Code Context for Dify Chat

## Project Overview

Dify Chat is an open-source Dify application management platform built on top of the Dify API. It provides a deeply optimized user interface supporting multiple Dify application types including Chatflow and Workflow. The platform features rich AI output forms with support for deep thinking, chain-of-thought reasoning, chart rendering, file processing and more, delivering out-of-the-box AI application solutions.

### Project Structure
This is a monorepo project built with pnpm workspace containing the following packages:
- **api**: Dify API Node.js client library
- **components**: Dify component library (deprecated)
- **core**: Core abstract logic
- **docs**: Documentation package built with Rspress
- **helpers**: Utility functions
- **platform**: Platform package with Next.js 15 App Router, for app configuration CRUD and Dify API proxy
- **react-app**: React application package providing user interface for Dify interaction
- **theme**: Theme package for app-wide theme components/styles
- **back**: Backend services (additional backend functionality)

### Key Technologies
- React v19
- Next.js v15
- Ant Design v5
- Ant Design X v1
- Rsbuild v1
- Tailwind CSS v3 (for react-app) / Tailwind CSS v4 (for platform)
- TypeScript v5
- Prisma ORM
- MySQL/PostgreSQL (database)

### Environment Requirements
- Node.js ^22.5.1
- pnpm ^10.8.1

## Building and Running

### Development Mode
```bash
# Start the React app (frontend)
pnpm dev:react

# Start the Platform (backend/API)
pnpm dev:platform

# Start both services
pnpm dev:react & pnpm dev:platform
```

### Production Deployment
```bash
# Using Docker Compose (recommended)
docker-compose up -d

# Or using the production start script
./prod-start.sh

# Or manual PM2 deployment
pnpm build
pnpm --filter dify-chat-platform build
pm2 start ecosystem.config.js
```

### Package Scripts
- `pnpm build` - Build all packages
- `pnpm build:pkgs` - Build only the packages
- `pnpm test` - Run tests across all packages
- `pnpm lint` - Lint all packages
- `pnpm format` - Format all packages
- `pnpm create-admin` - Create admin account for platform

## Development Conventions

### Dependency Management
This project uses pnpm workspace with catalog protocol for dependency management. All dependency versions are defined in the root `pnpm-workspace.yaml` file in the `catalog` section. When installing/updating dependencies, modify the catalog version and run `pnpm install` from the root.

### Styling
- The `react-app` package uses Tailwind CSS v3
- The `platform` package uses Tailwind CSS v4
- Both packages share theme components from the `theme` package

### Architecture Patterns
- The project follows a micro-frontend architecture with separate React frontend app and Next.js backend platform
- The platform handles authentication, database operations, and acts as a proxy to the Dify API
- The React app focuses on user interaction and UI components
- Common logic is shared through the workspace packages (api, core, helpers, etc.)

### Environment Variables
- React app uses:
  - `PUBLIC_APP_API_BASE` - Application API base path
  - `PUBLIC_DIFY_PROXY_API_BASE` - Dify proxy API base path
  - `PUBLIC_DEBUG_MODE` - Debug mode toggle

- Platform uses:
  - `DATABASE_URL` - Database connection string
  - `NEXTAUTH_SECRET` - Authentication secret

### Code Style
- TypeScript is used throughout the project
- ESLint and Prettier are configured for code formatting
- Components follow Ant Design best practices
- Zustand is used for state management in the React app

## Active Technologies
- TypeScript v5, React v19, Next.js v15 + Ant Design v5, Ant Design X v1, Rsbuild v1, Tailwind CSS v3, Zustand (001-add-create-space-button)
- Backend API with Prisma ORM (database details handled by backend) (001-add-create-space-button)

## Recent Changes
- 001-add-create-space-button: Added TypeScript v5, React v19, Next.js v15 + Ant Design v5, Ant Design X v1, Rsbuild v1, Tailwind CSS v3, Zustand
