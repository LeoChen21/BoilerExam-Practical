const express = require('express');
const multer = require('multer');
const { Client } = require('pg');
const { Client: MinioClient } = require('minio');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

const pgClient = new Client({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@postgres:5432/boilerexam'
});

const minioClient = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT?.split(':')[0] || 'minio',
  port: parseInt(process.env.MINIO_ENDPOINT?.split(':')[1]) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const bucketName = process.env.MINIO_BUCKET || 'pdfs';

async function initializeDatabase() {
  try {
    await pgClient.connect();
    console.log('Connected to PostgreSQL');

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

app.post('/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileId = uuidv4();
    const filename = `${fileId}.pdf`;

    await minioClient.putObject(bucketName, filename, req.file.buffer, req.file.size, {
      'Content-Type': 'application/pdf'
    });

    await pgClient.query(
      'INSERT INTO uploaded_files (id, filename, original_name, file_size) VALUES ($1, $2, $3, $4)',
      [fileId, filename, req.file.originalname, req.file.size]
    );

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

app.get('/files', async (req, res) => {
  try {
    const result = await pgClient.query(
      'SELECT id, original_name as filename, file_size, upload_date FROM uploaded_files ORDER BY upload_date DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

app.get('/files/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const result = await pgClient.query('SELECT filename FROM uploaded_files WHERE id = $1', [fileId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filename = result.rows[0].filename;
    const stream = await minioClient.getObject(bucketName, filename);
    
    res.setHeader('Content-Type', 'application/pdf');
    stream.pipe(res);
  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

async function startServer() {
  await initializeDatabase();
  await initializeMinio();
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);