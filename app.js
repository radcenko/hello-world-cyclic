const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

// Handling POST request to the root URL
app.post('/', (req, res) => {
  // Access the data sent in the request
  const data = req.body;

  // Process the data (this is just an example)
  const responseMessage = `Received data: ${JSON.stringify(data)}`;

  // Send a response back to the client
  res.json({ message: responseMessage });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // For testing purposes


// const express = require('express');
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