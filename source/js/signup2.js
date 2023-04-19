var userName = document.querySelector(".in_username");
var password = document.querySelector(".in_pw");
var button_save = document.querySelector(".save_btn");
//Chat connection to the server
var server = new ChatClient();

button_save.addEventListener("click",function(event){
	console.log("click save");
    if (passwordStrength(password.value)){
        updateUser(userName.value, password.value).then((result)=>{
            console.log("return = ", result);
            //server.connection.close();
            console.log("line13");
            window.location="index.html";       
        });    
    }	
    else {
        alert("Your password is not strong enough//password rule");
        button_save.disabled = true;
        setTimeout(function(){button_save.disabled = false;}, 5000);
    }
    
});
let strongPassword = new RegExp('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})');
function passwordStrength(password){
    if (strongPassword.test(password)) return true;
    return false;
}
function updateUser(name, pw){    
    return new Promise((resolve, reject)=>{
        console.log("user name=",name);
        console.log("pw = ",pw);
        var current_url= window.location.href;
        var query = window.location.search.substring(1);
        console.log(current_url);
        console.log(query);
        query=query.split('=');
        key=query[1];
        console.log(key);
    
        server.connect("localhost:443",key);    
        server.connection.onopen = function(event){
            var data = {
                    type: "signUp2",
                    key: key,
                    name: name,
                    password: pw
            };
            server.connection.send(JSON.stringify(data));
            //console.log("51");
        };	
        //Closing the websocket server
        server.connection.onclose= function(){
            server.connection.close();
        };
        resolve(true);
    });
}