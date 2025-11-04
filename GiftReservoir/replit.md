# Family Wishlist Sharing App

## Overview

A family-oriented wishlist sharing application that allows users to create wishlists, add items with product links, and share them with family members. The key feature is a claim system that prevents duplicate gift purchases by making claimed items unavailable to others. The application emphasizes clarity in showing claimed vs. available status and provides effortless sharing through copy-link functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript, using Vite as the build tool and bundler.

**Routing**: Wouter for lightweight client-side routing with route protection based on authentication state.

**State Management**: 
- TanStack Query (React Query) for server state management with infinite stale time and disabled refetching
- React Hook Form with Zod validation for form state management
- Context API for authentication state

**UI Component Library**: 
- Shadcn UI (New York style) with Radix UI primitives for accessible, customizable components
- Tailwind CSS for styling with custom design tokens
- Class Variance Authority (CVA) for component variants

**Design System**:
- Typography: Inter for headings/UI, system fonts for body text
- Spacing: Tailwind units (2, 4, 6, 8, 12) for consistent spacing
- Color system: HSL-based CSS variables for theming support
- Responsive grid layouts with mobile-first approach
- Hybrid design approach inspired by Airbnb's warmth, Linear's typography, and Pinterest's visual style

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**Language**: TypeScript with ES modules

**API Design**: RESTful JSON API with the following key endpoints:
- Authentication: `/api/auth/user`, `/api/login`
- Wishlists: CRUD operations at `/api/wishlists` and `/api/wishlists/:id`
- Items: CRUD operations at `/api/wishlists/:id/items`
- Claims: Create/delete at `/api/items/:id/claim`
- Sharing: Public access via `/api/wishlists/shared/:token`

**Middleware Stack**:
- Session management with express-session
- JSON body parsing with raw body preservation for webhooks
- Request/response logging for API routes
- Custom error handling

**Development**: Vite middleware mode for HMR, Replit development plugins for enhanced DX

### Data Storage

**Database**: PostgreSQL via Neon serverless with WebSocket connections

**ORM**: Drizzle ORM with type-safe schema definitions

**Schema Design**:
- `users`: User profiles (id, email, name, profile image)
- `wishlists`: User-owned wishlists with unique share tokens
- `items`: Wishlist items with product details (name, URL, description, price, image)
- `claims`: Join table linking users to claimed items
- `sessions`: Session storage for authentication

**Key Relationships**:
- One-to-many: Users to Wishlists, Wishlists to Items, Users to Claims
- One-to-one: Items to Claims (an item can only be claimed once)
- Cascade deletes: Deleting a user removes their wishlists; deleting a wishlist removes its items

**Schema Validation**: Drizzle-Zod for automatic Zod schema generation from database schema

### Authentication & Authorization

**Provider**: Replit Auth using OpenID Connect (OIDC)

**Strategy**: Passport.js with custom OpenID Client strategy

**Session Management**: 
- PostgreSQL-backed sessions via connect-pg-simple
- 1-week session TTL with httpOnly cookies
- Session refresh token support

**Authorization Pattern**:
- Middleware-based route protection (`isAuthenticated`)
- User ID extracted from JWT claims (`req.user.claims.sub`)
- Owner verification for CRUD operations on wishlists and items
- Public read access for shared wishlists via share tokens

### Sharing Mechanism

**Token Generation**: Cryptographically secure random tokens (64 characters) using Node's crypto module

**Public Access**: Unauthenticated users can view shared wishlists via `/share/:token` routes

**Claim Restrictions**: Only authenticated users can claim items, preventing anonymous claims

## External Dependencies

### Third-Party Services

**Replit Authentication**: OIDC-based authentication system for user management
- Discovery endpoint: `https://replit.com/oidc` (or custom issuer URL)
- Handles user registration, login, and profile data
- Provides user claims including email, name, and profile image

**Neon Database**: Serverless PostgreSQL hosting
- WebSocket-based connections for serverless compatibility
- Connection string provided via `DATABASE_URL` environment variable

### Key NPM Packages

**Frontend**:
- `@tanstack/react-query`: Server state management
- `wouter`: Lightweight routing
- `react-hook-form` + `@hookform/resolvers`: Form management
- `zod`: Runtime type validation
- All `@radix-ui/*` packages: Accessible UI primitives
- `tailwindcss`: Utility-first CSS framework
- `date-fns`: Date manipulation

**Backend**:
- `express`: Web framework
- `drizzle-orm` + `@neondatabase/serverless`: Database ORM and client
- `passport` + `openid-client`: Authentication
- `express-session` + `connect-pg-simple`: Session management
- `ws`: WebSocket client for Neon connection

**Development**:
- `vite`: Build tool and dev server
- `tsx`: TypeScript execution
- `esbuild`: Server bundling for production
- `@replit/vite-plugin-*`: Development tooling

### Environment Variables

Required for application functionality:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPL_ID`: Replit environment identifier
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit's OIDC endpoint)
- `NODE_ENV`: Environment flag (development/production)