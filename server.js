var express = require('express');
var everyauth = require('everyauth')
  , Promise = everyauth.Promise;
var fs = require('fs');
var s3_conf = require('./s3_conf')
  , s3client = require('knox').createClient({
   key: s3_conf.accessKeyId
  ,secret: s3_conf.secretAccessKey
  ,bucket: s3_conf.bucket
});

everyauth.debug = true;

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = mongoose.SchemaTypes.ObjectId;

var Theater = require('./models/theaterSchema.js')
   ,Fl = require('./models/fileSchema.js')
   ,Distributor = require('./models/distributorSchema.js')
   ,Option = require('./models/optionSchema.js')
   ,Movie = require('./models/movieSchema.js')
   ,Shift = require('./models/shiftSchema.js');
var UserSchema = new Schema({})
  , User;

var mongooseAuth = require('index');


UserSchema.plugin(mongooseAuth, {
    everymodule: {
      everyauth: {
          User: function () {
            return User;
          }
      }
    }
  , password: {
        loginWith: 'email'
      , extraParams: {
            company: String
          , role: String
          , name: {
                first: String
              , last: String
            }
        }
      , everyauth: {
            loginFormFieldName: 'email'
          , passwordFormFieldName: 'password'
          , getLoginPath: '/login'
          , postLoginPath: '/login'
          , loginView: 'login.ejs'
          , getRegisterPath: '/register'
          , postRegisterPath: '/register'
          , registerView: 'register.ejs'
          , loginSuccessRedirect: '/'
          , registerSuccessRedirect: '/'
        }
    }
});
// Adds login: String

mongoose.model('Manager', UserSchema);

mongoose.connect('mongodb://176.32.90.191/dreampass');

User = mongoose.model('Manager');

var app = express.createServer(
    express.bodyParser({keepExtensions: true,uploadDir: './public/images'})
  , express.logger()
  , express.static(__dirname + "/public")
  , express.cookieParser()
  , express.session({ secret: 'dreampass'})
  , mongooseAuth.middleware()
);

app.configure( function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.set('view options',{layout: false});
});

app.get('/', function (req, res) {
  res.render('index',{status: req.loggedIn});
});

app.get('/movie_in', function(req,res){
  Distributor.find({},function(err,dist){
    if (err){
      res.send('DBエラー' + err);
      console.log(new Date() + ' ERROR distributor ' + err);
    } else{
      res.render('movie_in',{distribution: dist});
    }
  });
});

app.post('/movie_in', function(req,res){
  Movie.findOne({name: req.body.title},function(err,docs){
    if (!docs){
      var movie = new Movie(req.body);
      if (req.files.title_image.size != 0){
        var fl1 = new Fl(req.files.title_image);
        fl1.save(function(err){
          if (err){
            console.log(new Date() + ' ERROR MongoDB' + err);
            res.send('ERROR MongoDB: ' + err);
          }else{
            console.log(new Date() + ' INFO Saved:' + JSON.stringify(req.files.title_image));
            fs.readFile(req.files.title_image.path, function(err,buf){
              var request = s3client.put('/'+req.files.title_image.path,{
                  'Content-Length': buf.length
                , 'Content-Type': 'req.files.title_image.type'
              });
              request.on('response',function(res){
                if (200 == res.statusCode){
                  console.log('Uploaded to mazon S3 /' + req.files.title_image.path);
                  //  fs.rm(req.files.title_image.path);
                } else {
                  console.log('Failed to upload file to Amazon S3　/' + req.files.title_image.path);
                }
              });
              request.end(buf);
            });
          }
        });
        movie.title_image = {"_id": fl1._id
                            ,"path": s3_conf.header + req.files.title_image.path
                            ,"size":req.files.title_image.size};
      };
      if (req.files.trailer.size != 0){
        var fl2 = new Fl(req.files.trailer);
        fl2.save(function(err){
          if (err){
            console.log(new Date() + ' ERROR MongoDB' + err);
            res.send('ERROR MongoDB: ' + err);
          }else{
            console.log(new Date() + ' INFO Saved:' + JSON.stringify(req.files.trailer));
            fs.readFile(req.files.trailer.path, function(err,buf){
              var request = s3client.put('/'+req.files.trailer.path,{
                  'Content-Length': buf.length
                , 'Content-Type': 'req.files.trailer.type'
              });
              request.on('response',function(res){
                if (200 == res.statusCode){
                  console.log('Uploaded to mazon S3 /' + req.files.trailer.path);
                  //  fs.rm(req.files.trailer.path);
                } else {
                  console.log('Failed to upload file to Amazon S3　/' + req.files.trailer.path);
                }
              });
              request.end(buf);
            });
          }
        });
      };
      movie.save(function(err){
        if (err){
          console.log(new Date() + ' ERROR MongoDB' + err);
          res.send('ERROR MongoDB: ' + err);
        }else{
          console.log(new Date() + ' INFO Saved:' + JSON.stringify(req.body));
        }
      });
      res.redirect('/movie_in');
    } else {
      res.send('二重登録エラー: ' + req.body.title);
    }
  });
});

