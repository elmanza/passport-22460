const express = require('express');
let expressSession = require("express-session");
const app = express();
const PORT = 3000;
let path = require("path");
let passport = require("passport");
let twitterStrategy = require('passport-twitter').Strategy;
let usuarios = [];
const TWITTER_KEY = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const TWITTER_SECRET_KEY = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static(__dirname + "/public"));

app.set("views", path.join(__dirname, 'views', 'ejs'))
app.set('view engine', 'ejs');

passport.use(new twitterStrategy({
    consumerKey: TWITTER_KEY,
    consumerSecret:TWITTER_SECRET_KEY,
    callbackURL: '/auth/twitter/callback'
}, (token, tokenSecret, profile, done)=>{
    console.log(profile);
    done(null, profile);
}));



passport.serializeUser((user, done)=>{
    done(null, user);
})

passport.deserializeUser((obj, done)=>{
        done(null, obj);
})

app.use(expressSession({
    secret: "secret123",
    cookie:{
        httpOnly: false,
        secure: false,
        maxAge: 60000
    },
    resave:false,
    saveUninitialized:false
}))


app.use(passport.initialize());
app.use(passport.session());




let isAuth = (req, res, next) =>{
    if(req.isAuthenticated()){
       return next();
    }
    res.redirect('/login');
}

let isNotAuth = (req, res, next) =>{
    if(!req.isAuthenticated()){
        next();  
    }else{        
        res.redirect('/datos');
    }
}

app.get('/registro', isNotAuth, (req, res, next)=>{
    res.render('registro');
})

app.post('/registro', passport.authenticate('register', {failureRedirect: 'registro-error', successRedirect:'datos'}));

app.get('/', (req, res, next)=>{
    res.redirect('login');
})

app.get('/login',  (req, res, next)=>{
    res.render('login');
})

app.post('/login', passport.authenticate('login', {failureRedirect: 'registro', successRedirect:'datos'}));


app.get('/datos', isAuth, (req, res, next)=>{
    if(!req.user.contador){
        req.user.contador = 1
    }else{        
        req.user.contador++;
    }
    res.render('datos', {
        contador: req.user.contador,
        usuario: req.user
    });
})

app.get('/logout', (req, res, next)=>{
    req.session.destroy( err =>{
        if(err) res.send(JSON.stringify(err));
        res.redirect('login');
    })
})


app.get('/auth/twitter', passport.authenticate('twitter'));


app.get('/auth/twitter/callback', passport.authenticate('twitter', {
    failureRedirect: '/registro', successRedirect:'/datos'
}));


app.listen(PORT, (err) => {
    if (err) return console.log('error en listen server', err);
    console.log(`Server running on PORT ${PORT}`);
  });