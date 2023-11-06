const { prisma } = require("../../prisma/client");
const fs = require("fs");

module.exports = {
  async details(req, res) {
    const userId = req.user_id;

    return res.status(200).json({
      userId,
    });
  },

  async create(req, res) {
    try {
      const userId = req.user_id;

      const ktp_url = req.files?.ktp_file?.[0].path;
      const kk_url = req.files?.kk_file?.[0].path;

      if (!ktp_url || !kk_url) {
        if (ktp_url) {
          fs.unlinkSync(ktp_url);
        }
        if (kk_url) {
          fs.unlinkSync(kk_url);
        }
        return res.status(400).json({
          message: "KTP dan KK harus diisi",
        });
      }

      const {
        address,
        bank_account_name,
        emergency_contact_name,
        emergency_contact_number,
        bank_name,
        bank_number,
        imkas_number,
        is_institusi,
        institusi_nama,
        institusi_no_hp,
      } = req.body;

      if (is_institusi) {
        await prisma.user.update({
          where: {
            user_id: userId,
          },
          data: {
            institusi: {
              create: {
                institusi_nama,
                institusi_no_hp,
              },
            },
          },
        });
      }

      const mustahiqResult = await prisma.mustahiq.create({
        data: {
          user: {
            connect: {
              user_id: userId,
            },
          },
          kk_url: `uploads/${req.files?.ktp_file?.[0].filename}`,
          ktp_url: `uploads/${req.files?.kk_file?.[0].filename}`,
          address,
          emergency_contact_name,
          emergency_contact_number,
          bank_name,
          bank_number,
          bank_account_name,
          imkas_number,
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: mustahiqResult,
      });
    } catch (error) {
      const ktp_url = req.files?.ktp_file?.[0].path;
      const kk_url = req.files?.kk_file?.[0].path;

      if (ktp_url) {
        fs.unlinkSync(ktp_url);
      }
      if (kk_url) {
        fs.unlinkSync(kk_url);
      }

      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
};
