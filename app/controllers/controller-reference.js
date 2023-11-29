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
}