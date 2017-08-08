var http = require('http');
var fs = require('fs');
var nodemailer = require('nodemailer');

// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
    fs.readFile('../html/index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});

// Chargement de socket.io
var io = require('socket.io').listen(server);

// Quand un client se connecte, on le note dans la console
io.sockets.on('connection', function (socket) {


    // login
    var smtpTransport = nodemailer.createTransport({
        service: "hotmail",
        // host: "smtp-mail.outlook.com", // hostname
        secureConnection: false, // TLS requires secureConnection to be false
        port: 587, // port for secure SMTP
        auth: {
            user: "keisuke-kun@hotmail.fr",
            pass: "nowel93700"
        },
        tls: {
            ciphers:'SSLv3'
        },
        requireTLS: true
    });


    var mailOptions = {
        to: "kevin.dias91@gmail.com",
        subject: 'Hello ', // Subject line
        text: 'Hello world ', // plaintext body
        html: '<b>Hello world </b>' // html body
    };


    smtpTransport.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Message sent: ' + info.response);
      }
      smtpTransport.close();
    });


    socket.emit('message', 'Vous êtes bien connecté !');
    // socket.broadcast.emit('message', 'Un autre client vient de se connecter !');

    // Quand le serveur reçoit un signal de type "message" du client
    socket.on('message', function (message) {
        console.log('Un client me parle ! Il me dit : ' + message);
    });

    //Quand un nouvel utilisateur donne son pseudo
    socket.on('petit_nouveau', function(pseudo){

        socket.pseudo = pseudo;
        console.log(socket.pseudo + ' vient de se connecter');

        //On récupère les archives des conversation
        fs.readFile('../api/conversation.json', 'utf8', function readFileCallback(err, data){
            socket.emit('archive', JSON.parse(data));
        });
        socket.broadcast.emit('new_user', pseudo);
    });

    socket.on('send_message', function({pseudo, message}){
        socket.pseudo = pseudo;
        socket.message = message;

        console.log('message de ' + socket.pseudo + ': ' + socket.message );

        socket.broadcast.emit('display_message', {pseudo, message});

        fs.readFile('../api/conversation.json', 'utf8', function readFileCallback(err, data){
            if(err){
                console.log(err);
            } else {

                var conversObj = JSON.parse(data);

                var newEntry = '{"'+ socket.pseudo +'" : "'+ socket.message +'"}';

                conversObj.conversation.push(JSON.parse(newEntry));

                fs.writeFile("../api/conversation.json", JSON.stringify(conversObj), function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    console.log("The file was saved!");
                });
            }
        })
    });

    socket.on('send_mail', function({mail, object, mailtext}){

        socket.mail = mail;
        socket.object = object;
        socket.mailtext = mailtext;

    });
    // socket.on('disconnect', function () {
    //     userDisconnected = true;
    //     setTimeout(function () {
    //      //do something
    //
    //          if (userDisconnected){
    //             console.log('user disconnect' + socket.pseudo);
    //          }
    //      }, 3000);
    //
    // });
});

server.listen(1337);
