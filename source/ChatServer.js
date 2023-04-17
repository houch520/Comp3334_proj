//NodeJS code on server side // 

const CryptoJS = require("crypto-js");
//Include 'websocket' and 'http' NodeJS modules
var WebSocketServer = require('websocket').server;
var http = require('http');
var url = require('url');
var fs = require('fs');
//Include connection to mysql database
//var {dbconnection,closeConnection}= require('./db_connection.js');
const dbFcn= require('./dbFunctions.js');

//Varables to store the connection and array of clients
var connections = [];
var clients = [];
var minDist = 15; //offset distance - Every user outside this lenght are not going to receive a message

//Client object
function Client(username,connection,id,p,c){
    this.username = username; //Username
    this.connection = connection; // connection
    this.userID = id; //ID
    this.position = p; //position of the cube
    this.c = c; // Color of the cube
}

//Create HTTP Server - Since we are using WebSockets, we just need it to use HTTP Requests/Responses

var server = http.createServer(function(request, response) {
    var q = url.parse(request.url,true);

    //console.log(q.query.verKey);
    var normalReq = true;
    //console.log("Looking for: "+q.pathname);
    if (q.pathname=="/") {   
        q.pathname="/index.html";    
        if(q.query.verKey) {
            normalReq=false;
            console.log("received verify key request");
            var verKey = q.query.verKey;
            console.log("verKey=",verKey);       
            dbFcn.checkVerificationKey(verKey).then((result)=>{
                console.log("result=",result);
                if (result){
                    response.writeHead(302, {
                        'Location': '/signup2.html?verKey=' + verKey
                    });
                }
                else{
                    if (result){
                        response.writeHead(302, {'Location': '/index.html'});                        
                    }
                }
                return response.end();
            });
        }  
    }
    if (normalReq){        
        fs.readFile("."+q.pathname,function(err,data){
            if(err){
                response.writeHead(404,{'Content-Type':'text/html'});
                return response.end("404 Not Found");
            }
            if(q.pathname.includes(".html")){
                response.writeHead(200,{'Content-Type':'text/html'});
            }
            else if(q.pathname.includes(".css")){
                response.writeHead(200,{'Content-Type':'text/css'});
            }
            else if(q.pathname.includes(".js")){
                response.writeHead(200,{'Content-Type':'text/javascript'});
            }
            else if(q.pathname.includes(".jpg")){
                response.writeHead(200,{'Content-Type':'image/jpeg'});
            }
            response.write(data);
            return response.end();
        })
    }
    //console.log((new Date()) + ' Received request for ' + request.url);
        
    
});
server.listen(9026, function() {
    console.log("["+ new Date()+"]" + "Server is listening on port 9026");
});


//Web Socket Server
ws = new WebSocketServer({
    httpServer: server
});

