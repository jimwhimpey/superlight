const express = require('express');
const mustacheExpress = require('mustache-express');
const sharp = require('sharp');
const sizeOf = require('image-size');
const assets = require('./assets.js');
const hypercolor = require('./hypercolor.js');
const app = express();
const fs = require('fs');
const path = require('path');

app.engine('mustache', mustacheExpress(__dirname + '/views/partials'));
app.use(express.static('public'));
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
			hypercolor: hypercolor(),
			unfurlTitle: photos[0].title,
			unfurlImage: `http://superlight.jimwhimpey.com/assets/${photos[0].path}?w=1000`,
		});
	});

});

/**
 * The individual photo page
 */
app.get('/photo/:timestamp', (req, res) => {
	assets.getIndividual(req.params.timestamp).then((individualPhoto) => {
		res.render('permalink', {
			photo: JSON.stringify(individualPhoto),
			hypercolor: hypercolor(),
			unfurlTitle: individualPhoto.title,
			unfurlImage: `http://superlight.jimwhimpey.com/assets/${individualPhoto.path}?w=1000`,
		});
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

/**
 * JSON feed
 */
app.get('/feed.json', (req, res) => {

	const feed = {
		"version": "https://jsonfeed.org/version/1",
		"title": "Superlight",
		"home_page_url": "http://superlight.jimwhimpey.com/",
		"feed_url": "http://superlight.jimwhimpey.com/feed.json",
		"icon": "http://superlight.jimwhimpey.com/apple-touch-icon.png",
		"author": {
			"name": "Jim Whimpey",
			"url": "http://jimwhimpey.com",
		},
	};

	// The latest 20 items
	assets.getPage(1, 20).then((photos) => {

		// Get it in a format appropriate for JSON feed
		feed.items = photos.map(photo => {
			return {
				id: photo.date,
				url: `http://superlight.jimwhimpey.com/photo/${photo.date}`,
				content_html: `<p><a href='http://superlight.jimwhimpey.com/photo/${photo.date}'><img src='http://superlight.jimwhimpey.com/assets/${photo.path}?w=1000'></a></p><p>${photo.title}`,
				summary: photo.title,
				image: `http://superlight.jimwhimpey.com/assets/${photo.path}?w=1000`,
			};
		});

		res.json(feed);
	});

});

app.get('/assets/:photo', (req, res) => {
	sharp(path.join(`${__dirname}/assets/${req.params.photo}`))
		.resize(parseInt(req.query.w, 10))
		.toBuffer().then(data => res.end(data, 'binary'));
});

app.listen(3000, () => console.log('Example app listening on port 3000!'))
