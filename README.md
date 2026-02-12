# E-Commerce Backend API

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

## 1. Project Overview

This creates a robust and scalable backend for an E-Commerce platform built with **NestJS**. It provides a comprehensive set of APIs for managing products, user authentication, orders, and payments. The system is designed with a modular architecture, ensuring maintainability and extensibility.

**Key Features:**

- **User Management**: Secure registration and login with JWT Authentication.
- **Product Catalog**: efficient management of product listings.
- **Cart Management**: Full-featured shopping cart with extensive logic for guest-to-user merging.
- **Order Processing**: Handling customer orders and payment integration.
- **Performance**: Redis caching for optimized data retrieval.
- **System Reliability**: Comprehensive health checks and monitoring endpoints.
- **Scalability**: Containerized with Docker for consistent deployment environments.

---

## 2. Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (Node.js framework)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: Passport.js with JWT Strategy
- **Caching**: Redis
- **Payment Gateway**: Stripe Integration
- **Containerization**: Docker & Docker Compose
- **Documentation**: Swagger UI
- **Validation**: class-validator & class-transformer

---

## 3. Architecture Overview

The project follows the standard **NestJS Modular Architecture**, emphasizing separation of concerns:

- **Controllers**: Handle incoming HTTP requests and return responses to the client. They are responsible for route handling and request validation.
- **Services**: Contain the core business logic. They interact with repositories or other services to process data.
- **Modules**: Organize related components (controllers, services, providers) into cohesive blocks (Auth, Users, Carts, Products, Orders, Payments, etc.).
- **Prisma Client**: Acts as the data access layer, providing a type-safe interface to the PostgreSQL database.
- **Guards & Interceptors**: Handle authentication, authorization, and response transformation globally or per-route.

**Flow**: Request → Controller → Service → Prisma (Database) → Response

---

## 4. Folder Structure

Here is an overview of the main folders in the project:

```
e-commerce-api/
├── prisma/                # Prisma schema and migrations
│   ├── migrations/        # Database migration history
│   └── schema.prisma      # Database schema definition
├── src/                   # Source code
│   ├── common/            # Shared resources (filters, guards, pipes, utils)
│   ├── modules/           # Feature modules (Auth, Users, Carts, Products, Orders, Payments, etc.)
│   ├── main.ts            # Application entry point
│   └── app.module.ts      # Root module
├── test/                  # End-to-end tests
├── docker-compose.yml     # Docker services configuration
├── package.json           # Dependencies and scripts
└── .env                   # Environment variables (not committed)
```

---

## 5. Environment Variables

Create a `.env` file in the root directory. You can use the example below:

```ini
# Environment
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Database (PostgreSQL)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://user:password@localhost:5432/e_commerce?schema=public"

POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=e_commerce
POSTGRES_PORT=5432
POSTGRES_CONTAINER_NAME=postgres_ecommerce

# Redis
REDIS_URI="redis://localhost:6379"
REDIS_PORT=6379
REDIS_CONTAINER_NAME=redis_data

# Authentication (JWT)
AUTH_JWT_SECRET_KEY=your_super_secret_jwt_key
AUTH_JWT_ACCESS_TOKEN_TTL=1h
AUTH_JWT_REFRESH_TOKEN_TTL=7d

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_key
```

---

## 6. Installation & Setup Guide

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker & Docker Compose (optional but recommended for DB/Redis)

### Step 1: Clone the Repository

```bash
git clone <repository_url>
cd e-commerce-api
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

1.  Copy the example env file (or create one based on the section above).
2.  Update the values to match your local setup.

### Step 4: Start Infrastructure (Docker)

If you have Docker installed, you can spin up the PostgreSQL and Redis containers easily:

```bash
docker-compose up -d
```

This will verify that your database and cache are running on the ports specified in your `.env` file.

### Step 5: Database Migration

Run Prisma migrations to set up your database schema:

```bash
npx prisma migrate dev
```

This command will apply the schema from `prisma/schema.prisma` to your PostgreSQL database.

---

## 7. Running the Application

### Development Mode

Runs the application with hot-reload enabled.

```bash
npm run start:dev
```

The server will start at `http://localhost:3000` (or your configured PORT).

### Production Mode

```bash
npm run build
npm run start:prod
```

---

## 8. API Documentation (Swagger)

The application includes Swagger UI for interactive API documentation.

1.  Start the application (`npm run start:dev`).
2.  Navigate to: **[http://localhost:3000/api/docs](http://localhost:3000/api/docs)**

You can explore endpoints, see request/response schemas, and test APIs directly from the browser.

---

## 9. Database Migration

Manage your database schema using Prisma CLI:

- **Apply migrations (Development)**:
    ```bash
    npx prisma migrate dev
    ```
- **Reset database** (Caution: this deletes data):
    ```bash
    npx prisma migrate reset
    ```
- **Open Prisma Studio** (GUI to view data):
    ```bash
    npx prisma studio
    ```

---

## 10. Docker Setup

To run the entire stack (App + DB + Redis) or just the infrastructure, rely on `docker-compose.yaml`.

- **Start Infrastructure Only (DB & Redis)**:
    ```bash
    docker-compose up -d db redis
    ```
- **Stop Containers**:
    ```bash
    docker-compose down
    ```

---

## 11. Production Build Guide

To prepare the application for a production environment:

1.  **Build the project**:

    ```bash
    npm run build
    ```

    This compiles the TypeScript code into the `dist` directory.

2.  **Run the production build**:
    ```bash
    npm run start:prod
    ```

Ensure your `.env` file in production has `NODE_ENV=production` and optimized configurations.

---

## 12. Useful Scripts

List of common commands in `package.json`:

| Command              | Description                                   |
| :------------------- | :-------------------------------------------- |
| `npm run start:dev`  | Starts the app in watch mode (hot-reload).    |
| `npm run build`      | Compiles the app for production.              |
| `npm run start:prod` | Runs the compiled app from `dist/`.           |
| `npm run lint`       | Runs ESLint to check for code quality issues. |
| `npm run format`     | Formats code using Prettier.                  |
| `npm run test`       | Runs unit tests.                              |
| `npm run test:e2e`   | Runs end-to-end tests.                        |

---

## 13. License

This project is [UNLICENSED](LICENSE).
