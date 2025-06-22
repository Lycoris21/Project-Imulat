# Database Setup Guide

## Overview
This project uses MongoDB Atlas as the database with Mongoose for schema management. The database structure is designed for a fact-checking/truth verification platform.

## Database Schema

### Collections (Tables)

1. **Users** - User accounts and profiles
2. **Reports** - Fact-checking reports with truth verdicts
3. **Claims** - Individual claims that can be fact-checked
4. **Comments** - Comments on reports and claims
5. **Reactions** - Likes/dislikes on reports, claims, and comments
6. **Bookmarks** - User bookmarks for reports and claims
7. **Collections** - User-created collections to organize bookmarks

## Setup Instructions

### 1. Environment Configuration
Make sure your `config.env` file contains:
```
ATLAS_URI="your-mongodb-atlas-connection-string"
PORT=5050
```

### 2. Install Dependencies
```bash
npm install mongoose dotenv
```

### 3. Database Connection
The database connection is automatically established when the server starts. The connection file is located at `db/connection.js`.

### 4. Models
All Mongoose models are defined in the `models/` directory:
- `User.js` - User schema
- `Report.js` - Report schema
- `Claim.js` - Claim schema
- `Comment.js` - Comment schema
- `Reaction.js` - Reaction schema
- `Bookmark.js` - Bookmark schema
- `Collection.js` - Collection schema

## API Endpoints

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Reports
- `GET /reports` - Get all reports
- `GET /reports/:id` - Get report by ID
- `POST /reports` - Create new report
- `PATCH /reports/:id` - Update report
- `DELETE /reports/:id` - Delete report
- `GET /reports/verdict/:verdict` - Get reports by truth verdict

## Schema Relationships

### Key Relationships
- **Users** can create multiple **Reports** and **Claims**
- **Reports** can reference multiple **Claims**
- **Claims** can optionally belong to a **Report**
- **Comments** can target **Reports** or **Claims**
- **Comments** can have **parent comments** (for replies)
- **Reactions** can target **Reports**, **Claims**, or **Comments**
- **Bookmarks** can reference **Reports** or **Claims**
- **Bookmarks** can optionally belong to **Collections**
- **Collections** belong to **Users**

### Data Types and Validation

#### User Schema
- `username`: String (required, unique, 3-50 chars)
- `email`: String (required, unique, validated email format)
- `passwordHash`: String (required)
- `birthdate`: Date (optional)
- `bio`: String (max 500 chars)
- `role`: Enum ['user', 'admin', 'moderator', 'expert']

#### Report Schema
- `truthVerdict`: Enum ['true', 'false', 'partially_true', 'misleading', 'unverified', 'disputed']
- `aiTruthIndex`: Number (0.0 - 1.0)
- Supports full-text search on title and content

#### Comment Schema
- `targetType`: Enum ['Report', 'Claim']
- Supports nested comments (replies)
- Max 1000 characters

#### Reaction Schema
- `reactionType`: Enum ['like', 'dislike']
- `targetType`: Enum ['Report', 'Claim', 'Comment']
- Unique constraint: one reaction per user per target

## Running the Server

1. Start the server:
```bash
npm start
# or
node server.js
```

2. The server will connect to MongoDB Atlas and start listening on port 5050

3. You should see:
```
Server listening on port 5050
Mongoose connected to MongoDB Atlas
MongoDB Connected: your-cluster-host
```

## Development Notes

- All models use timestamps (createdAt, updatedAt) automatically
- Indexes are created for optimal query performance
- Models use Mongoose validation and schema enforcement
- Environment variables are loaded via dotenv
- Connection includes proper error handling and graceful shutdown

## Example Usage

### Creating a User
```javascript
POST /users
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "bio": "Fact-checking enthusiast"
}
```

### Creating a Report
```javascript
POST /reports
{
  "userId": "user_object_id",
  "reportTitle": "Analysis of Climate Change Claims",
  "reportContent": "Detailed analysis...",
  "truthVerdict": "partially_true",
  "reportConclusion": "The claim is partially supported by evidence..."
}
```
