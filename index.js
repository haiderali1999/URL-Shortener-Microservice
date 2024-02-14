const { MongoClient } = require("mongodb")
const express = require('express');
const urlparser = require("url")
const cors = require('cors');
require('dotenv').config();
const dns = require("dns");
const path = require("path");
const app = express();

const client = new MongoClient(process.env.DB_URL);
const db = client.db("urlshortner")
const urls = db.collection("urls")

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static(__dirname + '/public'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const { url } = req.body

  const { hostname } = urlparser.parse(url)
  dns.lookup(hostname, async (err, address) => {
    if (!address) {
      res.json({ error: "invalid url" })
    }
    else {
      const urlCount = await urls.countDocuments();
      const urlDoc = {
        url: url,
        shortUrl: urlCount
      }
      const result = await urls.insertOne(urlDoc)
      console.log(result);
      res.json({ original_url: url, short_url: urlCount })
    }
  })
})

app.get('/api/shorturl/:short_url', async (req, res) => {
  try {
    const { short_url } = req.params
    //convert string into integer with plus
    const urlDoc = await urls.findOne({ shortUrl: +short_url })
    res.redirect(urlDoc.url)
  } catch (error) {
    console.log(error)
  }

})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
