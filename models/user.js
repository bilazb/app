let connection = require('../config/db');
const { request } = require('express');
class User {
    static create(content, cb){
        connection.query('SELECT username, email FROM users',(error,results)=>{
            let bool = false;
            results.forEach(e => {
                if(content.username == e.username || content.email == e.email){
                    bool = true;
                }
            });
            if(bool == false){
                connection.query('INSERT INTO users SET firstname = ?, lastname = ?, username = ?, email = ?, password = ?, created_at = ?', [content.firstname, content.lastname, content.username, content.email, content.pass, new Date()], function (error, results) {
                    if (error) throw error;
                    cb("good", "You Are Registered On Our Website Click On Login To Connect");
                });
            }
            else{
                cb("error", "Existing Username Or Email");
            }
        });
       
    }

    static login(cb){
        connection.query('SELECT username, email, password FROM users', function (error, results) {
            if (error) throw error;
            cb(results);
        });
    }
}

module.exports = User;