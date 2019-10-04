const express = require('express');
const morgan = require('morgan');
var AWSXRay = require('aws-xray-sdk');

const app = express();

app.use(morgan('tiny'));

app.use(AWSXRay.express.openSegment('CDKMicroservices'));

app.get('/', async function(req, res) {
	res.send('Here is your microservice response yo!');
});

console.log('API inside XRay segment');

app.use(AWSXRay.express.closeSegment());

app.listen(process.env.PORT || 80);

console.log('API alive yo');
