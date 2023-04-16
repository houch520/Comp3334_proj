//Here we handle all signup algorithm

//Variables from the DOM
var email = document.querySelector(".in_email");

var button_back = document.querySelector(".back_btn");
var button_sendemail = document.querySelector(".sendemail_btn");

button_back.addEventListener("click",function(event){
	window.location="index.html";
});

button_sendemail.addEventListener("click",function(event){
	if (checkEmail(email)) signup();
});

function checkEmail(email){
	var re= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (email.value.length == 0){
		alert("Please enter your email.");
		return false;
	} else if (re.test(email.value)) {
		alert("Email sent! Please check your mailbox.");
		//call function, send email to server
		return true;
	}
	alert("Please check your email format.");
	return false;
}

function signup(email){


}


