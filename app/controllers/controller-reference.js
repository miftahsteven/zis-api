const { prisma } = require("../../prisma/client");
const fs = require("fs/promises");

const { customAlphabet } = require("nanoid");
const { z } = require("zod");

module.exports = {
    async provinces(req, res) {
        try {
          //const userId = req.user_id;
    
          const province = await prisma.provinces.findMany({
            
          });
    
          if (!province) {
            return res.status(404).json({
              message: "Province tidak ditemukan",
            });
          }
    
          
    
          return res.status(200).json({
            message: "Sukses",
            data: province,
          });
        } catch (error) {
          return res.status(500).json({
            message: error?.message,
          });
        }
      },
      
      async cities(req, res) {
        try {
          const id = req.params.id;
    
          const cities = await prisma.cities.findMany({
            where: {
                prov_id: Number(id)               
              },
          });
    
          if (!cities) {
            return res.status(404).json({
              message: "City tidak ditemukan",
            });
          }
    
          
    
          return res.status(200).json({
            message: "Sukses",
            data: cities,
          });
        } catch (error) {
          return res.status(500).json({
            message: error?.message,
          });
        }
      },

      async districts(req, res) {
        try {
          const id = req.params.id;
    
          const district = await prisma.districts.findMany({
            where: {
                city_id: Number(id)               
              },
          });
    
          if (!district) {
            return res.status(404).json({
              message: "Kecematan tidak ditemukan",
            });
          }
    
          
    
          return res.status(200).json({
            message: "Sukses",
            data: district,
          });
        } catch (error) {
          return res.status(500).json({
            message: error?.message,
          });
        }
      },

      async gltype(req, res) {
        try {
          //const id = req.params.id;
    
          const gltype = await prisma.gl_account_type.findMany({
            // where: {
            //     id: Number(id)               
            //   },
          });
    
          if (!gltype) {
            return res.status(404).json({
              message: "Data GL Type tidak ditemukan",
            });
          }
    
          
    
          return res.status(200).json({
            message: "Sukses",
            data: gltype,
          });
        } catch (error) {
          return res.status(500).json({
            message: error?.message,
          });
        }
      },
      async glaccount(req, res) {
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
            gl_name: {
              contains: keyword,
            },            
          };
    
          const [count, gla] = await prisma.$transaction([
            prisma.gl_account.count({
              where: params,
            }),
            prisma.gl_account.findMany({
              include:{
                gl_account_type:true
              },
              orderBy: {
                [sortBy]: sortType,
              },
              where: params,         
              skip,
              take: perPage,
            }),
          ]);
    
          const glResult = await Promise.all(
            gla.map(async (item) => {
              
    
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
    
            data: glResult,
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

      async createGlAccount(req, res) {
        try {
          const userId = req.user_id;
                    
          const {
            coa,
            description,
            gl_account,
            gl_group,
            gl_name,
            status,
            gl_type
          } = req.body;
    
          //console.log(JSON.stringify(req.body))
            
          const glResult = await prisma.gl_account.create({
            data: {
              gl_account_type: {
                connect: {
                  id: Number(gl_type),
                },
              },              
              coa,
              description,
              gl_account,
              gl_group,
              gl_name,
              status              
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
      async updateGlAccount(req, res) {
        try {
          const id = req.params.id;
                    
          const {
            coa,
            description,
            gl_account,
            gl_group,
            gl_name,
            status,
            gl_type
          } = req.body;
    
          //console.log(JSON.stringify(req.body))
            
          const glResult = await prisma.gl_account.update({
            where: {
              id: Number(id),
            },
            data: {
              gl_account_type: {
                connect: {
                  id: Number(gl_type),
                },
              },              
              coa,
              description,
              gl_account,
              gl_group,
              gl_name,
              status              
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
      async deleteGL(req, res) {
        try {
          const id = req.body.id;
    
          await prisma.gl_account.delete({
            where: {
              id: Number(id),
            }        
          });
    
          return res.status(200).json({
            message: "Sukses",
            data: "Berhasil Update Data",
          });
        } catch (error) {
          return res.status(500).json({
            message: error?.message,
          });
        }
      },



      async masterbank(req, res) {
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
            bank_name: {
              contains: keyword,
            },            
          };
    
          const [count, bank] = await prisma.$transaction([
            prisma.bank_account.count({
              where: params,
            }),
            prisma.bank_account.findMany({              
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

      async createMasterBank(req, res) {
        try {
                    
          const {
            bank_name,
            bank_number
          } = req.body;
    
          //console.log(JSON.stringify(req.body))
            
          const bankResult = await prisma.bank_account.create({
            data: {                         
              bank_name,
              bank_number           
            },
          });
    
          return res.status(200).json({
            message: "Sukses",
            data: bankResult,
          });
        } catch (error) {
              
          return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
          });
        }
      },
      async updateBank(req, res) {
        try {
          const id = req.params.id;
                    
          const {
            bank_name,
            bank_number
          } = req.body;
    
          //console.log(JSON.stringify(req.body))
            
          const bankResult = await prisma.bank_account.update({
            where: {
              id: Number(id),
            },
            data: {
              bank_name,
              bank_number             
            },
          });
    
          return res.status(200).json({
            message: "Sukses",
            data: bankResult,
          });
        } catch (error) {
              
          return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
          });
        }
      },
      async deleteBank(req, res) {
        try {
          const id = req.body.id;
    
          await prisma.bank_account.delete({
            where: {
              id: Number(id),
            }        
          });
    
          return res.status(200).json({
            message: "Sukses",
            data: "Berhasil Update Data",
          });
        } catch (error) {
          return res.status(500).json({
            message: error?.message,
          });
        }
      },
}