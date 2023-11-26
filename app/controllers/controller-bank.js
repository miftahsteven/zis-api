const config = require('../../config/config.db');
//const mysql = require('mysql2');
const { password } = require('../../config/config.db');
//const pool = mysql.createPool(config);
const { prisma } = require("../../prisma/client");
const { generate, generateDelete, verify } = require("../helper/auth-jwt");
//const mt940js = require('mt940js');
const parser = require('swiftmessageparser');
//const parser  = new mt940js.Parser();
const fs = require('fs');


// pool.on('error',(err)=> {
//     console.error(err);
// });


module.exports ={
    // Get All Mustahiq Information
    

    async getDataMt940(req,res){
            
        const statements = parser.parse(fs.readFileSync('uploads/mt940/MT940_Siswaf.txt', 'utf8'));

        for (let s of statements) {
            console.log(s.number.statement, s.statementDate, parseInt((s.accountIdentification).replace(/\s/g, '')), s.closingBalance);
            
            for (let t of s.transactions) {
            console.log(t.date, "DETAIL : ", t.amount, "Ref", t.details, "TYPE: ", t.transactionType, "FUNDSCODE: ", t.fundsCode);
               
            await prisma.ebs_staging.create({
                data: {                  
                  account_number: (s.accountIdentification).replace(/\s/g, ''),
                  trans_ref: s.transactionReference,
                  bank_date: (s.statementDate).toString(),
                  state_num: s.number.statement, 
                  currency: s.currency,
                  ob_amount: (t.amount).toString(),
                  ob_ind: Math.sign(t.amount) === "-1"? "D":"C",
                  trans_date: (t.date).toString(),
                  trans_type: t.transactionType,
                  trans_amount: (t.amount).toString()                                  
                },
              });
        
              res.status(200).json({
                message: "Sukses donasi",
              });
            // } catch (error) {
            //   return res.status(500).json({
            //     message: error?.message,
            //   });
            // }

            }
        }
        
        
        // res.send({ 
        //     success: true,
        //     code: 200,  
        //     message: "GET DATA SUCCESS",
        // });
    
    },

    async parsemt940 (req, res){

        const statements = parser.parse({
            type: 'mt940',
            data: fs.readFileSync('uploads/mt940/MT940_Siswaf.txt', 'utf8'),
          });
          
         for (let s of statements) {
             console.log(s.forwardAvailableBalance);
         }
         
         res.send({ 
            success: true,
            code: 200,  
            message: "GET DATA SUCCESS",
        });

    }
    
}
