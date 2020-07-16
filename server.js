const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.resolve('dist', 'statics'), { extensions: ['html'] }));

app.listen(8080);
console.log('listening on http://localhost:8080')