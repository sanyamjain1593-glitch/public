# FutureBoard - AI-Powered Kanban Application

## Overview

FutureBoard is a modern AI-powered productivity Kanban board application built with a full-stack TypeScript architecture. The application provides task management capabilities with drag-and-drop functionality, offline support, PWA capabilities, and SharePoint integration for enterprise use. The system is designed as a single-page application with real-time task management, daily rollover features, and comprehensive offline capabilities through IndexedDB storage and service workers.

**Project Status**: Successfully imported and configured for Replit environment. All dependencies installed, frontend configured for 0.0.0.0:5000, and deployment settings configured.

## User Preferences

Preferred communication style: Simple, everyday language.

## Current Setup

### Development Environment
- **Status**: ✅ Running successfully 
- **Frontend**: React + TypeScript + Vite serving on port 5000
- **Backend**: Express.js + TypeScript 
- **Storage**: Currently using in-memory storage (MemStorage) - fully functional
- **Database**: PostgreSQL schema defined, ready for database connection when needed

### Replit Configuration
- **Workflow**: "FutureBoard Dev Server" running `npm run dev`
- **Host Configuration**: Properly configured for 0.0.0.0:5000 (proxy-friendly)
- **Deployment**: Configured for VM deployment with build and start commands

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool for fast development and optimized production builds
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design components
- **Styling**: Tailwind CSS with CSS custom properties for dynamic theming and futuristic glassmorphism effects
- **State Management**: TanStack Query for server state management, caching, and offline-first data handling
- **Routing**: Wouter for lightweight client-side routing between kanban and history views
- **Forms**: React Hook Form with Zod schema validation for type-safe form handling
- **Drag & Drop**: React Beautiful DND for smooth kanban board task movement between columns
- **PWA Support**: Service worker implementation with offline caching strategies and installable app capabilities

### Backend Architecture
- **Runtime**: Node.js with Express.js server providing RESTful API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations and migrations
- **API Design**: RESTful API structure with comprehensive task, history, and settings endpoints
- **File Structure**: Monorepo structure with shared schema definitions between client and server for type consistency
- **Build System**: ESBuild for server bundling, Vite for client bundling with hot module replacement
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple for persistent user state

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database serverless connection with automatic scaling
- **ORM**: Drizzle ORM with structured migrations in `./migrations` directory and centralized schema
- **Schema Design**: Comprehensive task management with history tracking, user settings, and board configurations
- **Offline Storage**: IndexedDB through idb library for client-side data persistence and sync queue management
- **Caching Strategy**: Multi-level caching with TanStack Query for API responses and IndexedDB for offline fallback

### Authentication and Authorization
- **Session-Based**: PostgreSQL-backed sessions for maintaining user state without traditional authentication
- **Single-User Mode**: Designed for individual productivity with potential for multi-user expansion
- **Settings Persistence**: User preferences and theme selections stored in database with offline sync

### Task Management Features
- **Kanban Workflow**: Three-column board (To Do, In Progress, Done) with drag-and-drop functionality
- **Task Operations**: Full CRUD operations with real-time updates and offline queue management
- **Daily Rollover**: Automated task management with configurable rollover times for productivity workflows
- **History Tracking**: Comprehensive task history with completion tracking and date-based organization
- **Progressive Enhancement**: Offline-first design with graceful degradation and sync on reconnection

## External Dependencies

### UI Framework
- **Radix UI Ecosystem**: Complete set of accessible, unstyled UI primitives for dialogs, dropdowns, forms, and navigation
- **Tailwind CSS**: Utility-first CSS framework with custom theme variables for futuristic styling
- **React Beautiful DND**: Smooth drag-and-drop interactions for kanban board functionality
- **Lucide React**: Modern icon library for consistent UI elements

### Microsoft Integration
- **Microsoft Graph Client**: SharePoint integration for enterprise data sync and cloud storage
- **SharePoint Connector**: Replit-based connector for seamless SharePoint authentication and data exchange
- **Enterprise Sync**: Bidirectional sync between local tasks and SharePoint lists for team collaboration

### PWA and Offline
- **Service Worker**: Custom implementation for offline caching, background sync, and push notifications
- **IndexedDB (idb)**: Client-side database for offline task storage and sync queue management
- **Web App Manifest**: Complete PWA configuration for installable mobile and desktop app experience

### Development Tools
- **Replit Integration**: Development environment plugins for runtime error overlay and development tools
- **TypeScript**: Full-stack type safety with shared schemas and interfaces
- **Vite Plugins**: Development enhancement with hot reload, error handling, and build optimization
- **Drizzle Kit**: Database migration and schema management tools

### Data Management
- **TanStack Query**: Advanced server state management with caching, background updates, and optimistic updates
- **Zod**: Runtime type validation for forms and API data integrity
- **Date-fns**: Date manipulation and formatting for task scheduling and history features