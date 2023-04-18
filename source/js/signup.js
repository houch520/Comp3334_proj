//Here we handle all signup algorithm

//Variables from the DOM
var email = document.querySelector(".in_email");

var button_back = document.querySelector(".back_btn");
var button_sendemail = document.querySelector(".sendemail_btn");

//Chat connection to the server
var server = new ChatClient();

button_back.addEventListener("click",function(event){
	window.location="index.html";
});

button_sendemail.addEventListener("click",function(event){
	if (checkEmail(email)) {
		signup(email.value).then(()=>{server.connection.close();});
	}
	button_sendemail.disabled = true;
	setTimeout(function(){button_sendemail.disabled = false;}, 120000);
	alert("If you haven't received a confirmation email, please try again after 2 minutes");
});


function checkEmail(email){
	var re= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (email.value.length == 0){
		alert("Please enter your email.");
		return false;
	} else if (re.test(email.value)) {
		alert("Email sent! Please check your mailbox.");
		return true;
	}
	alert("Please check your email format.");
	return false;
}

function signup(email){	
		//Connect to the chat room
		server.connect("localhost:443",email);
		console.log(email);
		//////////////////////////////////////////////////////////////////////////////////////////
		//CALLBACKS FOR WEBSOCKETSERVER
		//The first thing when extablishes connection. It sends the user information to the server
		server.connection.onopen = function(event){
			var data = {
				 type: "signUp",
				 msg: email
			};
			server.connection.send(JSON.stringify(data));
		}		
		//Closing the websocket server
		server.connection.onclose= function(){
			server.connection.close();
		}
		return true;

}




