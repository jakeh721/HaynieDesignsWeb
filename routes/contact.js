var express = require('express');
var router = express.Router();
var sendmail = require('sendmail')();

router.get('/', function(req, res, next) {
  res.render('pages/contact');
});

router.post('/send', function(req, res, next) {
  console.log(req.body);
  sendmail({
    from: 'contact@hayniedesigns.com',
    to: 'craighaynie@sbcglobal.net',
    subject: 'Contact Request',
    html: '<body><h3>Someone would like to contact you!</h3><p><b>Name: </b>' + req.body.name + '<br><b>Phone: </b>' + req.body.phone + '<br><b>Email: </b>' + req.body.email + '<br><b>Message: </b>' + req.body.message + '</p></body>',
  }, function(err, reply) {
    console.log(err && err.stack);
    console.dir(reply);
    res.send('ok');
  });
});

module.exports = router;