var {connection,closeConnection}= require('./db_connection.js');

//modify tables
//users
//get number of rows in userTable
function createUserID(){//update later(generate hash with entry index)
    return new Promise((resolve, reject)=>{
        connection().then((con)=>{
            con.query("SELECT * FROM `user`",function (err, data) {
            if (err) throw err;
            var numRows=data.length;
            closeConnection(con);
            console.log("number of entry in User = ",numRows);
            resolve(numRows+1);
            });
        }); 
    });

}
function addNewUser(uName, passsword, email, key){
    connection().then((con)=>{
        createUserID().then((uid)=>{
            var sql = "INSERT INTO `user` (`UserID`, `UserName`, `Userpassword`, `email`, `verification_Key`, `last_login`) VALUES (?,?,MD5(?),?,?,Now())";
            con.query(sql, [uid, uName, passsword, email, key],function (err, data) {
                if (err) throw err;
                console.log("1 record inserted");
                closeConnection(con);
              });
        });
    });
}

function removeUser(uid){
    connection().then((con)=>{
        var sql = "DELETE FROM `user` WHERE `user`.`UserID` = ?";
        con.query(sql, [uid],function (err, data) {
            if (err) throw err;
            console.log("1 record deleted");
            closeConnection(con);
        });
    });
}


function updateUserName(uid, userName){
    connection().then((con)=>{
        var sql = "UPDATE `user` SET `UserName` = ? WHERE `user`.`UserID` = ?;";
        con.query(sql, [userName, uid],function (err, data) {
            if (err) throw err;
            console.log("1 record updated");
            closeConnection(con);
        });
    });
}
function updateUserPassword(uid, password){
    connection().then((con)=>{
        var sql = "UPDATE `user` SET `Userpassword` = ? WHERE `user`.`UserID` = MD5(?);";
        con.query(sql, [password, uid],function (err, data) {
            if (err) throw err;
            console.log("1 record updated");
            closeConnection(con);
        });
    });
}
function updateVerificationKey(uid, key){
    connection().then((con)=>{
        var sql = "UPDATE `user` SET `verification_Key` = ? WHERE `user`.`UserID` = ?;";
        con.query(sql, [key, uid],function (err, data) {
            if (err) throw err;
            console.log("1 record updated");
            closeConnection(con);
        });
    });
}
function updateLastLogin(uid){//update last_login date
    connection().then((con)=>{
        var sql = "UPDATE `user` SET `last_login` = Now() WHERE `user`.`UserID` = ?";
        con.query(sql, [uid],function (err, data) {
            if (err) throw err;
            console.log("1 record updated");
            closeConnection(con);
        });
    });
}

//chatroom
function insertChatroom(crID, crName){
    connection().then((con)=>{
        var sql = "INSERT INTO `chatroom` (`ChatroomID`, `ChatroomName`) VALUES (?, ?)";
        con.query(sql, [crID, crName],function (err, data) {
            if (err) throw err;
            console.log("1 record inserted");
            closeConnection(con);
      });
    });
}
function removeChatroom(crID){
    connection().then((con)=>{
        var sql = "DELETE FROM`chatroom` WHERE `chatroom`.`ChatroomID` = ?";
        con.query(sql, [crID],function (err, data) {
            if (err) throw err;
            console.log("1 record deleted");
            closeConnection(con);
        });
    });
}
function updateChatroomName(crID, crName){
    connection().then((con)=>{
        var sql = "UPDATE `chatroom` SET `ChatroomName` = ? WHERE `chatroom`.`ChatroomID` = ?";
        con.query(sql, [crName,crID],function (err, data) {
            if (err) throw err;
            console.log("1 record updated");
            closeConnection(con);
        });
    });
}
//member
function insertMember(crID, uid, admin){
    connection().then((con)=>{
        var sql = "INSERT INTO `member` (`ChatroomID`, `UserID`, `admin`) VALUES (?,?,?)";
        con.query(sql, [crID, uid, admin],function (err, data) {
            if (err) throw err;
            console.log("1 member inserted");
            closeConnection(con);
        });
    });
};
function removeMember(crID, uid){ //removeMember/quit chatroom: 
    connection().then((con)=>{
        var sql = "DELETE FROM `member` WHERE `ChatroomID`=? AND `UserID`=?";
        con.query(sql, [crID, uid],function (err, data) {
            if (err) throw err;
            console.log("1 member removed");
            closeConnection(con);
        });
    });
}
function updateMember(crID, uid, admin){ //admin=1: admin, admin=0: ordinary member
    connection().then((con)=>{
        var sql = "UPDATE `member` SET `admin`=? WHERE `ChatroomID`=? AND `UserID`=?";
        con.query(sql, [admin,crID, uid],function (err, data) {
            if (err) throw err;
            console.log("1 member updated");
            closeConnection(con);
        });
    });
}

