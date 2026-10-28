# CodeLens — API Gateway and Rate Limiting Platform

CodeLens is a containerized microservices project demonstrating centralized API routing, JWT authentication, Redis-backed rate limiting, PostgreSQL persistence, and Prometheus monitoring.

## Technology Stack

- Java and Spring Boot
- Spring Cloud Gateway
- JWT authentication
- Redis rate limiting
- PostgreSQL
- React, Vite, Tailwind CSS, Recharts
- Docker Compose
- Prometheus and Spring Boot Actuator

## Architecture

The React frontend communicates with the API Gateway on port 8080. The gateway routes requests to three backend services:

| Gateway route | Service | Port |
|---|---|---:|
| `/api/users/**` | User Service | 8081 |
| `/api/products/**` | Product Service | 8082 |
| `/api/orders/**` | Order Service | 8083 |

The gateway removes the `/api` prefix before forwarding requests.

Each backend service has its own PostgreSQL database. Redis stores rate-limit state, and Prometheus is available on port 9090.

## Features

- Centralized routing through Spring Cloud Gateway.
- JWT-based request authentication.
- Redis-backed rate limiting.
- Per-user rate-limit keys for authenticated requests and IP-based keys for unauthenticated requests.
- Configurable rate limit: 5 requests per 60 seconds in the current configuration.
- HTTP 429 responses when the configured limit is exceeded.
- Independent user, product, and order services.
- Containerized development environment and monitoring configuration.

## Prerequisites

- Docker Desktop with Docker Compose
- Node.js and npm for the frontend
- Java and Maven if building backend services locally

## Configuration and Security

The root `.env` file supplies `JWT_SECRET` to the gateway and User Service through Docker Compose.

Keep `.env` private. Never commit real secrets, tokens, or database credentials. Configure service URLs and database credentials through environment variables.

The current project is intended for development and demonstration. Review authentication, Actuator exposure, database migrations, HTTPS, and deployment settings before production use.

## Start the Backend Stack

Run these commands from the project root:

```powershell
docker compose up -d --build
docker compose ps
```

View service logs:

```powershell
docker compose logs --tail 100 gateway
docker compose logs --tail 100 user-service
```

Check gateway health:

```powershell
Invoke-RestMethod http://localhost:8080/actuator/health
```

## Start the Frontend

```powershell
cd frontend
npm install
npm run dev
```

Create a production build:

```powershell
npm run build
```

The frontend production build has completed successfully. Vite reported a large JavaScript chunk warning, which can be optimized later.

## Monitoring

Prometheus is mapped to port 9090. The gateway configuration exposes Actuator health, info, metrics, and Prometheus endpoints. Actual endpoint availability depends on runtime configuration.

## Project Structure

```text
API_GATEWAY/
├── gateway/
├── user-service/
├── product-service/
├── order-service/
├── frontend/
├── docker-compose.yml
├── prometheus.yml
├── .env
├── .gitignore
└── README.md
```

## Verification Status

JWT authentication and Redis rate-limit isolation have been manually verified in the development environment. The frontend production build succeeds.

Further production hardening, complete endpoint documentation, and deployment configuration remain future improvements.
