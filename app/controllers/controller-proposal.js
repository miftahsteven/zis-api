const { prisma } = require("../../prisma/client");
const fs = require("fs");

module.exports = {
  async details(req, res) {
    const userId = req.user_id;

    return res.status(200).json({
      userId,
    });
  },
  async createProposal(req, res) {
    try {
      const userId = req.user_id;
      const {
          program_id,
          user_id,
          proposal_kategori,
          nama,
          alamat_rumah,
          kode_pos,
          status_domisili,
          tgl_lahir,
          tempat_lahir,
          jenis_kelamin,        
          status_rumah,
          status_pernikahan,
          jumlah_anak,
          penghasilan_bulanan,
          nama_pasangan,
          pekerjaan,
          pendidikan_terakhir,
          nama_sekolah_universitas,
          fakultas,
          jurusan,
          kelas_semester_saat_ini,
          alamat_sekolah_kampus,
          nomor_telp_sekolah_kampus,
          tempat_mengajar,
          alamat_mengajar,          
          sebagai_guru,        
          biaya_pendidikan_bulanan,
          jumlah_tanggungan,
          organisasi_yang_diikuti,
          nama_ayah,
          pekerjaan_ayah,
          penghasilan_bulanan_ayah,
          nama_ibu,
          pekerjaan_ibu,
          penghasilan_bulanan_ibu,
          jenis_bantuan_kesehatan,
          bantuan_pihak_lain,
          nominal_bantuan,
          biaya_hidup_bulanan,
          nama_pemberi_rekomendasi,
          alamat_pemberi_rekomendasi,
          no_telp_pemberi_rekomendasi
      } = req.body;

      //console.log(JSON.stringify(req.body))


      if (!nama || !userId || !program_id || !proposal_kategori || !nama_pemberi_rekomendasi || !alamat_pemberi_rekomendasi || !no_telp_pemberi_rekomendasi) {
        return res.status(400).json({
          message: "Nama, dan Program Id, Kategori Proposal, nama alamat dan nomor telepon pemberi rekomendasi wajib diisi",
        });
      }

      
      const ProposalResult = await prisma.proposal.create({
        data: {
          user: {
            connect: {
              user_id: Number(userId),
            },
          },
          program: {
            connect: {
              program_id: Number(program_id),
            },
          },          
          proposal_kategori : Number(proposal_kategori),
          nama,
          alamat_rumah,
          kode_pos,
          status_domisili: Number(status_domisili),
          tgl_lahir,
          tempat_lahir,
          jenis_kelamin: Number(jenis_kelamin),        
          status_rumah: Number(status_rumah),
          status_pernikahan : Number(status_pernikahan),
          jumlah_anak: Number(jumlah_anak),
          penghasilan_bulanan: Number(penghasilan_bulanan),
          nama_pasangan,
          pekerjaan,
          pendidikan_terakhir : Number(pendidikan_terakhir),
          nama_sekolah_universitas,
          fakultas,
          jurusan,
          kelas_semester_saat_ini,
          alamat_sekolah_kampus,
          nomor_telp_sekolah_kampus,
          tempat_mengajar,
          alamat_mengajar,          
          sebagai_guru,        
          biaya_pendidikan_bulanan: Number(biaya_pendidikan_bulanan),
          jumlah_tanggungan: Number(jumlah_tanggungan),
          organisasi_yang_diikuti,
          nama_ayah,
          pekerjaan_ayah,
          penghasilan_bulanan_ayah: Number(penghasilan_bulanan_ayah),
          nama_ibu,
          pekerjaan_ibu,
          penghasilan_bulanan_ibu: Number(penghasilan_bulanan_ibu),
          jenis_bantuan_kesehatan,
          bantuan_pihak_lain,
          nominal_bantuan: Number(nominal_bantuan),
          biaya_hidup_bulanan: Number(biaya_hidup_bulanan),
          nama_pemberi_rekomendasi,
          alamat_pemberi_rekomendasi,
          no_telp_pemberi_rekomendasi
        },
      });

      return res.status(200).json({
        message: "Sukses",
        data: ProposalResult,
      });
    } catch (error) {
      
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  },
  
  
  async detailProposal(req, res) {
    try {
      const id = req.params.id;

      const proposal = await prisma.proposal.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          user: true,
          program: true,
        },
      });

      if (!proposal) {
        return res.status(404).json({
          message: "Proposal tidak ditemukan",
        });
      }

      //const omit = require("lodash/omit");

      //const cleanUser = omit(user, ["user_password", "user_token"]);

      return res.status(200).json({
        message: "Sukses",
        data: proposal,
      });
    } catch (error) {
      return res.status(500).json({
        message: error?.message,
      });
    }
  },
};
