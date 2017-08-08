const SMTPServer = require('smtp-server').SMTPServer;
const fs = require('fs')

// This example starts a SMTP server using TLS with your own certificate and key
const server = new SMTPServer();
server.listen(465);
