const config = require('../../config/config.db');
//const mysql = require('mysql2');
const { password } = require('../../config/config.db');
//const pool = mysql.createPool(config);
const { prisma } = require("../../prisma/client");
const { generate, generateDelete, verify } = require("../helper/auth-jwt");
const mt940js = require('mt940js');
//const parser = require('swiftmessageparser');
const parser  = new mt940js.Parser();
const fs = require('fs');
const { z } = require("zod");

// pool.on('error',(err)=> {
//     console.error(err);
// });


module.exports ={
    // Get All Mustahiq Information
    

    async getDataMt940(req,res){
            
        const statements = parser.parse(fs.readFileSync('uploads/mt940/MT940_Siswaf.txt', 'utf8'));

        let dataTrans = [];

        for (let s of statements) {
            //console.log(s.number.statement, s.statementDate, parseInt((s.accountIdentification).replace(/\s/g, '')), s.closingBalance);
            
            for (let t of s.transactions) {
            //console.log(t.date, "DETAIL : ", t.amount, "Ref", t.details, "TYPE: ", t.transactionType, "FUNDSCODE: ", t.fundsCode);
                      
            dataTrans.push({
                  account_number: (s.accountIdentification).replace(/\s/g, ''),
                  trans_ref: s.transactionReference,
                  bank_date: (s.statementDate).toString(),
                  state_num: s.number.statement, 
                  currency: s.currency,
                  ob_amount: (s.openingBalance).toString(),
                  ob_ind: Number(s.openingBalance) < 0 ? "D":"C",
                  eb_amount: (s.closingBalance).toString(),
                  eb_ind: Number(s.closingBalance) < 0 ? "D":"C",
                  trans_date: (t.date).toString(),
                  trans_type: t.transactionType,
                  trans_amount: (t.amount).toString(),
                  trans_id: Number(t.amount) < 0 ? "D":"C",
                  text_info: (t.details).toString(),
                  ebs_filename: "MT940_Siswaf.txt"
            })

            console.log(JSON.stringify(dataTrans))
          
          }
                        
            await prisma.ebs_staging.createMany({
                data: dataTrans,
              });
        
              res.status(200).json({
                message: "Sukses Generate Data MT940",
              });

              // res.send({ 
              //     success: true,
              //     code: 200,  
              //     message: "GET DATA SUCCESS",
              // });
            // } catch (error) {
            //   return res.status(500).json({
            //     message: error?.message,
            //   });
            // }

            //}
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

    },

    async dataMt940(req, res) {
      try {
        const page = Number(req.query.page || 1);
        const perPage = Number(req.query.perPage || 10);
        const status = Number(req.query.status || 4);
        const skip = (page - 1) * perPage;
        const keyword = req.query.keyword || "";
        const user_type = req.query.user_type || "";
        const category = req.query.category || "";
        const sortBy = req.query.sortBy || "id";
        const sortType = req.query.order || "asc";
  
        const params = {                    
          text_info: {
            contains: keyword,
          },            
        };
  
        const [count, bank] = await prisma.$transaction([
          prisma.ebs_staging.count({
            where: params,
          }),
          prisma.ebs_staging.findMany({              
            orderBy: {
              [sortBy]: sortType,
            },
            where: params,         
            skip,
            take: perPage,
          }),
        ]);
  
        const bankResult = await Promise.all(
          bank.map(async (item) => {
            
  
            return {
              ...item
              //program_target_amount: Number(item.program_target_amount),
              //total_donation: total_donation._sum.amount || 0,
            };
          })
        );
  
        res.status(200).json({
          // aggregate,
          message: "Sukses Ambil Data",
  
          data: bankResult,
          pagination: {
            total: count,
            page,
            hasNext: count > page * perPage,
            totalPage: Math.ceil(count / perPage),
          },
        });
      } catch (error) {
        res.status(500).json({
          message: error?.message,
        });
      }
    },

    async listbank(req, res) {
      try {
        //const userId = req.user_id;
  
        const bank = await prisma.bank_account.findMany({
          
        });
  
        if (!bank) {
          return res.status(404).json({
            message: "Bank tidak ditemukan",
          });
        }
  
        
  
        return res.status(200).json({
          message: "Sukses",
          data: bank,
        });
      } catch (error) {
        return res.status(500).json({
          message: error?.message,
        });
      }
    },

    async statementCreate(req, res) {
      try {
        
        const schema = z.object({          
          no_rekening: z.string({ required_error: "No Rekening Harus Diis" }).min(5),
          bank: z.number().optional()
        });

        const file = req.file;
        if (!file) {
          return res.status(400).json({
            message: "File MT940 Tidak Boleh Kosong",
          });
        }

        const maxSize = 5000000;
        if (file.size > maxSize) {
          await fs.unlink(file.path);

          return res.status(400).json({
            message: "Ukuran File terlalu Besar",
          });
        }
        
                          
        const {
          filename,
          path,          
          bank,
          no_rekening          
        } = req.body;
  
        //console.log(JSON.stringify(req.body))
          
        const glResult = await prisma.mt_file.create({
          data: {
            filename : `${file.filename}`,
            path: `uploads/${file.filename}`,          
            bank,
            no_rekening,
            user_id: userId
          },
        });
  
        return res.status(200).json({
          message: "Sukses",
          data: glResult,
        });
      } catch (error) {
            
        return res.status(500).json({
          message: "Internal Server Error",
          error: error.message,
        });
      }
    },
    
}
