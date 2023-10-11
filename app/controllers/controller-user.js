const config = require('../../config/config.db');
const mysql = require('mysql2');
const md5 = require('md5');
const { password } = require('../../config/config.db');
const pool = mysql.createPool(config);
const { generate, generateDelete, verify } = require("../helper/auth-jwt");
const nodemailer = require("nodemailer");
const { use } = require('../routes/route-auth');

pool.on('error',(err)=> {
    console.error(err);
});

function deteksiOperatorSeluler(phone){
    const prefix = phone.slice(0, 4);
    //if (['0831', '0832', '0833', '0838'].includes(prefix)) return 'axis';
    //if (['0895', '0896', '0897', '0898', '0899'].includes(prefix)) return 'three';
    //if (['0817', '0818', '0819', '0859', '0878', '0877'].includes(prefix)) return 'xl';
    if (['0814', '0815', '0816', '0855', '0856', '0857', '0858'].includes(prefix)) return 'indosat';
    //if (['0812', '0813', '0852', '0853', '0821', '0823', '0822', '0851', '0811'].includes(prefix)) return 'telkomsel';
    //if (['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'].includes(prefix)) return 'smartfren';
    return null;
}


function genPassword() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
 }

sendEmail = async (email, subject, text, html) => {

    const transporter = nodemailer.createTransport({        
        //host: "smtp.gmail.com",
        host: "mail.zisindosat.id",
        port: 465,
        secure: true,
        // tls: true,
        auth: {
          // TODO: replace `user` and `pass` values from <https://forwardemail.net>
          //user: "miftahsteven@gmail.com",
          //pass: "fhgtzhirmjsbpaxt",
          user: "admin@zisindosat.id",
          pass: "ziswaf2019" 
        },
        // tls: {
        //     // do not fail on invalid certs
        //     rejectUnauthorized: false,
        //   },
      });

    const info = await transporter.sendMail({
        from: 'admin@zisindosat.id', 
        to: email, 
        subject: subject, 
        text: text,
        html: html
      });

      console.log("Message sent: %s", info.messageId); 

      return info.messageId;

} 

