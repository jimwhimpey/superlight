const express = require('express');
const sharp = require('sharp');
const app = express();
const fs = require('fs');
const path = require('path');

app.get('/photos/:page/:perpage', (req, res) => {

  fs.readdir('./assets', function(err, photos) {

    if (err) console.log(err);
    if (!photos) console.log('Empty dir');

    const sortedPhotos = photos.map(photo => ({
        path: photo,
        title: photo.replace(/\.jpg$/, ''),
        date: fs.statSync(`./assets/${photo}`).mtime.getTime()
      }))
      .sort(function(a, b) { return b.date - a.date; });

    const firstFileIndex = (req.params.page == 1) ? 0 : (req.params.page - 1) * req.params.perpage;
    const output = [];

    for (var i = firstFileIndex; i < req.params.perpage * req.params.page; i++) {
      if (!sortedPhotos[i] || sortedPhotos[i].title === '.DS_Store') continue;
      output.push(sortedPhotos[i]);
    }

    res.json(output);

  });

});

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/views/home.html`));
});

app.get('/assets/:photo', (req, res) => {
  sharp(path.join(`${__dirname}/assets/${req.params.photo}`))
    .resize(parseInt(req.query.w, 10))
    .toBuffer().then(data => res.end(data, 'binary'));
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))
