const config = require('../../config/config.db');
const mysql = require('mysql2');
const { password } = require('../../config/config.db');
const pool = mysql.createPool(config);
const { generate, generateDelete, verify } = require("../helper/auth-jwt");


pool.on('error',(err)=> {
    console.error(err);
});


module.exports ={
    // Get All Mustahiq Information
    getMustahiqById(req,res){
        let hd = req.user
	    let user_id = hd.user_id
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            let q = connection.query(
                `
                SELECT user_id, username, user_nama, user_phone, user_type, user_type_name, user_reg_date 
                FROM user JOIN user_type ON user_type = user_type_id 
                WHERE user_id = ?
                `
            , [user_id],
            function (error, results, fields) {
                if(error) { 
                    //throw error
                    res.send({ 
                        success: false,
                        code: 400,  
                        message: "Error: Something When Wrong",
                    });
                } else {                    
                   console.log(q.sql);
                    if (results.length > 0) {
                        
                        res.send({ 
                            success: true,
                            code: 200,  
                            message: "Sukses Ambil Data",
                            data: results
                        });
                        
                    } else {
                        res.send({ 
                            success: false,
                            code: 202,  
                            message: "Error: Get Data Failed",
                        });
                    }	
                }
            });
            connection.release();
        })
    },    

    pengajuanBantuan(req,res){
            
        let data = {
            program_kode : genCodeProgram(),
            program_title : req.body.title,
            program_short_desc : req.body.short_desc,
            program_start_date : req.body.start_date,
            program_end_date : req.body.end_date,
            program_description : req.body.description,
            program_institusi_id : req.body.institusi_id,
            program_target_amount : req.body.target_amount
        }


        pool.getConnection(function(err, connection) {
            if (err) throw err;

            let q = connection.query(
                `
                INSERT INTO program SET ?;
                `
            , [data],
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
                        message: "Sukses Daftar Program Baru"
                    });

                }
            })

        })
    
    }
    
}
