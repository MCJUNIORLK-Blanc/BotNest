# BotCommander - Discord Bot Management Panel

## Overview

BotCommander is a comprehensive web-based management panel for Discord bots, designed with a gaming-themed interface. The application provides a full-stack solution for managing multiple Discord bots written in Node.js and Python, featuring real-time monitoring, file management, system resource tracking, and process control. The system is built as a modern web application with a React frontend and Express.js backend, supporting both development and production deployments with PM2 process management and Apache reverse proxy compatibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development and build tooling
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom gaming-themed color scheme (dark mode with purple/blue accents)
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for client-side routing
- **Real-time Updates**: WebSocket integration for live bot status and system monitoring

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Process Management**: Custom BotManager service for handling Discord bot processes
- **Real-time Communication**: WebSocket server for pushing live updates to frontend
- **File Operations**: Built-in file manager with upload/download capabilities
- **System Monitoring**: SystemMonitor service tracking CPU, memory, disk, and network usage
- **API Design**: RESTful endpoints with comprehensive error handling

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless with connection pooling
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Structured schema with tables for bots, bot files, logs, system stats, and activities
- **Session Management**: PostgreSQL-based session storage using connect-pg-simple
- **In-Memory Storage**: Fallback MemStorage implementation for development/testing

### Authentication and Authorization
- **Session-based Authentication**: Express sessions with PostgreSQL storage
- **Security**: CORS configuration and request validation
- **Process Isolation**: Each Discord bot runs as separate child process with resource monitoring

### External Service Integrations
- **Discord API**: Bot token management and Discord bot lifecycle control
- **Process Management**: PM2 ecosystem configuration for production deployments
- **File System**: Direct file system access for bot code management and editing
- **Apache Integration**: Reverse proxy support with SSL/TLS via Let's Encrypt
- **WebSocket Communication**: Real-time bidirectional communication between server and clients

### Key Design Patterns
- **Microservice Architecture**: Modular services for bot management, system monitoring, and file operations
- **Event-Driven Updates**: WebSocket events for real-time UI updates across bot status changes
- **Resource Monitoring**: Continuous tracking of system and individual bot resource usage
- **Template System**: Predefined bot templates (Basic, Music, Moderation, Economy) for rapid deployment
- **Auto-restart Logic**: Configurable automatic restart capabilities for bot processes
- **Logging System**: Comprehensive logging with different levels and real-time log streaming

## External Dependencies

### Core Runtime Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: TypeScript ORM for database operations
- **express**: Web application framework
- **ws**: WebSocket implementation for real-time communication

### Frontend Dependencies
- **@radix-ui/***: Component primitives for accessible UI components
- **@tanstack/react-query**: Data fetching and state management
- **wouter**: Lightweight client-side routing
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library

### Development and Build Tools
- **vite**: Frontend build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for backend
- **drizzle-kit**: Database migration and schema management

### Process Management
- **PM2**: Production process manager (configured via ecosystem.config.js)
- **child_process**: Node.js built-in for spawning Discord bot processes

### File Handling
- **multer**: Multipart form data handling for file uploads
- **fs/promises**: File system operations for bot code management

### System Monitoring
- **Built-in utilities**: CPU, memory, disk, and network monitoring via system commands