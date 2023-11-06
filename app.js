require('dotenv').config(); // Make sure this line is at the top of the file

const express = require('express');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS with environment variables from .env file
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken: process.env.AWS_SESSION_TOKEN, // Include if you have a session token
  region: process.env.AWS_REGION
});

// Create an S3 service object
const s3 = new AWS.S3();

const app = express();
const PORT = process.env.PORT || 3000;
const BUCKET_NAME = process.env.CYCLIC_BUCKET_NAME; // Use the Cyclic bucket name from .env

// Middleware to parse JSON bodies
app.use(express.json());

// POST handler to save text to S3
app.post('/', (req, res) => {
  const { Content } = req.body;
  const fileName = uuidv4(); // Create a unique file name

  // Parameters for S3 upload
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: Content
  };

  // Upload text to S3
  s3.upload(params, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error uploading data to S3." });
    }
    res.json({ message: 'Text saved successfully', fileUrl: data.Location });
  });
});

// GET handler to retrieve text from S3
app.get('/', (req, res) => {
  // For simplicity, the file name is fixed. In a real app, you'd have a way to determine this.
  const fileName = 'the-name-of-your-file';

  // Parameters to get the file from S3
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName
  };

  // Retrieve text from S3
  s3.getObject(params, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error retrieving data from S3." });
    }
    res.json({ Content: data.Body.toString() });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the app for testing purposes
module.exports = app;

// const app = express();
// const PORT = process.env.PORT || 3000;

// app.get('/', (req, res) => {
//   res.json({ message: 'Hello World' });
// });

// app.post('/', (req, res) => {

// })

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// module.exports = app; // For testing purposes