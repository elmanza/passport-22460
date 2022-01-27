const express = require('express');
let JWT = require("jsonwebtoken");
const app = express();
const PORT = 3000;
let path = require("path");
const PRIVATE_KEY = "laclaveescamila";
let usuarios = [];

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static(__dirname + "/public"));

app.set("views", path.join(__dirname, 'views', 'ejs'))
app.set('view engine', 'ejs');





let isAuth = async (req, res, next) =>{
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.send("No estas autenticado!");

    const token = authHeader.split(" ")[1];
    let dataToken = await JWT.verify(token, PRIVATE_KEY);
    req.user = dataToken.data;
    next();
}



app.get('/registro', (req, res, next)=>{
    res.render('registro');
})


app.get('/', (req, res, next)=>{
    res.redirect('login');
})

app.get('/login',  (req, res, next)=>{
    res.render('login');
})


app.get('/datos', isAuth, (req, res, next)=>{
    res.json(req.user);
})

app.get('/logout', (req, res, next)=>{
    req.session.destroy( err =>{
        if(err) res.send(JSON.stringify(err));
        res.redirect('login');
    })
})



app.post('/registro', async (req, res, next)=>{
    let { username, password, direccion } = req.body;

    let user = usuarios.find( usuario => usuario.username == username);
    if(user) return res.json({error: 'El usuario ya existe'});
    let newUser = {
        username,
        password,
        direccion
    }
    usuarios.push(newUser);
    let access_token = await generateToken(newUser);
    return res.json({access_token});
})


app.post('/login', async (req, res, next)=>{
    let { username, password } = req.body;

    let user = usuarios.find( usuario => usuario.username == username);
    if(!user) return res.json({error: 'El usuario No existe, logueese!'});

    if(user.password != password) return res.json({error: 'Las credenciales no coinciden!'});
        
    let access_token = await generateToken(user);
    return res.json({access_token});
})

async function generateToken(user){
    return await JWT.sign({data:user, fecha:"Es hoy!"}, PRIVATE_KEY, {expiresIn: '48h'})
}

app.listen(PORT, (err) => {
    if (err) return console.log('error en listen server', err);
    console.log(`Server running on PORT ${PORT}`);
  });