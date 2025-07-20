# Contributing Guide

## Development Setup

### Prerequisites
- Node.js 16+ and npm
- Docker and Docker Compose
- Git

### Local Development Environment

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd boilerexam
   ```

2. **Start Supporting Services**
   ```bash
   # Start PostgreSQL and MinIO only
   docker-compose up postgres minio -d
   ```

3. **Backend Development**
   ```bash
   cd backend
   npm install
   npm run dev  # Runs with nodemon for auto-restart
   ```

4. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm start   # React development server
   ```

## Code Style and Standards

### JavaScript/Node.js Standards
- Use ES6+ features where appropriate
- Follow async/await pattern for asynchronous operations
- Use descriptive variable and function names
- Add JSDoc comments for functions and classes
- Handle errors gracefully with try-catch blocks

### React Standards
- Use functional components with hooks
- Keep components small and focused
- Use meaningful prop names
- Handle loading and error states
- Add comments for complex logic

### Code Examples

#### Backend Function Documentation
```javascript
/**
 * Upload endpoint - handles PDF file uploads
 * Stores file in MinIO and metadata in PostgreSQL
 * 
 * @route POST /upload
 * @param {File} pdf - PDF file to upload (multipart/form-data)
 * @returns {Object} Success response with fileId and filename
 */
app.post('/upload', upload.single('pdf'), async (req, res) => {
  // Implementation
});
```

#### React Component Documentation
```javascript
/**
 * Handle file upload process
 * Validates file, uploads to server, and updates UI
 */
const handleUpload = async () => {
  // Implementation
};
```

## Testing Guidelines

### Backend Testing
Currently, the project uses manual testing. To add automated tests:

```bash
cd backend
npm install --save-dev jest supertest
```

**Example test structure:**
```javascript
// tests/upload.test.js
const request = require('supertest');
const app = require('../server');

describe('POST /upload', () => {
  test('should upload PDF file successfully', async () => {
    const response = await request(app)
      .post('/upload')
      .attach('pdf', 'test-files/sample.pdf')
      .expect(200);
    
    expect(response.body.message).toBe('File uploaded successfully');
  });
});
```

### Frontend Testing
The React app is set up with testing infrastructure:

```bash
cd frontend
npm test
```

**Example component test:**
```javascript
// src/App.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders upload interface', () => {
  render(<App />);
  const uploadButton = screen.getByText(/upload pdf/i);
  expect(uploadButton).toBeInTheDocument();
});
```

## Pull Request Process

### Before Submitting
1. **Test Your Changes**
   - Run the application locally
   - Test all affected functionality
   - Verify error handling works

2. **Code Quality**
   - Add appropriate comments and documentation
   - Follow existing code style
   - Remove console.log statements
   - Check for security vulnerabilities

3. **Documentation Updates**
   - Update relevant documentation files
   - Add usage examples if adding new features
   - Update API documentation for backend changes

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] Documentation updated

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] No console.log statements
```

## Adding New Features

### Backend Features

1. **Add New Endpoint**
   ```javascript
   /**
    * New endpoint description
    * @route METHOD /path
    * @param {Type} param - Parameter description
    * @returns {Object} Response description
    */
   app.method('/path', async (req, res) => {
     try {
       // Implementation
       res.json({ success: true });
     } catch (error) {
       console.error('Error:', error);
       res.status(500).json({ error: 'Operation failed' });
     }
   });
   ```

2. **Update Documentation**
   - Add endpoint to `docs/API.md`
   - Update usage examples
   - Add error codes and responses

### Frontend Features

1. **Add New Component**
   ```javascript
   /**
    * Component description
    * @param {Object} props - Component properties
    */
   function NewComponent({ prop1, prop2 }) {
     // State management
     // Event handlers
     // Render logic
   }
   ```

2. **Update State Management**
   - Add new state variables
   - Create appropriate handlers
   - Update useEffect dependencies

## Bug Fixes

### Debugging Process
1. **Reproduce the Issue**
   - Create minimal reproduction steps
   - Document expected vs actual behavior
   - Check browser console for errors

2. **Identify Root Cause**
   - Check backend logs: `docker-compose logs backend`
   - Check database queries
   - Verify file operations

3. **Implement Fix**
   - Make minimal necessary changes
   - Add error handling if missing
   - Test the fix thoroughly

### Common Issues and Solutions

#### Upload Failures
- Check file size limits
- Verify file type validation
- Test with different PDF files
- Check MinIO connectivity

#### Database Issues
- Verify connection string
- Check table schema
- Test queries manually
- Review error logs

#### Frontend Issues
- Check API URL configuration
- Verify CORS settings
- Test network requests
- Check React error boundaries

## Documentation Contributions

### Adding Documentation
1. **Identify Missing Documentation**
   - User-facing features
   - API changes
   - Configuration options
   - Troubleshooting steps

2. **Documentation Standards**
   - Use clear, concise language
   - Include code examples
   - Add troubleshooting sections
   - Keep formatting consistent

3. **Update Existing Documentation**
   - Keep examples current
   - Remove outdated information
   - Improve clarity and organization

## Performance Improvements

### Backend Optimization
- Database query optimization
- Connection pooling
- Error handling improvements
- Memory usage optimization

### Frontend Optimization
- Component rendering optimization
- Bundle size reduction
- Loading state improvements
- Error boundary implementation

## Security Considerations

### Code Security
- Validate all inputs
- Use parameterized queries
- Handle file uploads securely
- Don't expose sensitive information

### Dependency Security
```bash
# Check for vulnerabilities
npm audit
npm audit fix
```

## Release Process

### Version Management
1. Update version numbers
2. Create changelog entries
3. Test all functionality
4. Create git tags
5. Update deployment documentation

### Deployment Testing
1. Test in production-like environment
2. Verify all services start correctly
3. Test file upload/download functionality
4. Check performance metrics

## Getting Help

### Resources
- Check existing documentation in `/docs`
- Review code comments and structure
- Look at similar implementations
- Search for error messages in logs

### Asking Questions
When asking for help, include:
- Description of what you're trying to do
- Steps you've already tried
- Error messages (with sensitive info removed)
- System information (OS, Node version, etc.)

## Code Review Guidelines

### Reviewing Pull Requests
- Check code quality and style
- Verify functionality works as described
- Review security implications
- Test locally if possible
- Provide constructive feedback

### Responding to Reviews
- Address all feedback
- Ask questions if unclear
- Make requested changes
- Test changes after modifications