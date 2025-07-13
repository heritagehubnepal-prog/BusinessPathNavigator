# Mushroom Farm Management System (Mycopath)

## Overview

This is a comprehensive mushroom farm management system built as a full-stack web application. The system provides tools for tracking production batches, managing inventory, monitoring finances, handling tasks and milestones, generating analytics, and creating reports for mushroom farming operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation
- **Charts**: Chart.js with react-chartjs-2 for data visualization

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Validation**: Zod schemas shared between client and server
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions

### Development Tools
- **Build Tool**: Vite for frontend bundling and development server
- **Database Migrations**: Drizzle Kit for schema management
- **TypeScript**: Shared types and schemas across the application
- **Development**: Hot module replacement with Vite middleware

## Key Components

### Database Schema
The application uses a well-structured PostgreSQL schema with the following main entities:
- **Users**: Authentication and user management
- **Production Batches**: Core mushroom production tracking with batch numbers, product types, substrates, dates, weights, and contamination rates
- **Inventory**: Stock management for substrates, spawn, tools, and packaging materials
- **Financial Transactions**: Income and expense tracking with categorization
- **Milestones**: Goal tracking with bonus amounts and progress monitoring
- **Tasks**: Task management with priorities, assignments, and due dates
- **Activities**: System activity logging for audit trails

### Frontend Pages
- **Dashboard**: Central overview with KPIs, charts, and quick actions
- **Production**: Batch management and production tracking
- **Inventory**: Stock level monitoring and item management
- **Financial**: Transaction tracking and financial analytics
- **Tasks**: Task and milestone management system
- **Analytics**: Advanced data visualization and insights
- **Reports**: Comprehensive reporting with export capabilities

### API Structure
RESTful API endpoints following conventional patterns:
- GET `/api/{resource}` - List resources
- GET `/api/{resource}/:id` - Get specific resource
- POST `/api/{resource}` - Create new resource
- PATCH `/api/{resource}/:id` - Update resource
- DELETE `/api/{resource}/:id` - Delete resource

## Data Flow

### Client-Server Communication
1. React components use TanStack Query for data fetching
2. Custom `apiRequest` function handles HTTP requests with error handling
3. Shared Zod schemas ensure type safety between client and server
4. Real-time updates through query invalidation

### Form Handling
1. React Hook Form manages form state
2. Zod resolvers provide validation
3. TanStack Query mutations handle server communication
4. Optimistic updates improve user experience

### State Management
1. Server state managed by TanStack Query with caching
2. Local form state managed by React Hook Form
3. UI state managed by React component state
4. Global UI components (toasts, dialogs) use context

## External Dependencies

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **Chart.js**: Data visualization

### Data and Validation
- **Drizzle ORM**: Type-safe database queries
- **Zod**: Runtime type validation
- **TanStack Query**: Server state management
- **React Hook Form**: Form state management

### Development and Build
- **Vite**: Build tool and development server
- **TypeScript**: Type safety
- **ESBuild**: Production bundling
- **Replit plugins**: Development environment integration

## Deployment Strategy

### Production Build
1. Frontend built with Vite to `dist/public`
2. Backend bundled with ESBuild to `dist/index.js`
3. Static assets served by Express in production
4. Database migrations applied via Drizzle Kit

### Environment Configuration
- **Development**: Vite dev server with Express API
- **Production**: Single Express server serving both API and static assets
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Key Architectural Decisions

**Monorepo Structure**: Keeps frontend, backend, and shared code in one repository for easier development and deployment.

**Shared Schema**: Using Drizzle and Zod schemas in a shared directory ensures type safety and validation consistency between client and server.

**Component-Based UI**: Radix UI primitives provide accessibility while custom components maintain design consistency.

**Type-Safe Database**: Drizzle ORM generates TypeScript types from the database schema, eliminating runtime type errors.

**Query-Based State**: TanStack Query handles all server state, providing caching, background updates, and error handling.

The system is designed for scalability and maintainability, with clear separation of concerns and strong typing throughout the stack.