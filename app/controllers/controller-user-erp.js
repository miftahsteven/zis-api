const { generate } = require("../helper/auth-jwt");
const { prisma } = require("../../prisma/client");
const { z } = require("zod");
const { nanoid } = require("nanoid");
const argon2 = require("argon2");
const { generateTemplate, sendEmail, generateTemplateForgotEmail } = require("../helper/email");
const crypto = require("node:crypto");

module.exports = {
  // LOGIN USER ERP
  async loginUser(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          message: "Username atau Password Salah",
        });
      }

      const user = await prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (!user) {
        return res.status(400).json({
          message: "Username atau Password Salah",
        });
      }

      const passwordMatch = await argon2.verify(user.user_password, password);
      if (!passwordMatch) {
        return res.status(400).json({
          message: "Username atau Password Salah",
        });
      }

      if (user.user_status === 0) {
        return res.status(400).json({
          message: "Akun belum diverifikasi",
        });
      }

      const omit = require("lodash/omit");

      const cleanUser = omit(user, ["user_password", "user_token"]);

      const token = generate(cleanUser);

      await prisma.user.update({
        where: {
          username,
        },
        data: {
          user_token: token,
        },
      });

      return res.status(200).json({
        message: "Login Berhasil",
        data: cleanUser,
        token,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async registerUser(req, res) {
    try {
      const schema = z.object({
        email: z.string().email(),
        nama: z.string(),
        phone: z.string().min(10),
        type: z.string(),
      });

      const { email, nama, phone, type } = req.body;

      const body = await schema.safeParseAsync({
        email,
        nama,
        phone,
        type,
      });

      let errorObj = {};

      if (body.error) {
        body.error.issues.forEach((issue) => {
          errorObj[issue.path[0]] = issue.message;
        });
        body.error = errorObj;
      }

      if (!body.success) {
        return res.status(400).json({
          message: "Beberapa Field Harus Diisi",
          error: errorObj,
        });
      }

      const currentUser = await prisma.user.findFirst({
        where: {
          OR: [{ username: body.data.email }, { user_phone: body.data.phone }],
        },
      });

      if (currentUser) {
        return res.status(400).json({
          message: "User sudah terdaftar",
        });
      }

      const password = nanoid(10);
      const hashedPassword = await argon2.hash(password);

      //console.log({ password });

      await prisma.user.create({
        data: {
          user_password: hashedPassword,
          username: body.data.email,
          user_nama: body.data.nama,
          user_type: Number(body.data.type),
          user_status: 1,
          user_phone: body.data.phone,
        },
      });

      const templateEmail = generateTemplate({ email: body.data.email, password });
      const msgId = await sendEmail({
        email: body.data.email,
        html: templateEmail,
        subject: "Pendaftaran Ziswaf INDOSAT",
      });

      if (!msgId) {
        return res.status(400).json({
          message: "Gagal mengirim email",
        });
      }

      return res.status(200).json({
        message: "Sukses",
        data: "Berhasil Daftar, silahkan cek email",
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },

  async updateUser(req, res) {
    try {
      const userId = req.user_id;
      const { nama, phone } = req.body;

      if (!nama || !phone) {
        return res.status(400).json({
          message: "Nama, dan Nomor Telepon harus diisi",
        });
      }

      await prisma.user.update({
        where: {
          user_id: userId,
        },
        data: {
          user_nama: nama,
          user_phone: phone,
        },
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

  async detailUser(req, res) {
    try {
      const userId = req.user_id;

      const user = await prisma.user.findUnique({
        where: {
          user_id: userId,
        },
        include: {
          institusi: true,
          mustahiq: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User tidak ditemukan",
        });
      }

      const omit = require("lodash/omit");

      const cleanUser = omit(user, ["user_password", "user_token"]);

      return res.status(200).json({
        message: "Sukses",
        data: cleanUser,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
  async AllUser(req, res) {
    try {
      const userId = req.user_id;

      const user = await prisma.user.findMany({
        // where: {
        //   user_id: userId,
        // },
        include: {
          institusi: true,
          mustahiq: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          message: "User tidak ditemukan",
        });
      }

      //const omit = require("lodash/omit");

      //const cleanUser = omit(user, ["user_password", "user_token"]);

      return res.status(200).json({
        message: "Sukses",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
};
