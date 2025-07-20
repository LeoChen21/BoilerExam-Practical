# Architecture Documentation

## System Overview

BoilerExam is a full-stack PDF upload and management system built with a React frontend, Node.js backend, PostgreSQL database, and MinIO object storage. The system is containerized using Docker and orchestrated with Docker Compose.

## Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│ (PostgreSQL)    │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Object Storage │
                       │    (MinIO)      │
                       │   Port: 9000    │
                       └─────────────────┘
```

## Components

### Frontend (React Application)
- **Technology**: React 18.2.0 with Create React App
- **Port**: 3000
- **Responsibilities**:
  - User interface for file upload
  - File listing and viewing
  - Client-side validation
  - Error handling and user feedback

### Backend (Node.js API)
- **Technology**: Node.js with Express.js
- **Port**: 5000
- **Responsibilities**:
  - REST API endpoints
  - File upload handling with Multer
  - Database operations
  - Object storage integration
  - Server-side validation

### Database (PostgreSQL)
- **Technology**: PostgreSQL 15
- **Port**: 5432
- **Responsibilities**:
  - File metadata storage
  - User data persistence
  - Relational data management

### Object Storage (MinIO)
- **Technology**: MinIO (S3-compatible)
- **Port**: 9000 (API), 9001 (Console)
- **Responsibilities**:
  - PDF file storage
  - File retrieval
  - Scalable object storage

## Data Flow

### File Upload Process
1. User selects PDF file in React frontend
2. Frontend validates file type and size
3. File is sent via multipart/form-data to backend
4. Backend validates file and generates UUID
5. File buffer is stored in MinIO bucket
6. File metadata is stored in PostgreSQL
7. Success response returned to frontend

### File Retrieval Process
1. Frontend requests file list from backend
2. Backend queries PostgreSQL for metadata
3. File list returned to frontend
4. User clicks to view file
5. Frontend requests file by ID
6. Backend retrieves file from MinIO
7. File stream is returned to browser

## Database Schema

### uploaded_files Table
```sql
CREATE TABLE uploaded_files (
    id UUID PRIMARY KEY,              -- Unique file identifier
    filename VARCHAR(255) NOT NULL,   -- Generated filename (UUID.pdf)
    original_name VARCHAR(255) NOT NULL, -- Original upload filename
    file_size INTEGER NOT NULL,       -- File size in bytes
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Upload timestamp
);
```

## Environment Configuration

### Development Environment
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Database: `postgresql://postgres:password@localhost:5432/boilerexam`
- MinIO: `http://localhost:9000`

### Production Environment
All services communicate via Docker network using service names:
- Frontend ↔ Backend: `http://backend:5000`
- Backend ↔ Database: `postgresql://postgres:password@postgres:5432/boilerexam`
- Backend ↔ MinIO: `http://minio:9000`

## Security Considerations

### File Upload Security
- File type validation (PDF only)
- File size limits (50MB maximum)
- UUID-based filenames prevent path traversal
- Memory-based upload processing

### Data Security
- PostgreSQL with proper connection strings
- MinIO with access key authentication
- CORS configuration for frontend access
- No sensitive data in frontend code

### Network Security
- Services isolated in Docker network
- Port exposure limited to necessary services
- Environment variables for sensitive configuration

## Scalability Considerations

### Horizontal Scaling
- Frontend: Multiple React app instances behind load balancer
- Backend: Multiple Node.js instances with shared database/storage
- Database: PostgreSQL read replicas for read scaling
- Storage: MinIO distributed mode for high availability

### Performance Optimization
- File streaming for large PDF downloads
- Connection pooling for database
- Static asset caching
- CDN integration for global distribution

## Development Workflow

### Local Development
1. Clone repository
2. Run `docker-compose up` to start all services
3. Frontend available at `http://localhost:3000`
4. Backend API at `http://localhost:5000`
5. MinIO console at `http://localhost:9001`

### Testing
- Frontend: React Testing Library
- Backend: Manual API testing
- Integration: End-to-end testing possible

### Deployment
- Containerized deployment via Docker
- Environment-specific configuration
- Health checks for all services
- Volume persistence for data

## Monitoring and Logging

### Application Logging
- Backend: Console logging for errors and operations
- Frontend: Browser console for debugging
- Database: PostgreSQL query logging
- Storage: MinIO access logging

### Health Monitoring
- Backend health endpoint considerations
- Database connection monitoring
- Storage availability checks
- Frontend error boundary implementation