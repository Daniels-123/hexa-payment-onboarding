# Payment Onboarding App (Hexagonal Architecture)

This project is a technical test implementing a full-stack Payment Onboarding application using **Hexagonal Architecture (Ports & Adapters)** and **Railway Oriented Programming (ROP)** principles.

## 🏗 Architecture

The backend is built with **NestJS** and strictly follows the Hexagonal Architecture:

-   **Domain Layer**: Pure TypeScript entities and business rules (No frameworks).
-   **Application Layer**: Use Cases orchestration.
-   **Infrastructure Layer**: Adapters for Database (TypeORM), API (Controllers), and Payment Gateway.

## Tech Stack

-   **Backend**: NestJS, TypeScript, TypeORM.
-   **Database**: PostgreSQL (Dockerized).
-   **Frontend**: React (Planned Phase 2).
-   **Tools**: Docker Compose.

##  Usage

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/Daniels-123/hexa-payment-onboarding.git
    ```
2.  **Start Database**:
    ```bash
    docker-compose up -d
    ```
3.  **Run Backend**:
    ```bash
    cd backend
    npm install
    npm run start:dev
    ```
