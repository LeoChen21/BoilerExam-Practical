# Usage Guide

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Web browser (Chrome, Firefox, Safari, Edge)
- PDF files to upload (optional for testing)

### Quick Start
1. **Clone and Start the Application**
   ```bash
   git clone <repository-url>
   cd boilerexam
   docker-compose up -d
   ```

2. **Access the Application**
   - Open your web browser
   - Navigate to `http://localhost:3000`
   - The BoilerExam interface will load

## Using the Web Interface

### Uploading Files

1. **Select a PDF File**
   - Click the file input button
   - Choose a PDF file from your computer
   - Only PDF files are accepted (validated automatically)

2. **Upload the File**
   - Click the "Upload PDF" button
   - Wait for the upload to complete
   - You'll see a success message when done

3. **File Validation**
   - **File Type**: Only PDF files are accepted
   - **File Size**: Maximum 50MB per file
   - **Timeout**: Uploads timeout after 10 seconds

### Viewing Uploaded Files

1. **File List**
   - All uploaded files appear below the upload section
   - Files are sorted by upload date (newest first)
   - Each file shows its original filename

2. **Opening Files**
   - Click the "View" button next to any file
   - The PDF will open in a new browser tab
   - Files stream directly from the server

### Error Handling

The application provides clear error messages for common issues:
- **"Please select a PDF file"**: Wrong file type selected
- **"File size too large"**: File exceeds 50MB limit
- **"Upload timed out"**: Network or server issues
- **"Network error"**: Connection problems

## API Usage Examples

### Using curl Commands

#### Upload a File
```bash
curl -X POST \
  -F "pdf=@document.pdf" \
  http://localhost:5000/upload
```

**Response:**
```json
{
  "message": "File uploaded successfully",
  "fileId": "550e8400-e29b-41d4-a716-446655440000",
  "filename": "document.pdf"
}
```

#### List All Files
```bash
curl http://localhost:5000/files
```

**Response:**
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

#### Download a File
```bash
curl http://localhost:5000/files/550e8400-e29b-41d4-a716-446655440000 \
  --output downloaded.pdf
```

### Using JavaScript/Fetch

#### Upload File from Web Page
```javascript
// HTML: <input type="file" id="fileInput" accept=".pdf">

const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('pdf', file);

fetch('http://localhost:5000/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log('Upload successful:', data))
.catch(error => console.error('Upload failed:', error));
```

#### Fetch File List
```javascript
fetch('http://localhost:5000/files')
  .then(response => response.json())
  .then(files => {
    files.forEach(file => {
      console.log(`${file.filename} (${file.file_size} bytes)`);
    });
  })
  .catch(error => console.error('Error:', error));
```

### Using Python Requests

#### Upload File
```python
import requests

# Upload a file
with open('document.pdf', 'rb') as file:
    files = {'pdf': file}
    response = requests.post('http://localhost:5000/upload', files=files)
    print(response.json())

# List files
response = requests.get('http://localhost:5000/files')
files = response.json()
for file in files:
    print(f"{file['filename']} - {file['file_size']} bytes")

# Download file
file_id = "550e8400-e29b-41d4-a716-446655440000"
response = requests.get(f'http://localhost:5000/files/{file_id}')
with open('downloaded.pdf', 'wb') as f:
    f.write(response.content)
```

## Development Usage

### Running in Development Mode

1. **Backend Development**
   ```bash
   cd backend
   npm install
   npm run dev  # Uses nodemon for auto-restart
   ```

2. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm start   # React development server
   ```

3. **Environment Variables**
   ```bash
   # Backend .env file
   DATABASE_URL=postgresql://postgres:password@localhost:5432/boilerexam
   MINIO_ENDPOINT=localhost:9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin
   
   # Frontend .env file
   REACT_APP_API_URL=http://localhost:5000
   ```

### Testing the API

#### Health Check Endpoint (Custom)
```bash
# You can add this to the backend
curl http://localhost:5000/health
```

#### Test File Upload with Large File
```bash
# Create a test PDF
echo "%PDF-1.4 Test Content" > test.pdf

# Upload it
curl -X POST -F "pdf=@test.pdf" http://localhost:5000/upload
```

## Common Workflows

### Batch Upload Workflow
```bash
#!/bin/bash
# Upload multiple PDFs

for file in *.pdf; do
  echo "Uploading $file..."
  curl -X POST -F "pdf=@$file" http://localhost:5000/upload
  echo ""
done
```

### File Management Workflow
```javascript
class PDFManager {
  constructor(apiUrl = 'http://localhost:5000') {
    this.apiUrl = apiUrl;
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('pdf', file);
    
    const response = await fetch(`${this.apiUrl}/upload`, {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }

  async listFiles() {
    const response = await fetch(`${this.apiUrl}/files`);
    return response.json();
  }

  async downloadFile(fileId) {
    const response = await fetch(`${this.apiUrl}/files/${fileId}`);
    return response.blob();
  }
}

// Usage
const manager = new PDFManager();
const files = await manager.listFiles();
console.log(`Found ${files.length} files`);
```

## Troubleshooting Common Issues

### Upload Issues
- **File not uploading**: Check file type (must be PDF)
- **Upload timeout**: Try smaller files or check network
- **Server error**: Check backend logs with `docker-compose logs backend`

### Access Issues
- **Cannot reach frontend**: Ensure port 3000 is not blocked
- **API not responding**: Check if backend is running on port 5000
- **Database errors**: Verify PostgreSQL is running and accessible

### Performance Issues
- **Slow uploads**: Check file size (50MB limit)
- **Slow file listing**: Database performance may need tuning
- **High memory usage**: Monitor Docker container resources

### Browser Issues
- **PDF not opening**: Check browser PDF viewer settings
- **Upload button disabled**: Ensure a valid PDF is selected
- **Network errors**: Check CORS configuration for cross-origin requests

## Best Practices

### File Management
- Use descriptive filenames before uploading
- Keep file sizes reasonable (under 10MB for best performance)
- Regularly review and clean up uploaded files

### Development
- Use environment variables for configuration
- Implement proper error handling in custom integrations
- Monitor application logs for issues
- Test uploads with various PDF sizes and formats

### Production
- Configure proper backup strategies
- Monitor disk space usage
- Set up log rotation
- Implement proper authentication if needed