let express = require('express');
let bodyparser = require('body-parser');
const { response } = require('express');
let session = require('express-session');
let hash = require('object-hash');

let app = express();

let http =require('http').Server(app);
var io = require('socket.io')(http);

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

app.use('/assets',express.static('public'));

app.use(session({
  secret: 'billel',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.set('view engine', 'ejs');

app.use(require('./middlewares/flash'));

let User = require('./models/user');

app.get('/', (request, response) =>{
    response.render("pages/index");
});

app.get('/sign_up.ejs', (request, response) =>{
    response.render("pages/sign_up");
});

app.post('/connect', (request, response) =>{
    if(request.body.username === "" && request.body.pass != ""){
        request.flash('error', "Empty Username");
        response.redirect('/');
    }
    else if(request.body.pass === "" && request.body.username != ""){
        request.flash('error', "Empty Password");
        response.redirect('/');
    }
    else if(request.body.pass === "" && request.body.username === ""){
        request.flash('error', "Empty Username And Password");
        response.redirect('/');
    }
    else{
        User.login((result)=>{
            let bool = false;
            result.forEach(e => {
                console.log()
                if(request.body.username == e.username && hash(request.body.pass) == e.password){
                    bool = true;
                    //break;
                }
            });
            if(bool == false){
                request.flash('error', "Username Or Password Incorrect");
                response.redirect('/');
            }
            else
            {
                response.render('./chat/index', {username: request.body.username});
            }
            
        })
    }
});

app.post('/register', (request, response) =>{
    if(request.body.firstname === ""){
        request.flash('error', "Empty Firstname");
        response.redirect('/sign_up.ejs');
    }
    else if(request.body.lastname === ""){
        request.flash('error', "Empty Lastname");
        response.redirect('/sign_up.ejs');
    }
    else if(request.body.username === ""){
        request.flash('error', "Empty Username");
        response.redirect('/sign_up.ejs');
    }
    else if(request.body.email === ""){
        request.flash('error', "Empty Email");
        response.redirect('/sign_up.ejs');
    }
    else if(request.body.pass === ""){
        request.flash('error', "Empty Password");
        response.redirect('/sign_up.ejs');
    }
    else if(request.body.confirmpass === ""){
        request.flash('error', "Empty Confirm password");
        response.redirect('/sign_up.ejs');
    }
    else if(request.body.pass != request.body.confirmpass){
        request.flash('error', "The Two Passwords Do Not Match");
        response.redirect('/sign_up.ejs');
    }
    else{
        request.body.pass = hash(request.body.pass);
        User.create(request.body, (type, msg)=>{
            request.flash(type, msg);
            response.redirect('/sign_up.ejs');
        })
    }
});

io.on('connection', function(socket){
    console.log('user is connected')
    socket.on('disconnect', function(){
        console.log("user is disconnected");
    });
    socket.on('message', function(msg){
        var now = new Date();
        var heur = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();
        var tab_param = [msg[0],msg[1],heur,minute,second];
        if(msg != ""){
            io.emit('message_diffuse', tab_param);
        }
    })
});

let server = app.listen(8080, ()=>{
    console.log('connected in http://localhost:8080');
});