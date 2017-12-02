const express = require('express');
const mustacheExpress = require('mustache-express');
const sharp = require('sharp');
const sizeOf = require('image-size');
const assets = require('./assets.js');
const app = express();
const fs = require('fs');
const path = require('path');

app.engine('mustache', mustacheExpress(__dirname + '/views/partials'));
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

/**
 * The home page
 */
app.get('/', (req, res) => {
  res.render('home', {});
});

/**
 * The individual photo page
 */
app.get('/photo/:timestamp', (req, res) => {

  fs.readdir('./assets', function(err, photos) {

    let individualPhoto = '';

    photos.forEach(photo => {
      if (fs.statSync(`./assets/${photo}`).mtime.getTime() == req.params.timestamp) {
        individualPhoto = {
          path: photo,
          title: photo.replace(/\.jpg$/, ''),
          date: fs.statSync(`./assets/${photo}`).mtime.getTime(),
          ratio: sizeOf(`./assets/${photo}`).width / sizeOf(`./assets/${photo}`).height,
        };
      }
    });

    res.render('permalink', { photo: JSON.stringify(individualPhoto) });

  });

});

app.get('/photos/:page/:perpage', (req, res) => {

  assets.getPage(req.params.page, req.params.perpage).then((photos) => {
    // Handle reaching the end
    if (photos.length < req.params.perpage) photos.push('atEnd');
    res.json(photos);
  });

});

app.get('/superlight.css', (req, res) => {
  res.sendFile(path.join(`${__dirname}/views/superlight.css`));
});

app.get('/assets/:photo', (req, res) => {
  sharp(path.join(`${__dirname}/assets/${req.params.photo}`))
    .resize(parseInt(req.query.w, 10))
    .toBuffer().then(data => res.end(data, 'binary'));
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))
