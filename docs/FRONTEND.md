# Frontend Documentation

## Overview

The BoilerExam frontend is a React application that provides a user interface for uploading and viewing PDF files. It communicates with the backend API to handle file operations.

## Architecture

### Components

#### App Component (`src/App.js`)

The main application component that handles:
- File selection and validation
- File upload with progress indication
- Displaying uploaded files list
- File viewing functionality

### Key Features

#### File Upload
- **File Type Validation**: Only accepts PDF files
- **Size Limitation**: Maximum file size of 50MB
- **Timeout Handling**: 10-second timeout for upload requests
- **Error Handling**: Comprehensive error handling for network issues, timeouts, and server errors

#### File Management
- **File Listing**: Displays all uploaded files with metadata
- **File Viewing**: Opens files in a new browser tab

#### User Experience
- **Loading States**: Shows upload progress with disabled buttons
- **Error Messages**: User-friendly error messages for various failure scenarios
- **File Reset**: Clears file input after successful upload

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:5000` | Backend API base URL |

## Component State Management

### App Component State

```javascript
const [selectedFile, setSelectedFile] = useState(null);     // Currently selected file
const [uploadedFiles, setUploadedFiles] = useState([]);    // List of uploaded files
const [loading, setLoading] = useState(false);             // Upload loading state
```

## Key Functions

### File Selection (`handleFileSelect`)
- Validates file type (PDF only)
- Updates selected file state
- Shows user-friendly error for invalid files

### File Upload (`handleUpload`)
- Validates file selection and size
- Creates FormData for multipart upload
- Implements timeout handling with AbortController
- Provides detailed error handling
- Refreshes file list on successful upload

### File Fetching (`fetchUploadedFiles`)
- Retrieves list of uploaded files from API
- Updates component state with file metadata
- Handles network errors gracefully

### File Viewing (`viewFile`)
- Opens files in new browser tab using file ID
- Constructs proper API endpoint URLs

## Error Handling

The frontend implements comprehensive error handling:

1. **File Type Validation**: Client-side validation for PDF files only
2. **File Size Validation**: 50MB maximum file size limit
3. **Network Errors**: Handles connection issues and API failures
4. **Timeout Handling**: 10-second timeout for upload requests
5. **Abort Handling**: Proper cleanup of aborted requests

## Styling

The application uses CSS modules with the following key classes:
- `.App`: Main application container
- `.App-header`: Header section styling
- `.upload-section`: File upload interface
- `.files-section`: File listing area

## Dependencies

### Production Dependencies
- `react`: ^18.2.0 - Core React library
- `react-dom`: ^18.2.0 - React DOM bindings
- `react-scripts`: 5.0.1 - Create React App build scripts

### Development Workflow
- `npm start`: Development server on port 3000
- `npm run build`: Production build
- `npm test`: Run test suite
- `npm run eject`: Eject from Create React App

## Integration with Backend

The frontend integrates with the backend through three main API calls:

1. **Upload**: `POST /upload` - File upload with multipart form data
2. **List Files**: `GET /files` - Retrieve all uploaded files
3. **View File**: `GET /files/:id` - Download/view specific file

## Security Considerations

- **File Type Validation**: Both client and server-side validation
- **File Size Limits**: Prevents oversized uploads
- **Error Information**: Minimal error information exposure
- **CORS**: Properly configured for cross-origin requests