const fs = require('fs');
const sizeOf = require('image-size');

/**
 * Returns a page of photos from the directory
 * @param {Number} page which page
 * @param {Number} perPage how many per page
 * @return {Promise} promise of photo objects
 */
module.exports = {

  getPage: function(page, perPage) {

    return new Promise((resolve, reject) => {

      fs.readdir('./assets', function(err, photos) {

        if (err) reject(err);
        if (!photos) reject('Empty dir');

        const sortedPhotos = photos.map(photo => ({
            path: photo,
            title: photo.replace(/\.jpg$/, ''),
            date: fs.statSync(`./assets/${photo}`).mtime.getTime(),
            ratio: sizeOf(`./assets/${photo}`).width / sizeOf(`./assets/${photo}`).height,
          }))
          .sort(function(a, b) { return b.date - a.date; });

        const firstFileIndex = (page == 1) ? 0 : (page - 1) * perPage;
        const output = [];

        for (var i = firstFileIndex; i < perPage * page; i++) {
          if (!sortedPhotos[i]) continue;
          output.push(sortedPhotos[i]);
        }

        resolve(output);

      });

    });

  },

  /**
   * Loops through the asset directory until it finds a matching
   * timestamp and then returns it.
   * @param {Number} timestamp the timestamp of the photo we're returning
   * @return {Promise} promise of that individual photo
   */
  getIndividual: function(timestamp) {

    return new Promise((resolve, reject) => {

      fs.readdir('./assets', function(err, photos) {

        let individualPhoto = '';

        photos.forEach(photo => {
          if (fs.statSync(`./assets/${photo}`).mtime.getTime() == timestamp) {
            individualPhoto = {
              path: photo,
              title: photo.replace(/\.jpg$/, ''),
              date: fs.statSync(`./assets/${photo}`).mtime.getTime(),
              ratio: sizeOf(`./assets/${photo}`).width / sizeOf(`./assets/${photo}`).height,
            };
          }
        });

        resolve(individualPhoto);

      });

    });

  },

};
