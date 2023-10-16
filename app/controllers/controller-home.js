const { prisma } = require("../../prisma/client");
const fs = require("fs/promises");

const { customAlphabet } = require("nanoid");
const { z } = require("zod");

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890", 8);

module.exports = {
  async getAllProgram(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage) || 10;
      const skip = (page - 1) * perPage;
      const keyword = req.query.keyword || "";

      const params = {
        program_status: 1,
        program_title: {
          contains: keyword,
        },
      };

      const [count, program] = await prisma.$transaction([
        prisma.program.count({
          where: params,
        }),
        prisma.program.findMany({
          where: params,
          include: {
            program_institusi: true,
            program_banner: true,
          },
          skip,
          take: perPage,
        }),
      ]);

      res.send({
        message: "Sukses Ambil Data",
        data: program.map((item) => {
          return {
            ...item,
            program_target_amount: Number(item.program_target_amount),
          };
        }),
        pagination: {
          total: count,
          page,
          hasNext: count > page * perPage,
          count,
        },
      });
    } catch (error) {
      res.status(500).json({
        message: error?.message,
      });
    }
  },

  async getProgramById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({
          message: "id is required",
        });
      }

      const program = await prisma.program.findUnique({
        where: {
          program_id: parseInt(id),
        },
        include: {
          program_banner: true,
          program_institusi: true,
        },
      });

      if (!program) {
        return res.status(404).json({
          message: "Program Tidak Ditemukan",
        });
      }

      res.status(200).json({
        message: "Sukses Ambil Data",
        data: JSON.parse(JSON.stringify({ ...program, program_target_amount: Number(program.program_target_amount) })),
      });
    } catch (error) {
      res.status(500).json({
        message: "Terjadi Kesalahan Server",
        stack: error,
      });
    }
  },

  async registerProgram(req, res) {
    try {
      const schema = z.object({
        program_title: z.string({ required_error: "Judul Harus Diisi" }).min(3, "Judul Terlalu Pendek").max(255),
        program_short_desc: z.string().optional(),
        program_start_date: z.date({ required_error: "Tanggal Mulai Harus Diisi" }),
        program_end_date: z.date({ required_error: "Tanggal Berakhir Harus Diisi" }),
        program_description: z.string({ required_error: "Deskripsi Harus Diis" }).min(3),
        program_institusi_id: z.number().optional(),
        program_target_amount: z.number({
          required_error: "Target Dana Harus Diisi",
          invalid_type_error: "Target Dana Harus Diisi",
        }),
      });

      //BODY
      const body = await schema.safeParseAsync({
        ...req.body,
        program_end_date: new Date(req.body.program_end_date),
        program_start_date: new Date(req.body.program_start_date),
        program_target_amount: parseInt(req.body.program_target_amount),
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

      //FILE
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          message: "Banner harus diupload",
        });
      }

      const maxSize = 5000000;
      if (file.size > maxSize) {
        await fs.unlink(file.path);

        return res.status(400).json({
          message: "Ukuran Banner Terlalu Besar",
        });
      }

      const { program_institusi_id, ...rest } = body.data;

      const userId = req.user_id;

      const program = await prisma.program.create({
        data: {
          ...rest,
          user: {
            connect: {
              user_id: userId,
            },
          },
          program_banner: {
            create: {
              banners_name: rest.program_title,
              banners_path: `uploads/${file.filename}`,
            },
          },
          program_kode: nanoid(),
          ...(program_institusi_id
            ? {
                program_institusi: {
                  connect: {
                    institusi_id: program_institusi_id,
                  },
                },
              }
            : {}),
        },
      });

      if (!program) {
        return res.status(400).json({
          message: "Gagal Tambah Program",
        });
      }

      res.status(200).json({
        message: "Sukses Tambah Program",
        data: JSON.parse(JSON.stringify({ ...program, program_target_amount: Number(program.program_target_amount) })),
      });
    } catch (error) {
      res.status(500).json({
        message: error?.message,
      });
    }
  },
};
