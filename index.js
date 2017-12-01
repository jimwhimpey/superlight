const express = require('express');
const mustacheExpress = require('mustache-express');
const sharp = require('sharp');
const sizeOf = require('image-size');
const app = express();
const fs = require('fs');
const path = require('path');

app.engine('mustache', mustacheExpress(__dirname + '/views/partials'));
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.get('/photos/:page/:perpage', (req, res) => {

  fs.readdir('./assets', function(err, photos) {

    if (err) console.log(err);
    if (!photos) console.log('Empty dir');

    const sortedPhotos = photos.map(photo => ({
        path: photo,
        title: photo.replace(/\.jpg$/, ''),
        date: fs.statSync(`./assets/${photo}`).mtime.getTime(),
        ratio: sizeOf(`./assets/${photo}`).width / sizeOf(`./assets/${photo}`).height,
      }))
      .sort(function(a, b) { return b.date - a.date; });

    const firstFileIndex = (req.params.page == 1) ? 0 : (req.params.page - 1) * req.params.perpage;
    const output = [];

    for (var i = firstFileIndex; i < req.params.perpage * req.params.page; i++) {
      if (!sortedPhotos[i]) continue;
      output.push(sortedPhotos[i]);
    }

    // Handle reaching the end
    if (output.length < req.params.perpage) output.push('atEnd');

    res.json(output);

  });

});

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

app.get('/', (req, res) => {
  res.render('home', {});
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
