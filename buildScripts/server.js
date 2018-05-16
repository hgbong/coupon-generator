import express from 'express';
import path from 'path';
import open from 'open';
import config from '../webpack.config.dev';
import webpack from 'webpack';
import bodyParser from 'body-parser';


const port = 2223;
const app = express();
const compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../src/index.html'));
});

const route = require('./module/module.js');
app.use('/', route);


app.listen(port, function (error) {
  if (error) {
    console.log(error);
  } else {
    console.log('Server is opened at http://172.21.111.203:' + port);
  }
});