module.exports ={
    // LOGIN USER    
    loginUser(req,res){
        
        let username = req.body.username;
        let userpasswd = req.body.password;
        console.log("---->",username);
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            let q = connection.query(
                `
                SELECT * FROM user WHERE username = ? and user_password = MD5(?);
                `
            , [username, userpasswd],
            function (error, results, fields) {
                if(error) { 
                    //throw error
                    res.send({ 
                        success: false,
                        code: 202,  
                        message: "ERROR KONEKSI DATABASE",
                    });
                } else {                    
                   console.log(q.sql);

                    if (results.length > 0) {

                        if(results[0].user_status == 0){
                            res.send({ 
                                success: false,
                                code: 205,  
                                message: "Username Belum Melakukan Verifikasi Email",
                            });                                
                        }else{

                            const payload = {
                                user_id: results[0]["user_id"], 
                                username: results[0]["username"],
                                nama: results[0]["user_nama"],
                                phone: results[0]["user_phone"], 
                                type: results[0]["user_type"], 
                            };
                            const update_token = generate(payload, null);
                            
                            pool.getConnection(function(err2, connection2) {
                                if (err2) console.log(err2);

                                let id = results[0]["user_id"]     

                                let dataUpdate = {
                                    user_token : update_token                             
                                }
                                let q0 = connection2.query(
                                    `
                                    UPDATE user SET ? WHERE user_id = ?;
                                    `
                                , [dataUpdate,id],
                                function (error2, results2, fields2) {
                                    console.log(q0.sql)
                                    if(error2) { 
                                        //throw error
                                        res.send({ 
                                            success: false,
                                            code: 202,  
                                            message: "Login Gagal",
                                        });
                                    } else {                   
                                        results[0]["user_password"] = undefined;      
                                        results[0]["user_token"] = undefined;                                     
                                        console.log(q0.sql);
                                        res.send({ 
                                            success: true, 
                                            message: 'Login Berhasil!',                                        
                                            session_id: md5(results[0]["username"]),                                        
                                            token: update_token,
                                            data: results
                                        });
                                    }
                                });
                                connection2.release();
                            })
                        }

                    } else {
                        res.send({ 
                            success: false,
                            code: 201,  
                            message: "Username dan Password Salah",
                        });
                    }	
                }
            });
            connection.release();
        })
    },    
    registerUser(req,res){

        const passwordUser = genPassword();

        //if(deteksiOperatorSeluler(req.body.phone))
        
        let data = {
            user_type : req.body.type,
            username : req.body.email,
            user_nama : req.body.nama,
            user_phone : req.body.phone,
            user_password : md5(passwordUser)
        }


        pool.getConnection(function(err, connection) {
            if (err) throw err;

            let q = connection.query(
                `
                INSERT INTO user SET ?;
                `
            , [data],
            function (error, results) {
                console.log(q.sql);
                if(error) { 
                    console.log(error);
                    if(error.errno == "1062"){
                        res.send({ 
                            success: false,
                            code: error.errno,  
                            //message: error.sqlMessage,
                            message: "Ada Duplikat Data Nomor Handphone/NIK"
                        });
                    }else{
                        res.send({ 
                            success: false,
                            code: error.errno,  
                            //message: error.sqlMessage,
                            message: "Gagal Tambah Data"
                        });
                    }

                }else{
                    let akunEmail = req.body.email;
                    let encodedEmail = Buffer.from(akunEmail).toString('base64');
                                        
                    let subjectEmail = "Pendaftaran Ziswaf INDOSAT";
                    let textEmail = "Assalamu'alaikum, Wr Wb. \n\n Terima Kasih Telah Mendaftar sebagai Mustahiq Ke Ziswaf INDOSAT. \n\n Berikut ini adalah detail login anda : \n\n Username : "+ akunEmail +" \n\n Password : "+passwordUser+" \n\n. Untuk melanjutkan proses registrasi dan agar anda bisa melakukan login, silahkan lakukan Verifikasi terlebih dahulu, dengan melakukan klik pada link berikut \n\n. https://portal.zisindosat.id/verifikasi/?akun="+encodedEmail+".\n\n Terima kasih atas partisipasi anda. \n\n Wassalamu'alaikum Wr, Wb";
                    let htmlEmail = "Assalamu'alaikum, Wr Wb. <br /> Terima Kasih Telah Mendaftar sebagai Mustahiq Ke Ziswaf INDOSAT. <br /> Berikut ini adalah detail login anda : <br/> Username : "+ akunEmail +" <br /> Password : "+passwordUser+" <br/> Untuk melanjutkan proses registrasi dan agar anda bisa melakukan login, silahkan lakukan Verifikasi terlebih dahulu, dengan melakukan klik pada link berikut <br/><br/>.<a href='https://portal.zisindosat.id/verifikasi/?akun="+encodedEmail+"'>VERIFIKASI AKUN</a>.<br/><br/> Terima kasih atas partisipasi anda. <br/> Wassalamu'alaikum Wr, Wb";
                    const idmessage = sendEmail(akunEmail, subjectEmail, textEmail, htmlEmail);
                    if(idmessage != undefined){
                        res.send({ 
                            success: true,
                            code: 200,                              
                            message: "Sukses Daftar User Baru"
                        });
                    }else{
                        res.send({ 
                            success: false,
                            code: error.errno,  
                            //message: error.sqlMessage,
                            message: "Gagal Kirim Email Password"
                        });
                    }

                }
            })

        })    
    },

    updateUser(req,res){

        let hd = req.user
	    let user_id = hd.user_id
            
        let data = {            
            user_nama : req.body.nama,
            user_phone : req.body.phone,            
        }

        pool.getConnection(function(err, connection) {
            if (err) throw err;

            let q = connection.query(
                `
                UPDATE user SET ? WHERE user_id = ?;
                `
            , [data, user_id],
            function (error, results) {
                console.log(q.sql);
                if(error) { 
                    console.log(error);
                        res.send({ 
                            success: false,
                            code: error.errno,  
                            message: error.sqlMessage,
                            message: "Error : Something When Wrong"
                        });

                }else{

                    res.send({ 
                        success: true,
                        code: 200,                              
                        message: "User Data Updated"
                    });

                }
            })

        })
    
    },

    updatePasswordWithAuth(req,res){

        let hd = req.user
	    let user_id = hd.user_id
            
        let data = {            
            user_password : md5(req.body.password)
        }

        pool.getConnection(function(err, connection) {
            if (err) throw err;

            let q = connection.query(
                `
                UPDATE user SET ? WHERE user_id = ?;
                `
            , [data, user_id],
            function (error, results) {
                console.log(q.sql);
                if(error) { 
                    console.log(error);
                        res.send({ 
                            success: false,
                            code: error.errno,  
                            message: error.sqlMessage,
                            message: "Error : Something When Wrong"
                        });

                }else{

                    res.send({ 
                        success: true,
                        code: 200,                              
                        message: "Success : Password Updated "
                    });

                }
            })

        })
    
    },

    updatePassword(req,res){

        let username = atob(req.body.username)
            
        let data = {            
            user_password : md5(req.body.password)
        }

        pool.getConnection(function(err, connection) {
            if (err) throw err;

            let q = connection.query(
                `
                UPDATE user SET ? WHERE username = ?;
                `
            , [data, username],
            function (error, results) {
                console.log(q.sql);
                if(error) { 
                    console.log(error);
                        res.send({ 
                            success: false,
                            code: error.errno,  
                            message: error.sqlMessage,
                            message: "Error : Something When Wrong"
                        });

                }else{

                    res.send({ 
                        success: true,
                        code: 200,                              
                        message: "Success : Password Updated "
                    });

                }
            })

        })
    
    },

    resetPassword(req,res){

        let username = req.body.username;
        
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            let q = connection.query(
                `
                SELECT user_id FROM user WHERE username = ?
                `
            , [username],
            function (error, results, fields) {
                if(error) { 
                    //throw error
                    res.send({ 
                        success: false,
                        code: 400,  
                        message: "Error: Something When Wrong",
                    });
                } else {                    
                    
                    let encodedUsername = Buffer.from(username).toString('base64');
                   console.log(q.sql);
                    if (results.length > 0) {                        
                        let subjectEmail = "Reset Password Ziswaf INDOSAT";
                        let textEmail = "Assalamu'alaikum, Wr Wb. \n\nKami telah menerima permintaanmu untuk melakukan reset password. Untuk melanjutkan pergantian password silakan klik tautan berikut . \n\nhttps://api.zisindosat.id/ubahpassword/"+encodedUsername+" \n\n\nTerima kasih.";
                        let htmlEmail = "Assalamu'alaikum, Wr Wb. <br/>Kami telah menerima permintaanmu untuk melakukan reset password. Untuk melanjutkan pergantian password silakan klik tautan berikut . <br/><a href='https://portal.zisindosat.id/ubahpassword"+encodedUsername+"'> UBAH PASSWORD </a> <br/><br/>Terima kasih.";
                        const idmessage = sendEmail(username, subjectEmail, textEmail, htmlEmail);
                        if(idmessage != undefined){
                            res.send({ 
                                success: true,
                                code: 200,                              
                                message: "Success : Email Sent For Reset Password"
                            });
                        }else{
                            res.send({ 
                                success: false,
                                code: error.errno,  
                                //message: error.sqlMessage,
                                message: "Failed : Email Not Sent"
                            });
                        }
                        
                        
                    } else {
                        res.send({ 
                            success: false,
                            code: 200,  
                            message: "Data Empty",
                        });
                    }	
                }
            });
            connection.release();
        })


    },

    verifiedUser(req,res){
            
        let email = req.body.email

        //console.log(email);

        let data = {
            user_status : 1
        }

        pool.getConnection(function(err, connection) {
            if (err) throw err;

            let q = connection.query(
                `
                UPDATE user SET ? WHERE username = ?;
                `
            , [data, email],
            function (error, results) {
                console.log(q.sql);
                if(error) { 
                    console.log(error);
                        res.send({ 
                            success: false,
                            code: error.errno,  
                            message: error.sqlMessage,
                            message: "Error : Something When Wrong"
                        });

                }else{

                    res.send({ 
                        success: true,
                        code: 200,                              
                        message: "User Verified"
                    });

                }
            })

        })
    
    },
}
