//Here we handle all the chat algorithm

//Variables from the DOM
//need retrieve username from db
var input = document.querySelector(".sd_msg");
var input_un = document.querySelector(".in_un");
var input_pw = document.querySelector(".in_pw");

var button_signup = document.querySelector(".signup_btn");
var button_login = document.querySelector(".login_btn");

var div_msg = document.querySelector(".msg");
var div_login = document.querySelector(".loggin");
var div_container = document.querySelector(".container");
var div_header = document.querySelector(".header");

//hide chatbox
div_container.style.display="none";

//Chat connection to the server
var server = new ChatClient();

//User
var Usuario = null;
var renderuser = false; //for rendering the user

//Hide chat during login page
button_login.addEventListener("click",function(event){
	if(checkBox()) login();
});

button_signup.addEventListener("click",function(event){
	window.location="signup1.html";
	//server.connection.close();
});

document.addEventListener("keydown",function(event)
{
	
	if(event.keyCode == 13){
		
		if (div_login.style.display == 'none')
		{
			onSendMessage();
		}
		else
		{
			if(checkBox()) login();
		}	
	}	
});

//Sending messages to the server -- The data also has the position of the user's box
function onSendMessage(){
	if(!input.value == ""){
		if (input.value.length>100) input.value = input.value.slice(0, 100);
		position = [Usuario.cube.position.x, Usuario.cube.position.y, Usuario.cube.position.z];
		//Enviarho al servidor
		var data ={
			type:"message",
			from: Usuario.username,
			pos: position,
			msg : input.value
		};
		console.log("msg=",data.msg);
		server.sendMessage(data);
		input.value	="";
	}
}

//Receiving Messages
function showMessage(classname,msg){

	var element = document.createElement("div");
	element.innerHTML = msg;
	element.className = classname;
	div_msg.appendChild(element);
	div_msg.scrollTop = 99999999;
}

//Check input values for the login
//check login input
function checkBox(){
	if (input_un.value.length == 0)
	{
		alert("Please enter your email.");
		return false;
	} else if (input_pw.value.length == 0)
	{
		alert("Please enter your password.");
		return false;
	}
	return true;
}


//Logs the user in and opens the callbacks for the websockets
function login(){
	//Connect to the chat room
	//server.connect("localhost:443",input_un.value);
	// server.connect("ecv-etic.upf.edu:443",input_un.value);
	
	server.connect("localhost:443",input_un.value);
	//Creating user, gives it a cube and adding to the scene
	Usuario = new User(input_un.value);
	
	var inactivityTime = function(){
		var idleTime = 0;
		var timerInterval = 5000; // 5 seconds
	
		function logout(){
			alert("Logout");
			server.connection.onclose= function(){
				server.connection.close();
			}
			location.reload();
		}
	
		function resetTimer(){
			idleTime = 0;
		}
	
		// Start the timer interval to check for inactivity
		var timer = setInterval(function() {
			idleTime += timerInterval;
	
			if (idleTime >= 180000) { // 0.5 hour
				clearInterval(timer);
				logout();
			}
		}, timerInterval);
	
		// Reset the idle time whenever the mouse is moved
		document.addEventListener('mousemove', resetTimer);
	}
	inactivityTime();

	//////////////////////////////////////////////////////////////////////////////////////////
	//CALLBACKS FOR WEBSOCKETSERVER
    //The first thing when extablishes connection. It sends the user information to the server
	server.connection.onopen = function(event){
		var data = {
	     	type: "login",
			email: input_un.value,
			pw: input_pw.value,
	     	from: input_un.value
    	};
		server.connection.send(JSON.stringify(data));
	}
	//When we receive a message from the server
	server.connection.onmessage = function ( msg ){
		//data received
		var data = JSON.parse(msg.data);
		//console.log(data);
		
		console.log("data.id = ",data.id);
		console.log("my.id = ", Usuario.id);

		if (data.type =="login" && data.uid != -1){
			//Make Login Page disappear
			div_login.style.display ='none';

			//Make chat appear
			div_container.style.display="block";

			//A notification is received when someone new connects to the chatroom
			//This means that we need to render a new cube
			showMessage("msg_notif",data.msg);
			if(Usuario.id!=data.id){
				cubes[data.id] = createCube(data.p,data.c);
				cubes[data.id].uptime = 1.2;
				scene.add(cubes[data.id]);
			}
			else{
				Usuario.username=data.uName;
				Usuario.uid=data.uid;
			}

		}
		else if (data.type =="login" && data.uid == -1){
			//invalid password/email
			if (Usuario.id==data.id) {
				alert("Invalid password/email");
				server.connection.close();	
				scene.remove(cubes[data.id]); // Remove from the scene
				delete cubes[data.id]; // Remove the cube
			}
		}

		if(data.type == "message"){
			//Two kind of messages
			//1- sent from the user 
			//2- sent from others - Here we need to show who has sent it
			if (data.from == Usuario.username){
				showMessage("msg_me",data.msg);
			}
			else {
				showMessage("msg_user_Username", data.from);
				showMessage("msg_user",data.msg);
			}
		}

		if(data.type =="notification"){
			//A notification is received when someone new connects to the chatroom
			//This means that we need to render a new cube
			showMessage("msg_notif",data.msg);
			if(Usuario.id!=data.id){
				cubes[data.id] = createCube(data.p,data.c);
				cubes[data.id].uptime = 1.2;
				scene.add(cubes[data.id]);
			}
		}

		//Receive data about your cube when login
		if(data.type =="LOG"){
			if (data.uid!= -1){
				Usuario.setId(data.id);
				
				//adds cube
				Usuario.setCube(data.p,data.c);
				scene.add(Usuario.cube);
				//adds the cone that indicates the user
				Usuario.setCone(data.p);
				scene.add(Usuario.cone);
				renderuser = true; // The users has his cube, so we can render it now
			}
			else{
				Usuario.setId(data.id);
			}

		}

		//the message with type USERS is received when we logged in the websocket server
		//Here we are going to render all the users that are already in the chat
		if(data.type=="USERS"){
			//check it is not yourself
			if(Usuario.id != data.id){
				cubes[data.id] = createCube(data.p,data.c);
				cubes[data.id].uptime = 1.2;
				scene.add(cubes[data.id]); // add cube to the scene
			}
		}

		//Here we are going to receive the end position of the cube
		//We store them and in the render we are going to compute the movement
		//of respective cube to its destination
		if(data.type=="WRLDUPDATE"){
			//console.log("Received new position");
			if(Usuario.id != data.id){
				cubes[data.id].endpos = new THREE.Vector3(data.pos[0],data.pos[1],data.pos[2]);
				cubes[data.id].uptime = 0; //Starts lerp
			}	
		}

		if(data.type=="EDIT"){
			ChangeColor(data.newc,cubes[data.id]);
		}
		//Here we are going to erase the cube from the scene
		if(data.type =="disconnect"){
			scene.remove(cubes[data.id]); // Remove from the scene
			delete cubes[data.id]; // Remove the cube
			showMessage("msg_notif",data.msg);
		}	
	}
	
	//Closing the websocket server
	server.connection.onclose= function(){
		server.connection.close();
	}

}

