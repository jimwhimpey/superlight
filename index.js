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

	const pageSize = 5;

	assets.getPage(1, pageSize).then((photos) => {
		res.render('home', {
			photos: JSON.stringify(photos),
			pageSize: pageSize,
		});
	});

});

/**
 * The individual photo page
 */
app.get('/photo/:timestamp', (req, res) => {
	assets.getIndividual(req.params.timestamp).then((individualPhoto) => {
		res.render('permalink', { photo: JSON.stringify(individualPhoto) });
	});
});

/**
 * The photo fetching JSON api
 */
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