//retrieve & check information from table
//user
function checkEmail(email){
    //return true if email does not exist in the db, else false
    return new Promise((resolve, reject)=>{
        var numRows = 0;
        var sql =" SELECT * FROM `user` WHERE `email` = ?";
        connection().then((con)=>{
            con.query(sql,[email],function (err, data) {
            if (err) throw err;
            numRows=data.length;
            closeConnection(con);
            resolve(numRows==0);
            });
        }); 
    })
}
function checkEmail_Password_Pair(email, password){
    //return UserID if there exist a email-password pair, else -1
    return new Promise((resolve, reject)=>{
        var uid = -1;
        var sql =" SELECT * FROM `user` WHERE `email` = ? AND `Userpassword` = MD5(?)";
        connection().then((con)=>{
            con.query(sql,[email, password],function (err, data) {
            if (err) throw err;
            // iterate for all the rows in result
            Object.keys(data).forEach(function(key) {
                uid = data[key].UserID;
            });
            closeConnection(con);
            resolve(uid);
            });
        }); 
    });
}
function checkVerificationKey(key){
    //return true if the verification key exists
    return new Promise((resolve, reject)=>{
        var numRows = 0;
        var sql =" SELECT * FROM `user` WHERE `verification_Key` = ?";
        connection().then((con)=>{
            con.query(sql,[key],function (err, data) {
            if (err) throw err;
            numRows=data.length;
            closeConnection(con);
            resolve(numRows!=0);
            });
        }); 
    })
}

//member
function getChatroomListbyUID(uid){
    return new Promise((resolve, reject)=>{
        var chatrooms=[];
        var sql ="SELECT * FROM `member` WHERE `UserID`= ?";
        connection().then((con)=>{
            con.query(sql,[uid],function (err, data) {
            if (err) throw err;
            // iterate for all the rows in result
            Object.keys(data).forEach(function(key) {
                chatrooms[key] = data[key].ChatroomID;
            });
            closeConnection(con);
            resolve(chatrooms);
            });
        }); 
    });
}

function getMemberlistbyChatroomID(crid){
    return new Promise((resolve, reject)=>{
        var members=[];
        var sql ="SELECT * FROM `member` WHERE `ChatroomID`= ?";
        connection().then((con)=>{
            con.query(sql,[crid],function (err, data) {
            if (err) throw err;
            // iterate for all the rows in result
            Object.keys(data).forEach(function(key) {
                members[key] = data[key].UserID;
            });
            closeConnection(con);
            resolve(members);
            });
        }); 
    });    
}
/*
//testing code
addNewUser("userA", "somePassword","user@gmail.com","aKey");
removeUser("1");
insertChatroom("123", "chatroom1");
updateChatroomName("123", "somename");
removeChatroom("123");
checkEmail("emili@gmail.com").then((result)=>{
    console.log("emili@gmail.com not exist?", result);
})
checkEmail_Password_Pair("emili@gmail.com","yamato").then((result)=>{
    console.log("email-password pair exist? uid=", result);
})
checkVerificationKey("randomkeyYeah").then((result)=>{
    console.log("the verification code exist", result);
})
getMemberlistbyChatroomID("cr").then((result)=>{
    console.log("memberlist of chatroom cr1:", result, "no. of members= ",result.length);
})
getChatroomListbyUID("0").then((result)=>{
    console.log("chatroom id list of userid=1:", result, "no. of chatrooms= ",result.length);
})
*/

//sign-up
//check if email not exist => get rows by email => t: sign-up
//check if the verification key exists => get rows by verification key => t: can signup


//sign-in
//check if email-password pair exists (return value != -1: exist, else login fail)

//chatroom
//each member: show a list of chatroom they belongs to => get chatroom by memberid
//admin: show a list of members of that chatroom: get member by chatroomid

//other:
//delete a chatroom:(chatroomID)
//1. get a list of members of with chatroom id
//2. delete each member
//3. delete chatroomEntry


