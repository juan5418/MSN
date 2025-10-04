const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = path.join(__dirname, 'data', 'news.json');

// Lire les news depuis le fichier
function readNews() {
  try {
    const s = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(s);
  } catch (err) {
    console.error('Erreur lecture news:', err);
    return [];
  }
}

// Écrire les news dans le fichier
function writeNews(newsArray) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(newsArray, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erreur écriture news:', err);
  }
}

// API : obtenir toutes les news
app.get('/api/news', (req, res) => {
  const news = readNews();
  res.json(news);
});

// API : créer une nouvelle news normale
app.post('/api/news', (req, res) => {
  const { title, summary, content, imageUrl, tags, imageUrl2 } = req.body;
  const news = readNews();
  const newItem = {
    id: Date.now().toString(),
    title,
    summary,
    content,
    imageUrl,
    imageUrl2: imageUrl2 || null,
    tags: tags || [],
    date: new Date().toISOString(),
    type: 'normal'
  };
  news.unshift(newItem);
  writeNews(news);
  res.status(201).json(newItem);
});

// API : créer une breaking news
app.post('/api/breaking', (req, res) => {
  const { title, summary } = req.body;
  const news = readNews();
  const newItem = {
    id: Date.now().toString(),
    title,
    summary,
    content: '',
    imageUrl: null,
    tags: [],
    date: new Date().toISOString(),
    type: 'breaking'
  };
  news.unshift(newItem);
  writeNews(news);
  res.status(201).json(newItem);
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
