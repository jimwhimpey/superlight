const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

app.get('/photos/:page/:perpage', (req, res) => {

  fs.readdir('./photos', function(err, photos) {

    if (err) console.log(err);
    if (!photos) console.log('Empty dir');

    const firstfile = (req.params.page == 1) ? 0 : (req.params.page - 1) * req.params.perpage;
    const output = [];

    for (var i = firstfile; i < req.params.perpage * req.params.page; i++) {
      if (!photos[i]) continue;
      output.push(photos[i]);
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
