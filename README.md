Features
signup page
instutition + email
confirm→ username+password
//script & input check for all input field//

1. email -> select * from user where email = inputEmail -> return == null
2. generate random verificationCode
//insert email, verification key to the database
-> send confirmation email(random key) => page: return email & key on click
// check key with database => exist
//pass step 2
3. input password, username (suggestion, password strength rule)
-> encrypt password (client)
-> hash password -> store in mysql

login page
authorization (1. username 2. password)
encrypted account data (hash)


public chatroom page
can enter virtual classroom :p (default)
join nearby classmates’ conversation :D
private group chat
for project/ private discussion purpose yeahh
can send message 
user profile button:
change preference
create private chatroom
creator/admin can edit chat room info(name)

private chatroom page
select private chatroom slider
setting button 
all: quit chatroom
admin:
edit chatroom info (query: update blablabla)
delete chatroom
1. select all entry in member where chatroomID= this chatroom’s id
2. delete all member entries
3. delete chatroom entry 
add/ kick member(by uid)
add member => insert entry
kick member => remove entry
transfer admin (by uid)
add admin
update boolean(set to true) of member where uid = (uid), chatroomID= this chatroom’s id
kick admin(not member)
set boolean to false

~world: show the uid?~

general: input checking (prevent buffer overflow attack) & script remove
message timeout		
timeout? 5s? -> defend against dos attack
encryption: use https

//other security concern to be included in the report
last activity date -> delete account after 1 yr of inactivity
be efficient


// future improvement
-> hyperlink redirection
