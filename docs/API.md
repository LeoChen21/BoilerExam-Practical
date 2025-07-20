# API Documentation

## Overview

The BoilerExam backend provides a REST API for uploading, storing, and retrieving PDF files. The API uses PostgreSQL for metadata storage and MinIO for file storage.

## Base URL

```
http://localhost:5000
```

## Endpoints

### POST /upload

Upload a PDF file to the system.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with a field named `pdf` containing the PDF file

**Request Example:**
```javascript
const formData = new FormData();
formData.append('pdf', pdfFile);

const response = await fetch('/upload', {
  method: 'POST',
  body: formData
});
```

**Response:**
- Status: `200 OK` on success
- Content-Type: `application/json`

**Success Response Body:**
```json
{
  "message": "File uploaded successfully",
  "fileId": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "original-file-name.pdf"
}
```

**Error Responses:**
- `400 Bad Request` - No file uploaded or invalid file type
- `500 Internal Server Error` - Upload failed

**File Restrictions:**
- Only PDF files are accepted
- File type validation is performed both client-side and server-side

### GET /files

Retrieve a list of all uploaded files.

**Request:**
- Method: `GET`
- No parameters required

**Response:**
- Status: `200 OK`
- Content-Type: `application/json`

**Response Body:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "filename": "document.pdf",
    "file_size": 2048576,
    "upload_date": "2024-01-01T12:00:00.000Z"
  }
]
```

**Error Responses:**
- `500 Internal Server Error` - Failed to fetch files

### GET /files/:id

Download or view a specific file by its ID.

**Request:**
- Method: `GET`
- URL Parameter: `id` (UUID of the file)

**Response:**
- Status: `200 OK`
- Content-Type: `application/pdf`
- Body: PDF file stream

**Error Responses:**
- `404 Not Found` - File not found
- `500 Internal Server Error` - Failed to serve file

## Environment Variables

The API supports the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:password@postgres:5432/boilerexam` | PostgreSQL connection string |
| `MINIO_ENDPOINT` | `minio:9000` | MinIO server endpoint |
| `MINIO_ACCESS_KEY` | `minioadmin` | MinIO access key |
| `MINIO_SECRET_KEY` | `minioadmin` | MinIO secret key |
| `MINIO_BUCKET` | `pdfs` | MinIO bucket name for storing files |

## Database Schema

### uploaded_files table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, unique file identifier |
| `filename` | VARCHAR(255) | Generated filename (UUID.pdf) |
| `original_name` | VARCHAR(255) | Original filename from upload |
| `file_size` | INTEGER | File size in bytes |
| `upload_date` | TIMESTAMP | Upload timestamp (auto-generated) |

## Error Handling

All endpoints return JSON error responses in the following format:

```json
{
  "error": "Error description"
}
```

Common error scenarios:
- File type validation failures
- Database connection issues
- MinIO storage failures
- File not found errors