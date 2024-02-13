const { MongoClient } = require("mongodb")
const express = require('express');
const urlparser = require("url")
const cors = require('cors');
require('dotenv').config();
const net = require('net');
const dns = require("dns")
const app = express();

const client = new MongoClient(process.env.DB_URL);
const db = client.db("urlshortner")
const urls = db.collection("urls")

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const { url } = req.body
  const ip6Option = {
    family: 6,
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
  };
  console.log(url)
  debugger
  // const { port, hostname } = new URL(url)
  const { hostname } = urlparser.parse(url)
  dns.lookup(hostname, async (err, address) => {
    if (err) {
      res.json({ error: "Invalid Url" })
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

  // dns.lookup(hostname, ip6Option, (err, address, family) => {
  //   if (err) {
  //     res.json({ "error": "Invalid URL" })
  //   }
  //   else {

  //     const socket = new net.Socket();
  //     socket.setTimeout(5000); // set a timeout in milliseconds

  //     socket.on('connect', () => {
  //       console.log(`Connection to ${address}:${port} successful.`);
  //       const shorUrlGenerate = (url) => {
  //         let shortUrl = 0;
  //         for (let key in url) {
  //           shortUrl += key.charCodeAt();
  //         }
  //         return shortUrl
  //       }
  //       const short_url = shorUrlGenerate(url)
  //       res.json({ original_url: url, short_url: short_url })
  //       socket.end();
  //     });

  //     socket.on('timeout', () => {
  //       console.error(`Connection to ${address}:${port} timed out.`);
  //       socket.destroy();
  //     });

  //     socket.on('error', (error) => {
  //       console.error(`Error connecting to ${address}:${port}:`, error);
  //       socket.destroy();
  //     });

  //     socket.connect(port, address);


  //   }
  //   // console.log('address: %j family: IPv%s', address, family)
  // })

})

app.get('/api/shorturl/:short_url', async (req, res) => {
  debugger
  try {
    const { short_url } = req.params
    //convert string into integer with plus
    const urlDoc = await urls.findOne({shortUrl:+short_url})
    res.redirect(urlDoc.url)
  } catch (error) {
    console.log(error)
  }

})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