app.get('/theater_in', function(req,res){
  Theater.find({},function(err,theat){
    if (err){
      res.send('DBエラー' + err);
      console.log(new Date() + ' ERROR theater ' + err);
    }
    Option.find({},function(err,op){
      if (err){
        res.send('DBエラー' + err);
        console.log(new Date() + ' ERROR option ' + err);
      }
      res.render('theater_in',{theater: theat,option: op});
    });
  });
});

app.post('/theater_in', function(req,res){
  var shift = new Shift(req.body);
  shift.save(function(err){
    if (err){
      console.log(new Date() + ' ERROR MongoDB' + err);
      res.send('ERROR MongoDB: ' + err);
    }else{
      console.log(new Date() + ' INFO Saved:' + JSON.stringify(req.body));
    }
  });
  res.redirect('/theater_in');
});

app.get('/distributor', function(req,res){
  res.render('distributor');
});

app.post('/distributor',function(req,res){
  Distributor.findOne({name:req.body.name},function(err,distributor){
    if (!distributor){
      var dist = new Distributor(req.body);
      dist.save(function(err){
        if (err){
          console.log(new Date() + ' ERROR MongoDB' + err);
          res.send('ERROR MongoDB: ' + err);
        }else{
          console.log(new Date() + ' INFO Saved:' + req.body.name);
        }
      });
      res.redirect('/distributor');
    } else {
      res.send('二重登録エラー: ' + distributor.name);
      console.log(new Date() + ' ERROR 二重登録： ' + distributor);
    }
  });
});

app.get('/theater', function(req,res){
 res.render('theater');
});

app.post('/theater',function(req,res){
  Theater.findOne({name:req.body.name},function(err,theater){
    if (!theater){
      var fl = new Fl(req.files.icon);
      fl.save(function(err){
        if (err){
          console.log(new Date() + ' ERROR MongoDB' + err);
          res.send('ERROR MongoDB: ' + err);
        }else{
          console.log(new Date() + ' INFO Saved:' + JSON.stringify(req.files.icon));
          fs.readFile(req.files.icon.path, function(err,buf){
            var request = s3client.put('/'+req.files.icon.path,{
                'Content-Length': buf.length
              , 'Content-Type': 'req.files.icon.type'
            });
            request.on('response',function(res){
              if (200 == res.statusCode){
                console.log('Uploaded to mazon S3 /' + req.files.icon.path);
                //  fs.rm(req.files.icon.path);
              } else {
                console.log('Failed to upload file to Amazon S3 /' + req.files.icon.path);
              }
            });
            request.end(buf);
          });
        }
      });
      var thea = new Theater(req.body);
      thea.file = {"_id": fl._id,"path": s3_conf.header + req.files.icon.path,"size": req.files.icon.size};
      thea.save(function(err){
        if (err){
          console.log(new Date() + ' ERROR MongoDB' + err);
          res.send('ERROR MongoDB: ' + err);
        }else{
          console.log(new Date() + ' INFO Saved:' + req.body.name);
        }
      });
      res.redirect('/theater');
    }else{
      res.send('二重登録エラー: ' + theater.name);
    }
  });
});

app.get('/option', function(req,res){
  res.render('option');
});

app.post('/option', function(req,res){
  Option.findOne({name: req.body.name},function(err,option){
    if (!option){
      var fl = new Fl(req.files.icon);
      fl.save(function(err){
        if (err){
          console.log(new Date() + ' ERROR MongoDB' + err);
          res.send('ERROR MongoDB: ' + err);
        }else{
          console.log(new Date() + ' INFO Saved:' + JSON.stringify(req.files.icon));
          fs.readFile(req.files.icon.path, function(err,buf){
            var request = s3client.put('/'+req.files.icon.path,{
                'Content-Length': buf.length
              , 'Content-Type': 'req.file.icon.type'
            });
            request.on('response',function(res){
              if (200 == res.statusCode){
                console.log('Uploaded to mazon S3: /' + req.files.icon.path);
              //  fs.rm(req.files.icon.path);
              } else { console.log('Failed to upload file to Amazon S3'); }
            });
            request.end(buf);
          });
        }
      });

      var op = new Option(req.body);
      op.info = { "_id": fl._id,"path": s3_conf.header + req.files.icon.path, "size": req.files.icon.size};
      op.save(function(err){
        if (err){
          console.log(new Date() + ' ERROR MongoDB' + err);
          res.send('ERROR MongoDB: ' + err);
        }else{
          console.log(new Date() + ' INFO Saved:' + JSON.stringify(req.body));
        }
      });
      res.redirect('/option');
    } else {
      res.send('二重登録エラー: ' + option.name);
    }
  });
});

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

mongooseAuth.helpExpress(app);

app.listen(8080);