//Everytime someone tries to connect to the websocket server
ws.on("request", function(request) {
    
    var connection = request.accept(null, request.origin);

    //Pathname format will be /un="Username"
    var pathname = request.resourceURL["pathname"];
    var username = pathname.split("=")[1];

    //Send all the users online that the servers handles to the new connection
    if(clients.length!=0)
        for(var i=0; i<clients.length;i++)
            connection.sendUTF(JSON.stringify({type:"USERS",id:clients[i].userID,
                p:clients[i].position,c:clients[i].c}));
    
    //set attributes value for user
    var id = connections.push(connection) - 1; // ID of the connected user

    //Values of the cube
    var position = getRandomPosition();
    var c = getRandomColor();
    var client = new Client(username, connection,id,position,c);
    clients.push(client);

    //Send the user's ID, cubes's position and color
    connection.sendUTF(JSON.stringify({type:"LOG", id: client.userID, p: client.position,c: client.c}));

    //Server console notification
    console.log("["+new Date() + "]: New connection from user: "+client.username+ " with id: " + client.userID);

    //Messages from the user
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            var data = JSON.parse(message.utf8Data);
            console.log("Received message " + JSON.stringify(data));

            //check signUp request            
            if (data.type =="signUp"){       
                console.log(data.msg);                
                dbFcn.checkEmail(data.msg).then((result)=>{
                    console.log("result=",result);
                    if (result){                        
                        var verKey=CryptoJS.lib.WordArray.random(4).toString(CryptoJS.enc.Hex);
                        console.log("random key = ",verKey);
                        dbFcn.addNewUser("userName","password",data.msg,verKey);
                        console.log("added new user");
                        //send link to email
                        sendEmail(data.msg, verKey);
                    }
                    else{console.log("email already existed");}
                })
            }            
            if (data.type =="signUp2"){
                console.log("key=",data.key);
                console.log("name=",data.name);
                console.log("pw=",data.password);                
                dbFcn.registerUserInformation(data.key, data.name, data.password);
            }

            //Check Distance to decide to whom send broadcast of message
            if(data.type == "message"){
                for(var i = 0; i < clients.length ; i++){
                    if(Distance(clients[i].position, data.pos) < minDist){
                        clients[i].connection.sendUTF(JSON.stringify(data));
                    }
                } 
            }
            //receive login
            //if the data received is a notification we need to resend it with the cube position and color
            if(data.type =="login"){
                dbFcn.checkEmail_Password_Pair(data.email, data.pw).then((uid)=>{
                    console.log("in login check, uid of email pw pair = ", uid);
                    data.id = id;
                    data.uid=uid;
                    if (uid!=-1){
                        console.log("uid != -1");
                        dbFcn.getUNamebyID(uid).then((uName)=>{
                            data.uName = uName;
                            data.msg = "User "+uName+" has joined";
                            data.p = client.position;
                            data.c = client.c;
                            doBroadcast(data)
                        })
                        dbFcn.updateLastLogin(uid);
                    }
                    else {
                        doBroadcast(data);
                    }
                                     
                })
            }

            // When a client moved a cube we update clients
            if(data.type=="WRLDUPDATE"){
            	console.log("[USERMOVED] ID: "+data.id+" new coord:["+data.pos[0]+","+data.pos[1]+","+data.pos[2]+"]");
                //Search for the client and update its position
                var index = getIndexofClient(data.id);
                clients[index].position = data.pos;
                // for(var i = 0; i < clients.length ; i++){
                //     if (clients[i].userID == data.id){
                //         clients[i].position = data.pos;
                //         break;
                //     }
                // }
                doBroadcast(data);
            }

            //When a client changes the color or username
            if(data.type =="EDIT"){
                //console.log("[EDIT] ID: "+data.id+" has changed either username or color");
                var index = getIndexofClient(data.id);
                var newcolor = ParseColor(data.newc);

                //Change username
                if(data.newun.length!=0 && index !=-1){
                    console.log("[EDIT] ID: "+data.id+" has changed username from "+clients[index].username+" to "+ data.newun);
                    clients[index].username = data.newun;
                }

                //Change color
                console.log("[EDIT] ID: "+data.id+" has changed color from "+ clients[index].c+" to "+newcolor );
                clients[index].c = newcolor;
                doBroadcast(data);
            }
        }
    });

    //User disconnected
    connection.on('close', function(connection) {
        //Here we remove the connection and the corresponding client and 
        //broadcast the disconnection
        var index = getIndexofClient(id);
    	// for(var i=0; i<clients.length;i++){
    	// 	if(clients[i].userID == id){
    	// 		index = i;
    	// 		break;
    	// 	}
    	// }
    	//Message
        var data = {
        	type: "disconnect",
        	msg: "User: "+clients[index].username+" has left",
        	id: clients[index].userID,
        }
        clients.splice(index,1); // Remove the client
        connections.splice(id,1); // remove the connection from the array

        console.log("[USERLOGOUT] ID: "+data.id+" has left the chatroom");
        doBroadcast(data);
    });
});

var nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'comp3334g38@gmail.com',
      pass: 'COMP3334',
      clientId:      '870552542586-2clbtb4ubapmjnbtlceui0ep529hsc3f.apps.googleusercontent.com' ,
      clientSecret: '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',
      refreshToken: '1//04OIuIAelnzY-CgYIARAAGAQSNwF-L9IryLEQCG_J1EXS1yLUMY1MEBwAAD3pkLGsu8yf1Q7hxAa46FLdX4iDMiSzKqb0fOWABRw'
    }
  });
function sendEmail(email,key){
    var link="http://localhost:9026/?verKey="+key;
    var mailOptions = {
        from: 'youremail@gmail.com',
        to: email,
        subject: 'PolyU Chatroom SignUp confirmation',
        html: '<p>Please click the link to confirm your registration <a href= "'+link+'">here</a></p>'
      };
      
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      }); 

}


function Distance(pos1, pos2){
	//console.log("Positions compared are" + pos1 + "and" + pos2);
	return Math.sqrt(Math.pow((pos1[0]-pos2[0]), 2) + Math.pow((pos1[1]-pos2[1]), 2) + Math.pow((pos1[2]-pos2[2]), 2));
}

//Send the data to all the users ( Broadcast )
function doBroadcast(data){
    for(var i=0; i<clients.length;i++)
        clients[i].connection.sendUTF(JSON.stringify(data));
    
}

function getRandomColor(){
    //Returns a random hexadecimal color
    var letters = "0123456789ABCDEF";
    var color="0x";
    for(var i =0; i<6;i++)
        color+=letters[Math.floor(Math.random()*16)];
    //console.log(color);
    return color;

}

function getRandomPosition(){
    //Returns an array of random x,y,z coordinates between 0-9
    var x = Math.floor(Math.random()*50);
    var y = Math.floor(Math.random()*35);
    //var z = Math.floor(Math.random()*); 
    var z = 2.5;
    var position = [x,y,z];
    return position;
}

function ParseColor(color){
    //Changes the color of the cube
    //Replace the #, seems like it needs 0x to set a color in hexadecimal
    if(color.includes("#")){
        color = color.replace("#","0x");
    }
    return color;
}

function getIndexofClient(id){
    for(var i=0; i<clients.length;i++){
        if(clients[i].userID == id)
            return i;
    }
    return -1;
}
