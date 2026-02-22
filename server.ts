import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { CommonEngine } from '@angular/ssr/node';
import bootstrap from './src/main.server';

const app = express();
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtml = join(serverDistFolder, 'index.server.html');
const engine = new CommonEngine();

app.set('view engine', 'html');
app.set('views', browserDistFolder);

app.get('*.*', express.static(browserDistFolder, { maxAge: '1y' }));

app.get('*', (req, res, next) => {
  engine
    .render({
      bootstrap,
      documentFilePath: indexHtml,
      url: req.originalUrl,
      publicPath: browserDistFolder
    })
    .then((html) => res.send(html))
    .catch((err) => next(err));
});

const port = process.env['PORT'] ?? 4000;
app.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});
