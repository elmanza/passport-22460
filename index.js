const express = require('express');
let expressSession = require("express-session");
const app = express();
const PORT = 3000;
let path = require("path");
let passport = require("passport");
let passportStrategy = require('passport-local').Strategy;
let usuarios = [];

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static(__dirname + "/public"));

app.set("views", path.join(__dirname, 'views', 'ejs'))
app.set('view engine', 'ejs');

passport.use('login', new passportStrategy((username, password, done)=>{
    let user = usuarios.find( usuario => usuario.username == username);

    if(!user) return done(null, false);

    if(user.password != password) return done(null, false);

    user.contador = 0;

    return done(null, user);
}));

passport.use('register', new passportStrategy({
    passReqToCallback: true
},(req, username, password, done)=>{
    let { direccion } = req.body;

    let userfind = usuarios.find( usuario => usuario.username == username);

    if(userfind) return done("Already redistered!");

    let user = {
        username,
        password,
        direccion
    }
    usuarios.push(user);

    return done(null, user);

}));

passport.serializeUser((user, done)=>{
    done(null, user.username);
})

passport.deserializeUser((username, done)=>{
    let user = usuarios.find( usuario => usuario.username == username);
        done(null, user);
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

// app.post('/registro', (req, res, next)=>{
//     let { username, password, direccion } = req.body;

//     let user = usuarios.find( usuario => usuario.username == username);
//     if(user) return res.json({error: 'El usuario ya existe'});
//     usuarios.push({
//         username,
//         password,
//         direccion
//     });
//     req.session.user = {
//         username,
//         password,
//         direccion
//     }
//     return res.redirect('datos');
// })


// app.post('/login', (req, res, next)=>{
//     let { username, password } = req.body;

//     let user = usuarios.find( usuario => usuario.username == username);
//     if(user) {
//         if(user.password == password){
//             req.session.user = user;
//             return res.redirect('datos');
//         }else{
//             return res.json({error: 'Las credenciales no coinciden!'});
//         }
//     }else{
//         return res.json({error: 'El usuario No existe, logueese!'});
//     }
//     // return true;
// })




app.listen(PORT, (err) => {
    if (err) return console.log('error en listen server', err);
    console.log(`Server running on PORT ${PORT}`);
  });