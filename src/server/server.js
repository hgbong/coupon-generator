import express from 'express';
import path from 'path';
import open from 'open';
import webpack from 'webpack';
import bodyParser from 'body-parser';
import config from '../../webpack.config.dev';


const port = 2224;
const app = express();
const compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../resources/index.html'));
});
const route = require('./routes.js');

app.use('/', route);

app.listen(port, (error) => {
  if (error) {
    console.log(error);
  } else {
    console.log('Server is opened at http://172.21.111.203:' + port);
  }
});
