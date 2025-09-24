# FutureBoard - AI-Powered Kanban Application

## Overview

FutureBoard is a modern AI-powered productivity Kanban board application built with a full-stack TypeScript architecture. The application provides task management capabilities with offline support, PWA functionality, and SharePoint integration. It features a glassmorphic dark theme design with customizable color schemes and supports both desktop and mobile usage.

The system is designed as a single-page application with real-time task management, drag-and-drop functionality, and comprehensive offline capabilities through IndexedDB storage and service workers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with CSS custom properties for dynamic theming
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod schema validation
- **Drag & Drop**: React Beautiful DND for Kanban board interactions

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with JSON responses
- **File Structure**: Monorepo structure with shared schema definitions between client and server
- **Build System**: ESBuild for server bundling, Vite for client bundling

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database serverless connection
- **ORM**: Drizzle ORM with migrations in `./migrations` directory
- **Schema**: Centralized schema definitions in `shared/schema.ts` for type safety
- **Offline Storage**: IndexedDB through idb library for client-side data persistence
- **Session Management**: connect-pg-simple for PostgreSQL-backed sessions

### Authentication and Authorization
- **No Traditional Auth**: The application appears to use a single-user or demo mode
- **Session Storage**: PostgreSQL-backed sessions for maintaining state
- **User Settings**: Stored in database with theme preferences and configuration options

### External Dependencies
- **UI Framework**: Complete Radix UI ecosystem for accessible components
- **Microsoft Graph**: SharePoint integration for enterprise sync capabilities
- **PWA Support**: Service worker implementation for offline functionality and app installation
- **Styling**: Comprehensive Tailwind CSS setup with custom theme variables
- **Development Tools**: Replit-specific plugins for development environment integration

The application follows a modern JAMstack approach with strong TypeScript typing throughout the stack, offline-first design principles, and enterprise integration capabilities through SharePoint connectivity.