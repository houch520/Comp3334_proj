//Here we handle all signup algorithm

//Variables from the DOM
var button_back = document.querySelector(".back_btn");
var button_sendemail = document.querySelector(".sendemail_btn");

button_back.addEventListener("click",function(event){
	history.back();
});

button_sendemail.addEventListener("click",function(event){
	signup();
});

function signup(){
	//send confirmation email 
}


