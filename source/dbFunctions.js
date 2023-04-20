var {dbconnection,closeConnection}= require('./db_connection.js')
function createUserID(){//update later(generate hash with entry index)
    return new Promise((resolve, reject)=>{
        dbconnection().then((con)=>{
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


function nonPwCheck(string){
    //word limit: 70
    return inputPreprocessing(string, 70);
}
function nameCheck(string){
    //word limit: 20
    return inputPreprocessing(string, 20);
}
function pwCheck(string){
    //word limit: 50
    return inputPreprocessing(string, 50);
}

function inputPreprocessing(str, limit){
    if ((str===null) || (str==='')) return false;
    else str = str.toString();//convert to string
    //remove html tag
    str = str.replace( /(<([^>]+)>)/ig, '');
    //length check
    if (str.length>= limit) str = str.slice(0, limit-1);
    //console.log("processed string = ", str, "length = ", str.length);

    return str;
}

var self = module.exports={

//modify tables
//users
//get number of rows in userTable
    addNewUser: function (uName, password, email, key){
        //max length: uName, password, email = 70 key =50
        uName=nameCheck(uName);        
        email=nonPwCheck(email);
        key=nonPwCheck(key);
        password=pwCheck(password);

        dbconnection().then((con)=>{
            createUserID().then((uid)=>{
                var sql = "INSERT INTO `user` (`UserID`, `UserName`, `Userpassword`, `email`, `verification_Key`, `last_login`) VALUES (?,?,MD5(?),?,?,Now())";
                con.query(sql, [uid, uName, password, email, key],function (err, data) {
                    if (err) throw err;
                    console.log("1 record inserted");
                    closeConnection(con);
                });
            });
        });
    },
    removeUser: function(uid){
        uid=nonPwCheck(uid);
        dbconnection().then((con)=>{
            var sql = "DELETE FROM `user` WHERE `user`.`UserID` = ?";
            con.query(sql, [uid],function (err, data) {
                if (err) throw err;
                console.log("1 record deleted");
                closeConnection(con);
            });
        });
    },
    updateUserName: function (uid, uName){
        uName=nameCheck(uName);
        uid=nonPwCheck(uid);

        dbconnection().then((con)=>{
            var sql = "UPDATE `user` SET `UserName` = ? WHERE `user`.`UserID` = ?;";
            con.query(sql, [uName, uid],function (err, data) {
                if (err) throw err;
                console.log("1 record updated");
                closeConnection(con);
            });
        });
    },
    updateUserPassword: function (uid, password){
        uid=nonPwCheck(uid);      
        password=pwCheck(password);
        dbconnection().then((con)=>{
            var sql = "UPDATE `user` SET `Userpassword` = MD5(?) WHERE `user`.`UserID` = ?;";
            con.query(sql, [password, uid],function (err, data) {
                if (err) throw err;
                console.log("1 record updated");
                closeConnection(con);
            });
        });
    },
    updateVerificationKey: function (uid, key){
        uid=nonPwCheck(uid);      
        key=nonPwCheck(key);
        dbconnection().then((con)=>{
            var sql = "UPDATE `user` SET `verification_Key` = ? WHERE `user`.`UserID` = ?;";
            con.query(sql, [key, uid],function (err, data) {
                if (err) throw err;
                console.log("1 record updated");
                closeConnection(con);
            });
        });
    },
    updateLastLogin: function (uid){//update last_login date
        uid=nonPwCheck(uid);      
        dbconnection().then((con)=>{
            var sql = "UPDATE `user` SET `last_login` = Now() WHERE `user`.`UserID` = ?";
            con.query(sql, [uid],function (err, data) {
                if (err) throw err;
                console.log("1 record updated");
                closeConnection(con);
            });
        });
    },

    //chatroom
    insertChatroom: function (crID, crName){
        dbconnection().then((con)=>{
            var sql = "INSERT INTO `chatroom` (`ChatroomID`, `ChatroomName`) VALUES (?, ?)";
            con.query(sql, [crID, crName],function (err, data) {
                if (err) throw err;
                console.log("1 record inserted");
                closeConnection(con);
        });
        });
    },
    removeChatroom: function (crID){
        dbconnection().then((con)=>{
            var sql = "DELETE FROM`chatroom` WHERE `chatroom`.`ChatroomID` = ?";
            con.query(sql, [crID],function (err, data) {
                if (err) throw err;
                console.log("1 record deleted");
                closeConnection(con);
            });
        });
    },
    updateChatroomName: function (crID, crName){
        dbconnection().then((con)=>{
            var sql = "UPDATE `chatroom` SET `ChatroomName` = ? WHERE `chatroom`.`ChatroomID` = ?";
            con.query(sql, [crName,crID],function (err, data) {
                if (err) throw err;
                console.log("1 record updated");
                closeConnection(con);
            });
        });
    },
    //member
    insertMember: function (crID, uid, admin){
        dbconnection().then((con)=>{
            var sql = "INSERT INTO `member` (`ChatroomID`, `UserID`, `admin`) VALUES (?,?,?)";
            con.query(sql, [crID, uid, admin],function (err, data) {
                if (err) throw err;
                console.log("1 member inserted");
                closeConnection(con);
            });
        });
    },
    removeMember: function (crID, uid){ //removeMember/quit chatroom: 
        dbconnection().then((con)=>{
            var sql = "DELETE FROM `member` WHERE `ChatroomID`=? AND `UserID`=?";
            con.query(sql, [crID, uid],function (err, data) {
                if (err) throw err;
                console.log("1 member removed");
                closeConnection(con);
            });
        });
    },
    updateMember: function (crID, uid, admin){ //admin=1: admin, admin=0: ordinary member
        dbconnection().then((con)=>{
            var sql = "UPDATE `member` SET `admin`=? WHERE `ChatroomID`=? AND `UserID`=?";
            con.query(sql, [admin,crID, uid],function (err, data) {
                if (err) throw err;
                console.log("1 member updated");
                closeConnection(con);
            });
        });
    },

    //retrieve & check information from table
    //user
    checkEmail: function (email){
        //return true if email does not exist in the db, else false
        email=nonPwCheck(email);      
        return new Promise((resolve, reject)=>{
            var numRows = 0;
            var sql =" SELECT * FROM `user` WHERE `email` = ?";
            console.log("email=",email);
            dbconnection().then((con)=>{
                con.query(sql,[email],function (err, data) {
                if (err) throw err;
                numRows=data.length;
                closeConnection(con);
                console.log(numRows,"numRows==0?",numRows==0);
                resolve(numRows==0);
                });
            }); 
        })
    },
    checkEmail_Password_Pair: function (email, password){//login function
        //return UserID if there exist a email-password pair, else -1
        console.log("emali = ",email);
        console.log("password = ", password);

        email=nonPwCheck(email);      
        password=pwCheck(password);
        return new Promise((resolve, reject)=>{
            var uid = -1;
            var sql =" SELECT * FROM `user` WHERE `email` = ? AND `Userpassword` = MD5(?)";
            dbconnection().then((con)=>{
                con.query(sql,[email, password],function (err, data) {
                if (err) throw err;
                // iterate for all the rows in result
                Object.keys(data).forEach(function(key) {
                    console.log("UID = ",data[key].UserID);
                    uid = data[key].UserID;
                });
                closeConnection(con);
                resolve(uid);
                });
            }); 
        });
    },
    checkVerificationKey: function (key){
        key=nonPwCheck(key);      
        //return true if the verification key exists
        return new Promise((resolve, reject)=>{
            var numRows = 0;
            var sql =" SELECT * FROM `user` WHERE `verification_Key` = ?";
            dbconnection().then((con)=>{
                con.query(sql,[key],function (err, data) {
                if (err) throw err;
                numRows=data.length;
                closeConnection(con);
                resolve(numRows!=0);
                });
            }); 
        })
    },
    getUIDbyKey: function(key){
        key=nonPwCheck(key);
        console.log("key=", key);      
        return new Promise((resolve, reject)=>{
            var uid="";
            var sql =" SELECT * FROM `user` WHERE `verification_Key` = ?";
            dbconnection().then((con)=>{
                con.query(sql,[key],function (err, data) {
                if (err) throw err;
                // iterate for all the rows in result
                Object.keys(data).forEach(function(key) {
                    uid = data[key].UserID;
                });
                closeConnection(con);
                console.log("uid=", uid);
                resolve(uid);
                });
            }); 
        });

    },
    getUNamebyID: function(uid){
        uid=nonPwCheck(uid);      
        return new Promise((resolve, reject)=>{
            var uName="";
            var sql =" SELECT * FROM `user` WHERE `UserID` = ?";
            dbconnection().then((con)=>{
                con.query(sql,[uid],function (err, data) {
                if (err) throw err;
                // iterate for all the rows in result
                Object.keys(data).forEach(function(key) {
                    uName = data[key].UserName;
                });
                closeConnection(con);
                resolve(uName);
                });
            }); 
        });

    },
    getLastLoginbyID: function(uid){
        uid=nonPwCheck(uid);      
        return new Promise((resolve, reject)=>{
            var date="";
            var sql =" SELECT * FROM `user` WHERE `UserID` = ?";
            dbconnection().then((con)=>{
                con.query(sql,[uid],function (err, data) {
                if (err) throw err;
                // iterate for all the rows in result
                Object.keys(data).forEach(function(key) {
                    date = data[key].last_login;
                });
                closeConnection(con);
                resolve(date);
                });
            }); 
        });

    },

    //member
    getChatroomListbyUID: function (uid){
        return new Promise((resolve, reject)=>{
            var chatrooms=[];
            var sql ="SELECT * FROM `member` WHERE `UserID`= ?";
            dbconnection().then((con)=>{
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
    },

    getMemberlistbyChatroomID: function(crid){
        return new Promise((resolve, reject)=>{
            var members=[];
            var sql ="SELECT * FROM `member` WHERE `ChatroomID`= ?";
            dbconnection().then((con)=>{
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
    },
    registerUserInformation: function(key, name, pw){
        return new Promise((resolve, reject)=>{
            //console.log("call registeruser infor");
            self.getUIDbyKey(key).then((id)=>{
                //1. key exist?
                //2. last-log in date            
                console.log("user id of key=",key,":", id, "= ",id.length);
                if (id.length!=0){
                    //check last login date
                    self.getLastLoginbyID(id).then((date)=>{
                        var todayDate = new Date().toLocaleDateString();
                        //console.log("js date() = ",todayDate);
                        date=date.toLocaleDateString();
                        //console.log(todayDate==date);

                        if (date==todayDate){
                            var newKey=' ';
                            this.updateUserName(id, name);
                            this.updateUserPassword(id,pw);
                            this.updateVerificationKey(id,newKey);
                        }                    
                    })
                }
            })
            resolve (true);
        })
        
    }
}
//detect script

//check user name
//check 


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
/*
var functions = require('./dbFunctions.js');
//functions.updateUserPassword(5,"");
functions.registerUserInformation("k2","n2","pw2");
*/

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
