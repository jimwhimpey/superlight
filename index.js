const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

app.get('/photos/:page/:perpage', (req, res) => {

  fs.readdir('./assets', function(err, photos) {

    if (err) console.log(err);
    if (!photos) console.log('Empty dir');

    const sortedPhotos = photos.map(photo => ({
        name: photo,
        time: fs.statSync(`./assets/${photo}`).mtime.getTime()
      }))
      .sort(function(a, b) { return b.time - a.time; })
      .map(function(photo) { return photo.name; });

    const firstFileIndex = (req.params.page == 1) ? 0 : (req.params.page - 1) * req.params.perpage;
    const output = [];

    for (var i = firstFileIndex; i < req.params.perpage * req.params.page; i++) {
      if (!sortedPhotos[i] || sortedPhotos[i] === '.DS_Store') continue;
      output.push({
        path: sortedPhotos[i],
        title: sortedPhotos[i].replace(/\.jpg$/, ''),
        date: fs.statSync(`./assets/${sortedPhotos[i]}`).mtime.getTime()
      });
    }

    res.json(output);

  });

});

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/views/home.html`));
});

app.get('/assets/:photo', (req, res) => {
  res.sendFile(path.join(`${__dirname}/assets/${req.params.photo}`));
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))
