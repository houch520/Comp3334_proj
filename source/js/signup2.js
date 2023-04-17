var userName = document.querySelector(".in_username");
var password = document.querySelector(".in_pw");
var button_save = document.querySelector(".save_btn");
//Chat connection to the server
var server = new ChatClient();

button_save.addEventListener("click",function(event){
	console.log("click save");
	updateUser(userName.value, password.value);
	window.location="index.html";
});

function updateUser(name, pw){
	console.log("user name=",name);
	console.log("pw = ",pw);
	var current_url= window.location.href;
	// get access to URLSearchParams object
	var query = window.location.search.substring(1);
    console.log(current_url);
    console.log(query);
    query=query.split('=');
    key=query[1];
    console.log(key);

    server.connect("localhost:9026",key);

    server.connection.onopen = function(event){
            var data = {
                 type: "signUp2",
                 key: key,
                 name: name,
                 password: pw   //encryption
            };
            server.connection.send(JSON.stringify(data));
        }		
        //Closing the websocket server
        server.connection.onclose= function(){
            server.connection.close();
        }

}