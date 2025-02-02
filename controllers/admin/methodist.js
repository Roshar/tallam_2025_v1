const cabinet = require("../../models/admin/Cabinet");
const Teacher = require("../../models/admin/Teacher");
const { validationResult } = require("express-validator");
const error_base = require("../../helpers/error_msg");
const notice_base = require("../../helpers/notice_msg");
const { v4: uuidv4 } = require("uuid");
const Account = require("../../models/admin/Account");

exports.getMethodistList = async (req, res) => {
  try {
    const methodists = await cabinet.getAllMethodist();
    const disciplines = await cabinet.getdisciplinesList();
    const areas = await cabinet.getAllArea();
    const position_m = await cabinet.getDisciplineList();

    if (req.body._csrf) {
      console.log(req.body);
      req.body.methodist_id = uuidv4();
      const result = await cabinet.addNewMethodist(req.body);

      if (result) {
        req.flash("notice", notice_base.success_insert_sql);
        return res.status(200).redirect("/admin/methodist");
      }
    }

    return res.render("admin_methodist_list", {
      layout: "admin",
      disciplines,
      position_m,
      areas,
      methodists,
      error: req.flash("error"),
      notice: req.flash("notice"),
    });
  } catch (e) {
    console.log(e.message);
  }
};
