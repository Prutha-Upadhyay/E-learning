const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const axios = require('axios');

const app = express();
const port = 5500;

app.use(bodyParser.json());

// Serve HTML file with form to enter YouTube video URL
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Listen for POST request to generate quiz
app.post('/fetch-transcript', async (req, res) => {
  const videoUrl = req.body.videoUrl;
  if (!videoUrl) {
    res.status(400).json({ error: 'YouTube video URL is required.' });
    return;
  }

  // Fetch transcript from YouTube API
  try {
    const transcriptText = await fetchTranscript(videoUrl);
    if (!transcriptText) {
      res.status(400).json({ error: 'Failed to fetch transcript.' });
      return;
    }

    // Call GPT-2 model to generate quiz questions using Python script
    const quizQuestions = await generateQuiz(transcriptText);
    res.json({ quizQuestions });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Function to fetch transcript text from YouTube video
async function fetchTranscript(videoUrl) {
  try {
    // Extract video ID from the URL (replace with your actual API key)
    const videoId = new URL(videoUrl).searchParams.get('v');
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=YOUR_ YOUTUBE_API_KEY`);
    const transcript = response.data.items[0].snippet.transcript;
    return transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
}

// Function to generate quiz questions using Python script
async function generateQuiz(transcriptText) {
  return new Promise((resolve, reject) => {
    exec(`python generate_quiz.py "${transcriptText}"`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }
      resolve(JSON.parse(stdout));
    });
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
