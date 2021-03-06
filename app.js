require('dotenv').config();
const bodyParser = require('body-parser');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const session = require('express-session');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/user');
const signupRouter = require('./routes/signup');
const loginRouter = require('./routes/login');
const perfilRouter = require('./routes/perfil');
const logoutRouter = require('./routes/logout');
const User = require('./models/user');
const taskRouter = require('./routes/task');

const app = express();

// mongo database setup
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: '${x.connections[0].name}'`
    );
  })
  .catch(err => {
    console.error('Error connecting to mongo', err);
  });

// session setup
app.use(
  session({
    secret: 'senha',
    cookie: { maxAge: 1200000 },
    resave: true,
    saveUninitialized: true
  })
);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public/img')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// setup passaport
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});
passport.deserializeUser((id, cb) => {
  User.findById(id, (err, user) => {
    if (err) {
      return cb(err);
    }
    cb(null, user);
  });
});

// Setup login e signup strategy
passport.use(
  'local-login',
  new LocalStrategy((username, password, next) => {
    User.findOne({ username }, (err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(null, false);
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return next(null, false);
      }
      return next(null, user);
    });
  }),
);

passport.use(
  'local-signup',
  new LocalStrategy(
    { passReqToCallback: true },
    (req, username, password, next) => {
      // To avoid race conditions
      console.log(req.body);

      User.findOne(
        {
          username: username
        },
        (err, user) => {
          if (err) {
            return next(err);
          }
          if (user) {
            return next(null, false);
          } else {
            // Destructure the body
            const { username, email, password } = req.body;
            const hashPass = bcrypt.hashSync(
              password,
              bcrypt.genSaltSync(8),
              null
            );
            const newUser = new User({
              username,
              email,
              password: hashPass
            });
            newUser.save(err => {
              if (err) {
                next(null, false);
              }
              return next(null, newUser);
            });
          }
        }
      );
      //});
    }
  )
);

//inicialization passaport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// router
app.use('/', indexRouter);
app.use('/task', taskRouter);
app.use('/users', usersRouter);
app.use('/signup', signupRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/perfil', perfilRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});
// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
