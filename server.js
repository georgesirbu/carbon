'use strict';

const globby = require('globby');
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const adaro = require('adaro');

const templateDirectories = [
  'html/**/header.html',
  'html/**/*.html',
  '!html/**/body.html'
];

// Used for allLinks() function
const directoryOrder = [
  'base-elements/**/*.html',
  'components/**/*.html',
  'global/**/*.html'
];

app.engine('dust', adaro.dust());
app.set('view engine', 'dust');
app.set('views', path.resolve(__dirname, 'demo/views'));
app.use(express.static('demo'));

const getContent = (glob) => {
  return globby(glob)
    .then(paths => {
      return paths
        .map(file => {
          return fs.readFileSync(file, { 'encoding': 'utf8' });
        })
        .reduce((a, b) => {
          return a.concat(b);
        });
    });
}

const allLinks = globby(directoryOrder)
  .then(paths => {
    return paths
      .map(path => {
        const indices = [];
        for (let i = 0; i < path.length; i++) {
          if (path[i] === '/') {
            indices.push(i);
          }
        }

        return path.slice(0, indices[1]);
      })
      .filter((path, index, paths) => {
        return paths.indexOf(path) === index;
      })
      .map(path => {
        return {
          url: path
        }
      })
  });


app.get('/', (req, res) => {
  Promise.all([getContent(templateDirectories), allLinks])
    .then(results => {

      res.render('demo-all', {
        content: results[0],
        links: results[1]
      });
    })
});

app.get('/components/:component', (req, res) => {
  const glob = `components/${req.params.component}/**/*.html`;

  Promise.all([getContent(glob), allLinks])
    .then(results => {
      res.render('demo-all', {
        content: results[0],
        links: results[1]
      });
    });
});

app.get('/base-elements/:component', (req, res) => {
  const glob = `base-elements/${req.params.component}/**/*.html`;

  Promise.all([getContent(glob), allLinks])
    .then(results => {
      res.render('demo-all', {
        content: results[0],
        links: results[1]
      });
    });
});

app.get('/global/:component', (req, res) => {
  const glob = `global/${req.params.component}/**/*.html`;

  Promise.all([getContent(glob), allLinks])
    .then(results => {
      res.render('demo-all', {
        content: results[0],
        links: results[1]
      });
    });
});

app.listen(8080);
