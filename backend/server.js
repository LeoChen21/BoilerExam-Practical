/**
 * BoilerExam Backend Server
 * 
 * A REST API server for handling PDF file uploads, storage, and retrieval.
 * Uses PostgreSQL for metadata storage and MinIO for file storage.
 */

const express = require('express');
const multer = require('multer');
const { Client } = require('pg');
const { Client: MinioClient } = require('minio');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 5000;

// Enable CORS for frontend integration
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
// Store files in memory buffer for direct transfer to MinIO
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Only allow PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// PostgreSQL client configuration
// Uses environment variable or defaults to Docker compose setup
const pgClient = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/boilerexam'
});

// MinIO client configuration for object storage
// Parses endpoint string and uses environment variables or defaults
const minioClient = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT?.split(':')[0] || 'minio',
  port: parseInt(process.env.MINIO_ENDPOINT?.split(':')[1]) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

// MinIO bucket name for storing PDF files
const bucketName = process.env.MINIO_BUCKET || 'pdfs';

/**
 * Initialize PostgreSQL database connection and create required tables
 * Creates the uploaded_files table if it doesn't exist
 */
async function initializeDatabase() {
  try {
    await pgClient.connect();
    console.log('Connected to PostgreSQL');

    // Create uploaded_files table with UUID primary key
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS uploaded_files (
        id UUID PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_size INTEGER NOT NULL,
        upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Database table created/verified');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

/**
 * Initialize MinIO bucket for file storage
 * Creates the bucket if it doesn't exist
 */
async function initializeMinio() {
  try {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
      console.log(`Bucket ${bucketName} created`);
    } else {
      console.log(`Bucket ${bucketName} already exists`);
    }
  } catch (error) {
    console.error('MinIO initialization error:', error);
  }
}

/**
 * Upload endpoint - handles PDF file uploads
 * Stores file in MinIO and metadata in PostgreSQL
 * 
 * @route POST /upload
 * @param {File} pdf - PDF file to upload (multipart/form-data)
 * @returns {Object} Success response with fileId and filename
 */
app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    // Validate file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Generate unique file ID and filename
    const fileId = uuidv4();
    const filename = `${fileId}.pdf`;

    // Store file in MinIO object storage
    await minioClient.putObject(bucketName, filename, req.file.buffer, req.file.size, {
      'Content-Type': 'application/pdf'
    });

    // Store file metadata in PostgreSQL
    await pgClient.query(
      'INSERT INTO uploaded_files (id, filename, original_name, file_size) VALUES ($1, $2, $3, $4)',
      [fileId, filename, req.file.originalname, req.file.size]
    );

    // Return success response
    res.json({
      message: 'File uploaded successfully',
      fileId: fileId,
      filename: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

/**
 * Get all files endpoint - returns list of uploaded files
 * 
 * @route GET /files
 * @returns {Array} List of uploaded files with metadata
 */
app.get('/files', async (req, res) => {
  try {
    // Query all files ordered by upload date (newest first)
    const result = await pgClient.query(
      'SELECT id, original_name as filename, file_size, upload_date FROM uploaded_files ORDER BY upload_date DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

/**
 * Get specific file endpoint - serves PDF file by ID
 * 
 * @route GET /files/:id
 * @param {string} id - UUID of the file to retrieve
 * @returns {Stream} PDF file stream
 */
app.get('/files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    
    // Look up file metadata in database
    const result = await pgClient.query('SELECT filename FROM uploaded_files WHERE id = $1', [fileId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Get filename and stream from MinIO
    const filename = result.rows[0].filename;
    const stream = await minioClient.getObject(bucketName, filename);
    
    // Set appropriate headers and pipe file stream
    res.setHeader('Content-Type', 'application/pdf');
    stream.pipe(res);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

/**
 * Start the server with proper initialization
 * Initializes database and MinIO before starting Express server
 */
async function startServer() {
  await initializeDatabase();
  await initializeMinio();
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

// Start the server and handle any initialization errors
startServer().catch(console.error);