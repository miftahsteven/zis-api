const config = require('../../config/config.db');
const mysql = require('mysql2');
const { password } = require('../../config/config.db');
const pool = mysql.createPool(config);
const { generate, generateDelete, verify } = require("../helper/auth-jwt");
const nodemailer = require("nodemailer");

pool.on('error',(err)=> {
    console.error(err);
});

function genCodeProgram() {
    var length = 5,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
 }


module.exports ={
    // GET ALL PROGRAM DATA
    
    getAllProgram(req,res){

        var pageSize = 10;
        var numberOfRows;
        var numberOfPages;
        var numberPerPage = parseInt(pageSize,10) || 1;
        //var page = parseInt(pageInfo.page, 10) || 1;
        var page = parseInt(req.query.page, 10) || 1;
        var skip = (page-1)  * numberPerPage;
        var limit = skip + ',' + numberPerPage;
        var search = req.query.search;
        var keyword;
        if(search != "" && search != undefined){
            keyword = `AND program_title like "%${search}%"`
        }else{
            keyword = ""
        }
        
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            let q = connection.query(
                `
                SELECT program_id, program_kode, program_title, 
                program_short_desc, program_start_date, program_end_date, 
                program_description, program_target_amount, 
                institusi_nama, institusi_no_hp, banners_path                
                FROM program JOIN institusi ON program_institusi_id = institusi_id  
                JOIN banners ON banners_program_id = program_id
                WHERE program_status = 1 and institusi_status = 1  ${keyword} ORDER BY program_id DESC;
                `
            , [],
            function (error, results, fields) {
                console.log(q.sql);
                if(error) { 
                    //throw error
                    res.send({ 
                        success: false,
                        code: 400,  
                        message: "Error: Something When Wrong",
                    });
                } else {                    
                                       
                   pool.getConnection(function(err2, connection2) {
                    if (err2) console.log(err2);
                    let r = connection2.query(
                        `
                        SELECT program_id, program_kode, program_title, 
                        program_short_desc, program_start_date, program_end_date, 
                        program_description, program_target_amount, 
                        institusi_nama, institusi_no_hp, banners_path                
                        FROM program JOIN institusi ON program_institusi_id = institusi_id  
                        JOIN banners ON banners_program_id = program_id
                        WHERE program_status = 1 and institusi_status = 1  ${keyword} ORDER BY program_id DESC LIMIT ${limit};
                        `
                    , [],
                    function (error2, results2, fields2) {
                        console.log("----><",r.sql);
                        if(error2) { 
                            //throw error
                            res.send({ 
                                success: false,
                                code: 400,  
                                message: "Error: Something When Wrong",
                            });
                        } else {                    
                           
                            if (results2.length > 0) {                        
                                numberOfRows = results.length;
                                numberOfPages = Math.ceil(numberOfRows / numberPerPage);
                                console.log("page: ",page, "numberOfPages", numberOfPages, "numberofrow: ", numberOfRows , "numberPerPage: ", numberPerPage);
                                res.send({ 
                                    success: true,
                                    code: 200,  
                                    message: "Sukses Ambil Data",
                                    data: results2,
                                    total: results2.length,
                                    pagination: {
                                                    current: page,
                                                    numberPerPage: numberPerPage,
                                                    has_previous: page > 1,
                                                    previous: page - 1,
                                                    has_next: page < numberOfPages,
                                                    next: page + 1,
                                                    last_page: Math.ceil(numberOfRows / pageSize)
                                                }
        
                                });
                                
                            } else {
                                res.send({ 
                                    success: true,
                                    code: 200,  
                                    message: "Sukses Ambil Data",
                                    data: results2,
                                    total: results.length2,
                                    pagination: {
                                                    current: page,
                                                    numberPerPage: numberPerPage,
                                                    has_previous: page > 1,
                                                    previous: page - 1,
                                                    has_next: page < numberOfPages,
                                                    next: page + 1,
                                                    last_page: Math.ceil(numberOfRows / pageSize)
                                                }
                                });
                            }	
                        }
                    });
                    connection2.release();
                })
                   
                }
            });
            connection.release();
        })
    },    

    getProgramHeadline(req,res){
        
        pool.getConnection(function(err, connection) {
            if (err) throw err;
            let q = connection.query(
                `
                SELECT program_id, program_kode, program_title, 
                program_short_desc, program_start_date, program_end_date, 
                program_description, program_target_amount, 
                institusi_nama, institusi_no_hp, banners_path                
                FROM program JOIN institusi ON program_institusi_id = institusi_id  
                JOIN banners ON banners_program_id = program_id
                WHERE program_status = 1 and institusi_status = 1 and program_isheadline = 1 ORDER BY program_id DESC;
                `
            , [],
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

    getProgramById(req,res){
        
        var id = req.params.id;

        pool.getConnection(function(err, connection) {
            if (err) throw err;
            let q = connection.query(
                `
                SELECT program_id, program_kode, program_title, 
                program_short_desc, program_start_date, program_end_date, 
                program_description, program_target_amount, 
                institusi_nama, institusi_no_hp, banners_path                
                FROM program JOIN institusi ON program_institusi_id = institusi_id  
                JOIN banners ON banners_program_id = program_id
                WHERE program_status = 1 and institusi_status = 1 and program_id = ? ORDER BY program_id DESC;
                `
            , [id],
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

    registerProgram(req,res){
            
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
