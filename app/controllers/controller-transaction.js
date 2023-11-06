const config = require('../../config/config.db');
const mysql = require('mysql2');
const { password } = require('../../config/config.db');
const pool = mysql.createPool(config);
const { generate, generateDelete, verify } = require("../helper/auth-jwt");
const mt940js = require('mt940js');
const parser  = new mt940js.Parser();
const fs = require('fs');


pool.on('error',(err)=> {
    console.error(err);
});


module.exports ={
    // Get All Mustahiq Information
    

    getDataMt940(req,res){
            
        const statements = parser.parse(fs.readFileSync('uploads/mt940/MT940_Siswaf.txt', 'utf8'));

        for (let s of statements) {
            console.log(s.number.statement, s.statementDate, s.accountIdentification);
            
            for (let t of s.transactions) {
              console.log(t.date, "DETAIL : ", t.amount, "Ref", t.details, "TYPE: ", t.transactionType, "FUNDSCODE: ", t.fundsCode, "");
              
            }
        }
        
        
        res.send({ 
            success: true,
            code: 200,  
            message: "GET DATA SUCCESS",
        });
    
    }
    
}
