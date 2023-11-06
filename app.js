require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');
const stream = require('stream');

const app = express();
const PORT = process.env.PORT || 3000;
const BUCKET_NAME = process.env.CYCLIC_BUCKET_NAME;

// Create an S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN // Include if you have a session token
  }
});

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory store for demonstration purposes
let fileMap = {};

// POST handler to save text to S3
app.post('/', async (req, res) => {
  const { Content } = req.body;
  const fileName = `file-${uuidv4()}`; // Prefixing the UUID to ensure uniqueness across all files

  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: Content
  };

  try {
    const command = new PutObjectCommand(params);
    await s3.send(command);
    fileMap[fileName] = Content; // Store in in-memory map (replace this with a database in production)
    res.json({ message: 'Text saved successfully', fileName: fileName });
  } catch (err) {
    res.status(500).json({ error: "Error uploading data to S3.", details: err.message });
  }
});

// GET handler to retrieve text from S3
app.get('/', async (req, res) => {
  const fileNames = Object.keys(fileMap); // Retrieve file names from in-memory store
  if (!fileNames.length) {
    return res.status(404).json({ error: "No files saved." });
  }

  try {
    // Assuming we want the latest file saved
    const latestFileName = fileNames[fileNames.length - 1];
    const getParams = {
      Bucket: BUCKET_NAME,
      Key: latestFileName
    };

    const command = new GetObjectCommand(getParams);
    const { Body } = await s3.send(command);
    
    // Stream the S3 object data into a string
    let dataString = '';
    Body.on('data', (chunk) => dataString += chunk);
    Body.on('end', () => {
      res.json({ fileName: latestFileName, Content: dataString });
    });
  } catch (err) {
    res.status(500).json({ error: "Error retrieving data from S3.", details: err.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the app for testing purposes
module.exports = app;