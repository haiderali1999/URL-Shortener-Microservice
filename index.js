require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require("dns")
var bodyParser = require('body-parser')

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

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
  const hostname = new URL(url).hostname;

  dns.lookup(hostname, ip6Option, (err, address, family) => {
    if (err) {
      res.json({ "error": "Invalid URL" })
    }
    else {
      const short_url = Math.random().toString(36).substring(2, 8)
      res.json({ original_url: url, short_url: short_url })
    }
    // console.log('address: %j family: IPv%s', address, family)
  })

})

app.get('/api/shorturl/:id', (req, res) => {
  debugger
  const { baseUrl,url } = req

  res.redirect(url)
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
