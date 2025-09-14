# EAMS - Employee Absence Management System

A modern microservices-based Employee Absence Management System built with NestJS, TypeORM, and Nx monorepo architecture.

## 🚀 Features

- **Microservices Architecture** - Scalable and maintainable service-oriented design
- **JWT Authentication** - Secure token-based authentication and authorization
- **Role-Based Access Control** - Employee and Admin roles with different permissions
- **Absence Management** - Create, approve, and reject absence requests
- **SQLite Database** - Lightweight database for development and testing
- **TypeORM Integration** - Type-safe database operations
- **Monorepo Structure** - Shared libraries and consistent code organization
- **API Gateway Pattern** - Centralized entry point for all client requests

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │────│  Auth Service   │    │ Absence Service │
│   (Port 3000)   │    │   (Port 3001)   │    │   (Port 3002)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Shared Libraries│
                    │  - Database     │
                    │  - Common       │
                    │  - DTOs         │
                    └─────────────────┘
```

## 📋 Services

### API Gateway (Port 3000)

- Routes requests to appropriate microservices
- Handles authentication middleware
- Centralized error handling
- Request/response transformation

### Auth Service (Port 3001)

- User registration and login
- JWT token generation and validation
- Password hashing with bcrypt
- Role-based access control

### Absence Service (Port 3002)

- Create absence requests (Employees)
- List absence requests (filtered by role)
- Approve/reject requests (Admins only)
- Pagination and filtering support

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: SQLite with TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **Monorepo**: Nx
- **Validation**: class-validator & class-transformer
- **Password Hashing**: bcrypt
- **Communication**: TCP Microservices
- **Language**: TypeScript

## 📦 Installation

### Prerequisites

- Node.js (v24.7.0)
- npm

### Clone & Install

```bash
# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production


# Application
NODE_ENV=development
LOG_LEVEL=debug
```

## 🚀 Getting Started

### Development Mode

Start all services simultaneously:

```bash
npm run dev:all
```

Or start services individually:

```bash
# Terminal 1: API Gateway
npm run dev:gateway

# Terminal 2: Auth Service
npm run dev:auth

# Terminal 3: Absence Service
npm run dev:absence
```

### Build Project

```bash
# Build all services
npm run build:all

```

## 📡 API Endpoints

### Authentication

```http
POST /auth/register
POST /auth/login
```

### Absences

```http
GET    /absences              # List absences (paginated)
POST   /absences              # Create absence request (Employee only)
PATCH  /absences/:id/approve  # Approve request (Admin only)
PATCH  /absences/:id/reject   # Reject request (Admin only)
```

## Postman Collection

## Postman Collection

You can import the Postman collection for this API by clicking [here](./postman/eams.postman_collection.json).

## 🔐 User Roles

### Employee

- Create absence requests
- View own absence requests
- Cannot approve/reject requests

### Admin

- View all absence requests
- Approve/reject absence requests
- Cannot create absence requests for others
