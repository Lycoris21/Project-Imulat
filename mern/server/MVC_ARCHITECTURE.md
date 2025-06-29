# MVC Architecture Implementation

## Project Structure

```
mern/server/
├── controllers/          # Request handlers (Controller layer)
│   ├── userController.js
│   └── reportController.js
├── services/            # Business logic (Service layer)
│   ├── userService.js
│   └── reportService.js
├── models/              # Database schemas (Model layer)
│   ├── User.js
│   ├── Report.js
│   ├── Claim.js
│   ├── Comment.js
│   ├── Reaction.js
│   ├── Bookmark.js
│   ├── Collection.js
│   └── index.js
├── routes/              # API routes (Route layer)
│   ├── users.js
│   ├── reports.js
│   └── record.js
├── middleware/          # Custom middleware
│   ├── errorHandler.js
│   └── validation.js
├── services/            # Business logic services
├── utils/               # Utility functions
│   └── helpers.js
├── db/                  # Database configuration
│   └── connection.js
├── config.env           # Environment variables
└── server.js           # Main server file
```

## Architecture Layers

### 1. **Routes Layer** (`/routes`)
- **Purpose**: Define API endpoints and map them to controller methods
- **Responsibilities**: 
  - URL routing
  - Middleware application (validation, authentication)
  - Delegating to controllers

### 2. **Controller Layer** (`/controllers`)
- **Purpose**: Handle HTTP requests and responses
- **Responsibilities**:
  - Input validation (basic)
  - Call service layer methods
  - Format responses
  - Error handling

### 3. **Service Layer** (`/services`)
- **Purpose**: Business logic and data processing
- **Responsibilities**:
  - Complex business rules
  - Data transformation
  - Integration with external services
  - Database operations coordination

### 4. **Model Layer** (`/models`)
- **Purpose**: Data structure and database interaction
- **Responsibilities**:
  - Database schema definition
  - Data validation
  - Virtual properties
  - Indexes

## Key Features

### **Implemented**
- Clean separation of concerns
- Input validation with express-validator
- Global error handling middleware
- Consistent API response format
- Database connection management
- Service layer for business logic
- Controller layer for request handling
- Utility functions for common operations

### 🔄 **Ready to Add**
- Authentication middleware
- Rate limiting
- Request logging
- API documentation (Swagger)
- Unit tests
- Integration tests

## Usage Examples

### Creating a New Entity

1. **Create Model** (`models/example.js`)
```javascript
import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  name: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Example', exampleSchema);
```

2. **Create Service** (`services/exampleService.js`)
```javascript
import Example from '../models/Example.js';

class ExampleService {
  static async getAll() {
    return await Example.find({});
  }
  
  static async create(data) {
    const example = new Example(data);
    return await example.save();
  }
}

export default ExampleService;
```

3. **Create Controller** (`controllers/exampleController.js`)
```javascript
import ExampleService from '../services/exampleService.js';

class ExampleController {
  static async getAll(req, res) {
    try {
      const examples = await ExampleService.getAll();
      res.json(examples);
    } catch (error) {
      next(error);
    }
  }
}

export default ExampleController;
```

4. **Create Routes** (`routes/examples.js`)
```javascript
import express from 'express';
import ExampleController from '../controllers/exampleController.js';

const router = express.Router();
router.get('/', ExampleController.getAll);

export default router;
```

## API Endpoints

All routes are prefixed with `/api`:

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/:id` - Get report by ID
- `POST /api/reports` - Create new report
- `PATCH /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/verdict/:verdict` - Get reports by verdict

### Health Check
- `GET /api/health` - Server health status

## Error Handling

The application uses centralized error handling:

- **Validation Errors**: 400 status with detailed validation messages
- **Not Found**: 404 status for missing resources
- **Server Errors**: 500 status for unexpected errors
- **Duplicate Key**: 400 status for unique constraint violations

## Validation

Input validation is handled by express-validator middleware:

- **User Creation**: Username, email, password validation
- **User Update**: Optional field validation
- **MongoDB ObjectId**: Valid ObjectId format validation

## Running the Application

1. **Start the server**:
```bash
npm start
# or
node server.js
```

2. **Test the health endpoint**:
```bash
curl http://localhost:5050/api/health
```

3. **Example API call**:
```bash
curl -X POST http://localhost:5050/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Benefits of This Architecture

1. **Maintainability**: Clear separation makes code easier to maintain
2. **Testability**: Each layer can be tested independently
3. **Scalability**: Easy to add new features and endpoints
4. **Reusability**: Services can be reused across different controllers
5. **Consistency**: Standardized error handling and response formats
