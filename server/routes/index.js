const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");
const xhbs = require('express-handlebars');
const path = require('path')

const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.G_CLIENT_ID, // ClientID
  process.env.G_CLIENT_SECRET, // Client Secret
  "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
  refresh_token: process.env.G_REFRESH_TOKEN
});
const accessToken = oauth2Client.getAccessToken()


const PATH_VIEWS = path.join(__dirname, '../views')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


/* GET home page. */
router.post('/email', function (req, res, next) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  })

  // send mail with defined transport object
  let mailOptions = {
    from: '"Admin 👻" <alexmayorga.web@gmail.com>', // sender address
    to: "alexander.mayorga.m@gmail.com", // list of receivers
    subject: "Email Templating", // Subject line
    text: "Hello world???", // plain text body
    html: "<b>Hello world?</b>" // html body
  };

  transporter.sendMail(mailOptions,(err,info)=>{
    if(err) return res.status(404).end('Email couldnt be sent')
    res.status(200).send('Email was sent! :)')
  })

});

/* Return a compiled Handlebars template */
router.get('/hbs', function (req, res, next) {
  const hbs = xhbs.create({
    defaultLayout: 'email',
    partialsDir: __dirname + '/views/partials'
  });

  hbs.render(path.join(__dirname, '../views/email-content.hbs'), {
    myFiles: "req.filesInfo"
  })
  .then(template => {
    res.status(200).json({ template })
  })
  .catch(err => {
    //Handle Error
    console.log(err)
    res.status(404).end('An Error Happened :(')
  })
});

/* GET home page. */
router.post('/email-template', function (req, res, next) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      clientId: process.env.G_CLIENT_ID,
      clientSecret: process.env.G_CLIENT_SECRET,
      refreshToken: process.env.G_REFRESH_TOKEN,
      accessToken
    }
  })

  const hbs = xhbs.create({
    defaultLayout: 'email'
  });
  
  hbs.render(`${PATH_VIEWS}/email-content.hbs`, {
    name: "Miles"
  })
    .then(template => {

      // send mail with defined transport object
      let mailOptions = {
        from: '"Admin 👻" <alexmayorga.web@gmail.com>', // sender address
        to: "alexander.mayorga.m@gmail.com", // list of receivers
        subject: "oAuth - Email Templating with Params", // Subject line
        text: "oAuth - Email with HBS Template and Params", // plain text body
        html: template // html body
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) return res.status(404).end('Email couldnt be sent')
        res.status(200).send('Email was sent! :)')
      })
    })
    .catch(err => {
      //Handle Error
      console.log(err)
      res.status(404).end('An Error Happened with HBS compiling :(')
    })

});


module.exports = router;
