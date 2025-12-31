# Mushroom Farm Management System (Mycopath)

## Overview

Mycopath is a full-stack web application designed to be a comprehensive management system for mushroom farming operations. It aims to streamline various aspects of the business, including tracking production batches, managing inventory, monitoring finances, handling tasks and milestones, generating analytics, and creating reports. The system also includes a sales management module with customer education, focusing on the market potential of mushroom products and sustainable practices.

## User Preferences

Preferred communication style: Simple, everyday language
Focus on mushroom and mycelium business education for consumers
Nepal mountain environment and sustainability themes
Modern, contemporary UI design with glass effects and smooth animations

## System Architecture

### UI/UX Decisions
- **Design Philosophy**: Modern, contemporary UI with glass-card effects and smooth animations.
- **Theming**: Tailwind CSS with CSS variables, green/amber gradients inspired by Nepal's mountain environment.
- **Component Library**: Radix UI for accessible primitives, custom shadcn/ui components.
- **Visuals**: Animated icons, floating animations, pulse effects, subtle bounce animations, mycelium network patterns, and spore gradients.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Wouter for routing, TanStack Query for server state, React Hook Form with Zod for forms, Chart.js for data visualization.
- **Backend**: Node.js with TypeScript, Express.js for REST API.
- **Database**: PostgreSQL with Drizzle ORM, hosted on Neon Database.
- **Validation**: Zod schemas shared between client and server for type safety.
- **Authentication**: Employee ID-based system with administrator approval workflow, strict rate limiting, and robust session management.
- **Session Management**: Connect-pg-simple for PostgreSQL-backed sessions.
- **Build Tools**: Vite for frontend, ESBuild for backend bundling, Drizzle Kit for database migrations.

### Feature Specifications
- **Production Batches**: Automated batch number generation (MYC-YYYY-XXX), one-click stage progress tracking with smart defaults and visual progress cards, comprehensive contamination reporting.
- **Inventory Management**: Tracking of substrates, spawn, tools, and packaging materials.
- **Financial Management**: Income and expense tracking with categorization.
- **Task & Milestone Management**: Goal tracking with bonus amounts, progress monitoring, and task assignment.
- **Sales Management**: Comprehensive system for customers, products (fresh, extracts, bio-materials, growing kits), and orders, integrated with educational content.
- **Human Resources**: Employee management (ID-based authentication), attendance tracking (check-in/check-out), and payroll modules.
- **Analytics & Reporting**: Data visualization and comprehensive reports with export capabilities.
- **Security**: Comprehensive security hardening including strict rate limiting, proper session configuration, Helmet middleware for security headers, and input validation.
- **Environment Management**: Segregated UAT and Production environments with automated deployment scripts and environment-aware configuration.

### System Design Choices
- **Monorepo Structure**: Frontend, backend, and shared code in one repository for streamlined development.
- **Shared Schema**: Consistent type safety and validation using Drizzle and Zod schemas across client and server.
- **Component-Based UI**: Accessible and consistent UI design.
- **Type-Safe Database**: Drizzle ORM generates TypeScript types from the database schema.
- **Query-Based State Management**: TanStack Query manages all server state with caching and background updates.
- **Robust Error Handling**: Clear, actionable validation messages, smart data type handling, and field-specific error guidance.

## External Dependencies

- **UI and Styling**: Radix UI, Tailwind CSS, Lucide React, Chart.js.
- **Data and Validation**: Drizzle ORM, Zod, TanStack Query, React Hook Form.
- **Database Provider**: Neon Database (@neondatabase/serverless).
- **Security**: Helmet, express-rate-limit, express-slow-down.
- **Development and Build**: Vite, TypeScript, ESBuild, Replit plugins.