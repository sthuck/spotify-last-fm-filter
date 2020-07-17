const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.resolve('dist'), { extensions: ['html', 'js'] }));

app.listen(8080);
console.log('listening on http://localhost:8080')