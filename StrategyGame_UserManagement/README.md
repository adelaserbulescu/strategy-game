# User Management Service (Strategy Game Project)

This service implements **User Management** for the strategy game.  
It is a standalone **Spring Boot + PostgreSQL + JWT** backend that handles:
- User registration  
- User login (returns JWT token)  
- Updating user info  
- Fetching user details  
- Admin-only: listing all users  
- Incrementing the number of games won  

# Tech Stack
- **Java 17**  
- **Spring Boot 3.5**  
- **Spring Web**  
- **Spring Data JPA**  
- **Spring Security (JWT + BCrypt)**  
- **PostgreSQL**  
- **Maven**

# Running the Service
From the project root (where `pom.xml` is):  mvn spring-boot:run
The service starts on: http://localhost:8081
**PostgreSQL connection** is configured in: src/main/resources/application.properties

# Database Model
Table **users**:

| Field          | Type      | Notes                  |
| -------------- | --------- | ---------------------- |
| `id`           | Long      | Primary key            |
| `username`     | String    | Unique, required       |
| `passwordHash` | String    | BCrypt-hashed password |
| `description`  | String    | Optional               |
| `gamesWon`     | int       | Starts at 0            |
| `role`         | enum      | `PLAYER` or `ADMIN`    |
| `createdAt`    | timestamp | Auto-generated         |
| `updatedAt`    | timestamp | Auto-generated         |


# Authentication
The backend uses JWT Bearer tokens.
**Login flow:**
-User calls POST /api/users/login
-Backend responds with { token, user }
-Frontend stores token
Tokens last 24 hours.

# REST API Endpoints

Register User
POST /api/users/register

Request:
{
  "username": "player1",
  "password": "secret123",
  "description": "optional"
}

Response:
{
  "id": 1,
  "username": "player1",
  "description": "optional",
  "gamesWon": 0,
  "role": "PLAYER",
  "createdAt": "...",
  "updatedAt": "..."
}

Login
POST /api/users/login

Request:
{
  "username": "player1",
  "password": "secret123"
}

Response:
{
  "token": "<JWT_TOKEN>",
  "user": { ... }
}

Get User by ID
GET /api/users/{id}
Requires Authorization header

Response:
{
  "id": 1,
  "username": "player1",
  "description": "optional",
  "gamesWon": 0,
  "role": "PLAYER"
}

Update User
PATCH /api/users/{id}
Requires Authorization header

Request (fields optional):
{
  "username": "newName",
  "description": "new description"
}

Increment Games Won
POST /api/users/{id}/wins/increment
Requires Authorization header
Used by the Game Engine when a player wins a match.

Response:
{
  "id": 1,
  "username": "player1",
  "gamesWon": 3
}

Admin Only — Get All Users
GET /api/users
Requires ADMIN token
If non-admin calls → 403 Forbidden

Response:
[
  { "id": 1, "username": "admin", "role": "ADMIN" },
  { "id": 2, "username": "player2", "role": "PLAYER" },
  { "id": 3, "username": "player3", "role": "PLAYER" }
]

Creating an Admin User Manually
Use pgAdmin -> Query Tool:

UPDATE users
SET role = 'ADMIN'
WHERE username = 'player1';

Then log in again to receive a token that contains role = ADMIN.

# Testing Examples (PowerShell)

Register:
$body = @{
    username="p2"
    password="123"
    description="test"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "http://localhost:8081/api/users/register" -ContentType "application/json" -Body $body


Login:
$login = @{ username="p2"; password="123" } | ConvertTo-Json

$r = Invoke-RestMethod -Method Post -Uri "http://localhost:8081/api/users/login" -ContentType "application/json" -Body $login

$token = $r.token


Authenticated request:
Invoke-RestMethod -Method Get -Uri "http://localhost:8081/api/users/1" -Headers @{ Authorization = "Bearer $token" }


Get all users as an admin:
Invoke-RestMethod -Method Get `
    -Uri "http://localhost:8081/api/users" `
    -Headers @{ Authorization = "Bearer $adminToken" }