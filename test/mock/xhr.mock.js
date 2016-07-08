var mocks = mocks || {};

mocks.xhr = require('xhr-mock');

mocks.xhr.setup();


mock.get('http://localhost/test', function(req, res) {

  //return null;              //simulate an error
  //return res.timeout(true); //simulate a timeout
  console.log('OKOK0')

  return res
    .status(201)
    .header('Content-Type', 'application/json')
    .body(JSON.stringify({"hello": "world"}))
  ;

});