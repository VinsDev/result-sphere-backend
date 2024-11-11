# School Management System API

This project is a School Management System API built with Node.js and Express. It supports essential school management operations like handling schools, terms, assessments, sessions, teachers, students, classes, subjects, enrollments, results, grading rules, and usage statistics.

## Table of Contents

- [Requirements](#requirements)
- [Architecture](#architecture)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Routes](#routes)
- [Middleware](#middleware)
- [Error Handling](#error-handling)
- [Health Check](#health-check)
- [Usage](#usage)
- [Development Workflow](#development-workflow)
- [License](#license)

## Requirements

- Node.js >= 12.x
- npm >= 6.x

## Architecture

The application follows a layered architecture pattern with clear separation of concerns:

### Architectural Layers

1. **Routes Layer (`/routes`)**
   - Handles HTTP requests and route definitions
   - Validates incoming request data
   - Passes validated data to the controller layer

2. **Controller Layer (`/controllers`)**
   - Contains business logic
   - Orchestrates data flow between routes and services
   - Handles response formatting

3. **Service Layer (`/services`)**
   - Implements core business logic
   - Handles complex operations and data transformations
   - Interacts with multiple repositories if needed

4. **Repository Layer (`/repositories`)**
   - Handles all database operations
   - Implements data access patterns
   - Manages database transactions

5. **Model Layer (`/models`)**
   - Defines data structures and schemas
   - Implements data validation rules
   - Manages relationships between entities

### Design Patterns Used

- **Repository Pattern**: Abstracts database operations
- **Dependency Injection**: For loose coupling between components
- **Factory Pattern**: For creating service instances
- **Observer Pattern**: For handling events like grade calculations
- **Strategy Pattern**: For implementing different grading rules

### Project Structure

```plaintext
src/
├── routes/
│   ├── index.js
│   ├── schools.js
│   ├── students.js
│   └── ...
├── controllers/
│   ├── SchoolController.js
│   ├── StudentController.js
│   └── ...
├── services/
│   ├── SchoolService.js
│   ├── StudentService.js
│   └── ...
├── repositories/
│   ├── SchoolRepository.js
│   ├── StudentRepository.js
│   └── ...
├── models/
│   ├── School.js
│   ├── Student.js
│   └── ...
├── middlewares/
│   ├── auth.js
│   ├── errorHandler.js
│   └── ...
└── config/
    ├── database.js
    └── app.js
```

## Setup

1. **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Configure environment variables:**

    - Create a `.env` file in the root directory.
    - Define your environment variables (see [Environment Variables](#environment-variables) section below).

4. **Start the development server:**

    ```bash
    npm start
    ```

   The server will start at `http://localhost:3000` or the port specified in your `.env` file.

## Environment Variables

This project requires certain environment variables to run properly. Define these variables in a `.env` file at the root of the project:

```plaintext
PORT=3000
NODE_ENV=development
DB_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

## Routes

Detailed breakdown of API routes:

### Schools Management
- `GET /schools` - List all schools
  - Query params: `page`, `limit`, `sort`, `fields`
- `POST /schools` - Create a new school
  - Required fields: `name`, `address`, `contact`
- `GET /schools/:id` - Get school details
- `PUT /schools/:id` - Update school information
- `DELETE /schools/:id` - Remove school

### Terms Management
- `GET /terms` - List all terms
- `POST /terms` - Create a new term
  - Required: `name`, `startDate`, `endDate`, `schoolId`
- `GET /terms/:id` - Get term details
- `PUT /terms/:id` - Update term
- `DELETE /terms/:id` - Delete term

### Assessments
- `GET /assessments` - List assessments
- `POST /assessments` - Create assessment
  - Required: `name`, `type`, `maxScore`, `weight`
- `GET /assessments/:id` - Get assessment details
- `PUT /assessments/:id` - Update assessment
- `DELETE /assessments/:id` - Delete assessment

### Teachers
- `GET /teachers` - List teachers
- `POST /teachers` - Add new teacher
  - Required: `name`, `email`, `subjects`, `qualifications`
- `GET /teachers/:id` - Get teacher details
- `PUT /teachers/:id` - Update teacher info
- `DELETE /teachers/:id` - Remove teacher

### Students
- `GET /students` - List students
  - Query params: `class`, `grade`, `term`
- `POST /students` - Add new student
  - Required: `name`, `dateOfBirth`, `guardianContact`
- `GET /students/:id` - Get student details
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Remove student

### Results Management
- `GET /results` - List results
  - Query params: `student`, `subject`, `term`
- `POST /results` - Add new result
  - Required: `studentId`, `subjectId`, `assessmentId`, `score`
- `GET /results/:id` - Get result details
- `PUT /results/:id` - Update result
- `DELETE /results/:id` - Delete result

All routes support:
- Pagination
- Sorting
- Field selection
- Filter operations
- Advanced querying
- Population of related data

## Middleware

- `body-parser`: Parses JSON payloads.
- `cors`: Enables Cross-Origin Resource Sharing.
- `loggerMiddleware`: Logs incoming requests (custom middleware, optional).
- `errorMiddleware`: Handles application errors globally.
- `authMiddleware`: Handles authentication and authorization
  - Validates JWT tokens
  - Checks user permissions
  - Manages role-based access
- `validationMiddleware`: Validates request data
- `rateLimiter`: Prevents API abuse
- `sanitizer`: Sanitizes input data

Add your custom middleware in the middlewares directory.

## Error Handling

The app uses `errorMiddleware` to manage errors. Additionally, it includes global handlers for uncaught exceptions and unhandled promise rejections:

- **Uncaught Exception**: Catches unexpected errors and logs them.
- **Unhandled Promise Rejection**: Handles rejected promises not caught in code.
- **Custom Error Classes**:
  - `ApiError`: Base error class for API errors
  - `ValidationError`: For data validation errors
  - `AuthenticationError`: For auth-related errors
  - `NotFoundError`: For resource not found errors
  - `DatabaseError`: For database operation errors

These handlers can be modified to restart the server or perform other actions as needed.

## Health Check

- **Endpoint**: `/health`
- **Method**: GET
- **Response**: `{ "message": "Server active . . ." }`
- **Additional Checks**:
  - Database connection status
  - External service status
  - Memory usage
  - System uptime

This endpoint confirms that the server is running correctly.

## Usage

To start the server in development mode:

```bash
npm run dev
```

To start the server in production mode:

```bash
npm start
```

For testing:

```bash
npm test                 # Run all tests
npm run test:coverage    # Run tests with coverage report
npm run test:e2e        # Run end-to-end tests
```

## Development Workflow

1. Clone the repository and check out a new branch:

    ```bash
    git clone <repository-url>
    cd <project-directory>
    git checkout -b feature/<your-feature-name>
    ```

2. Make your changes and commit:

    ```bash
    git add .
    git commit -m "Add your message here"
    ```

3. Push to your feature branch:

    ```bash
    git push origin feature/<your-feature-name>
    ```

4. Raise a pull request:
   - Open a pull request on GitHub to merge your feature branch into the main branch.
   - Provide a clear description of the changes in the pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more information.
