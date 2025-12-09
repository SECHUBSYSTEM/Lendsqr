# Technical Implementation Report

## Overview

This document outlines the architectural decisions, design patterns, and technical approach taken to refactor and implement the Lendsqr Demo Credit wallet service. The goal was to build a robust, scalable, and testable MVP that adheres to modern engineering best practices.

## 1. Architecture & Design Patterns

### 1.1 Layered Architecture

We adopted a classic **Controller-Service-Data** layered architecture to ensure separation of concerns:

- **Routes Layer**: Defines API endpoints and maps them to controllers.
- **Controller Layer**: Handles HTTP requests, input validation, and sends responses. It does _not_ contain business logic.
- **Service Layer**: Contains the core business logic (e.g., preventing overdrafts, hashing passwords). This is the most critical layer.
- **Data/Model Layer**: Manages database interactions. We used KnexJS as a Query Builder rather than a heavy ORM to maintain control over SQL execution and performance.

**Reasoning**: This separation makes the codebase easier to maintain and test. We can test services in isolation (Unit Tests) without needing to spin up an HTTP server.

### 1.2 Singleton Services

Services (`UserService`, `WalletService`, `KarmaService`) are instantiated as singletons.

**Reasoning**: This reduces memory overhead and simplifies dependency injection. Since our services are stateless (they rely on the database for state), a single instance is sufficient for the entire application lifecycle.

### 1.3 Barrel Exports (`index.ts`)

We utilized "barrel" files in directories like `services/`, `controllers/`, and `middlewares/`.

**Reasoning**: This simplifies imports throughout the application. Instead of `import { UserService } from '../services/user.service'`, we use `import { userService } from '../services'`. It makes the consuming code cleaner and refactoring easier.

## 2. Database & Data Integrity

### 2.1 KnexJS & Migrations

We chose **KnexJS** for database management.

**Reasoning**:

- **Migrations**: Knex provides a robust migration system (`knex migrate:latest`) allowing us to version-control the database schema. This is critical for team collaboration and CI/CD.
- **Type Safety**: While not a full ORM, Knex offering TypeScript support allows us to define interfaces for our tables (`User`, `Wallet`, `Transaction`), catching schema mismatches at compile time.

### 2.2 Transaction Atomicity (CRITICAL)

For all financial operations (`fund`, `transfer`, `withdraw`), we implemented **Database Transaction Scoping**.
_Example_: In `transfer()`, debiting the sender and crediting the recipient happen within a single `db.transaction`.

**Reasoning**: In a fintech application, partial failures are unacceptable. If debiting the sender succeeds but crediting the recipient fails, money is lost. Transaction scoping ensures that either _both_ happen, or _neither_ happens (ACID compliance).

### 2.3 UUIDs for Transactions

We used `uuid` strings for transaction references alongside auto-incrementing integer IDs.

**Reasoning**: Integer IDs are predictable and can expose business volume (e.g., "I am transaction #5"). UUIDs provide a secure, unique, and unguessable reference for external sharing (e.g., receipts).

## 3. Security Decisions

### 3.1 Third-Party Integration (Adjutor Karma)

The `KarmaService` integrates with Lendsqr's Adjutor API.

- **Approach**: We check the blacklist _before_ creating the user in the database.
- **Error Handling**: We implemented a "Fail-Open" strategy for the demo (if API errors, we allow registration) but mapped 404 responses explicitly to "Not Blacklisted".
- **Environment**: Sensitive keys are stored in `.env`, not hardcoded.

### 3.2 Faux Authentication

Per requirements, we implemented a token-based auth using Base64-encoded User IDs.

**Decision**: While not secure for production (JWT is standard), this met the assessment requirement for simplicity while mimicking the _structure_ of a real auth header (`Authorization: Bearer <token>`). This makes swapping it for real JWT later trivial.

### 3.3 Input Validation

We implemented validation at the **Controller Level**.

**Reasoning**: Fail fast. We check for missing fields or invalid amounts before the data reaches the Service layer or Database, saving resources and returning clear 400 Errors to the client.

## 4. Testing Strategy

### 4.1 Integration over Unit (for Flows)

We prioritized **Integration Tests** (`api.test.ts`) for the wallet operations.

**Reasoning**: For an API, the most important contract is "Does the endpoint work?" Mocking the database for wallet logic often hides bugs in the SQL queries. Using a real test database (creating temporary users/wallets) gives us 100% confidence that the transfer logic actually works in MySQL.

### 4.2 Mocking External Dependencies

We mocked the `axios` calls in `KarmaService` unit tests.

**Reasoning**: We cannot rely on external APIs being up, or having specific test data, during our CI/CD process. Mocking allows us to simulate "User Blacklisted" and "User Safe" scenarios detministically.

## 5. Summary

The resulting application is a "Vertical Slice" of a production-grade system. It prioritizes data integrity (transactions) and code organization (layered architecture) over feature bloat, providing a solid foundation for a scalable lending service.
