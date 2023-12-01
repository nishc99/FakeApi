const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const app = express();
const PORT = process.env.PORT || 5000;
const postsFilePath = path.join(__dirname, 'public', 'posts.json');

app.use(express.json()); // Enable JSON parsing middleware

app.use(express.static(path.join(__dirname, 'public')));

// Define a route for GET /posts
app.get('/posts', async (req, res) => {
  try {
    // Read the JSON data from the public folder
    const jsonData = await readJsonData(postsFilePath);
    res.json(jsonData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define a route for POST /posts
app.post('/posts', async (req, res) => {
  try {
    const jsonData = await readJsonData(postsFilePath);
    const newPost = req.body;
    newPost.id = jsonData.length + 1; // Assign a new ID
    jsonData.push(newPost);
    await writeJsonData(postsFilePath, jsonData);
    res.json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define a route for PUT /posts/:id
app.put('/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const jsonData = await readJsonData(postsFilePath);
    const updatedPostIndex = jsonData.findIndex(post => post.id === postId);
    
    if (updatedPostIndex === -1) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const updatedPost = { ...jsonData[updatedPostIndex], ...req.body };
    jsonData[updatedPostIndex] = updatedPost;
    await writeJsonData(postsFilePath, jsonData);
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Define a route for DELETE /posts/:id
app.delete('/posts/:id', async (req, res) => {
  try {
    const postId = parseInt(req.params.id);
    const jsonData = await readJsonData(postsFilePath);
    const updatedJsonData = jsonData.filter(post => post.id !== postId);
    await writeJsonData(postsFilePath, updatedJsonData);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Helper function to read JSON data from a file
async function readJsonData(filePath) {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

// Helper function to write JSON data to a file
async function writeJsonData(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
