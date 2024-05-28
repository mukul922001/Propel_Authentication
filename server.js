const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('./config/database')


// Initialize express app settings
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Initialize express session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy
passport.use(new LocalStrategy(
    function (username, password, done) {
        try {

            if (!username || !password) {
                return done(null, false, { message: 'Userid and Password are required' })
               
              }
          
              const query = 'SELECT * FROM Propel_Users WHERE Userid = ?';
              db.query(query, [username], async (err, results) => {
                if (err) {
                    return done(null, false, { message: 'Error logging in: ' + err.message })
          
                }
                if (results.length === 0) {
                    return done(null, false, { message: 'Invalid Userid or Password' })
                
                }
    
                const user = results[0];
                const validPassword = await bcrypt.compare(password, user.Password);
                if (!validPassword) {
                    return done(null, false, { message: 'Incorrect password.' })
                }
                else{
                    return done(null, user);
                }
              });
           
        } catch (error) {
            return done(error);
        }
    }
));

// Serialize user
passport.serializeUser(function (user, done) {
  var storedUser = {"Userid":user.Userid,"Email":user.Email,"Mobile":user.Mobile,"userType":user.userType};
    done(null, storedUser); 
});

// Deserialize user
passport.deserializeUser(function (storedUser, done) {

      done(null,storedUser);


   
});

function checkUserType(req, res, next) {
    // Assuming user object is available in req.user after authentication
    if (req.isAuthenticated() && req.user && req.user.userType === 0) {
        // If usertype is 0, allow access to the next middleware
        return next();
    } else {
        // If usertype is not 0, deny access and redirect to login page
        res.redirect('/login');
    }
}

// Routes
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/login', passport.authenticate('local', { successRedirect: '/protected', failureRedirect: '/login' }));

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

app.post('/register', async (req, res) => {
  const { first_name, last_name, Userid, Password, Email, Mobile,userType } = req.body;

  if (!Userid || !Password) {
    return res.status(400).send('Userid and Password are required');
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    const query = `
      INSERT INTO Propel_Users (first_name, last_name, Userid, Password, Salt,userType, Email, Mobile)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `;
    db.query(query, [first_name, last_name, Userid, hashedPassword, salt,userType, Email, Mobile], (err, result) => {
      if (err) {
        return res.status(500).send('Error signing up: ' + err.message);
      }
      const user = { uid: result.insertId, Userid, userType: 0 }; // Assuming default userType as 0
      //const token = generateToken(user);
      res.status(201).json({ message: 'User signed up successfully',user});
    });
  } catch (err) {
    res.status(500).send('Error signing up: ' + err.message);
  }
});

app.get('/protected', checkUserType,(req, res) => {
    if (req.isAuthenticated()) {
        res.send("Protected");
    } else {
        res.status(401).send({ msg: "Unauthorized" });
    }
});

app.listen(5000, () => {
    console.log("Listening to port 5000");
});
