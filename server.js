const express = require('express');

const app = express();
const path = require('path');

app.use('/dist', express.static('./dist'));

app.get('*', (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(path.join(path.resolve(__dirname, 'dist/index.html')));
});
app.listen(3001, () => {
    console.log('app listening on port 3001!');
});
