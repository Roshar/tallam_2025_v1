const cabinet = require("../../models/admin/Cabinet");
const Methodist = require("../../models/admin/Methodist_model");
const Teacher = require("../../models/admin/Teacher");
const { validationResult } = require("express-validator");
const error_base = require("../../helpers/error_msg");
const notice_base = require("../../helpers/notice_msg");
const { v4: uuidv4 } = require("uuid");
const Account = require("../../models/admin/Account");

exports.index = async (req, res) => {
  try {
    return res.render("methodists_in_admin/admin_methodist_index", {
      layout: "admin",

      error: req.flash("error"),
      notice: req.flash("notice"),
    });
  } catch (e) {
    console.log(e.message);
  }
};

//получаем список всех статистических форм

exports.getStatAllList = async (req, res) => {
  try {
    return res.render("methodists_in_admin/statistic/admin_methodist_static", {
      layout: "admin",

      error: req.flash("error"),
      notice: req.flash("notice"),
    });
  } catch (e) {
    console.log(e.message);
  }
};

exports.getStatForm2 = async (req, res) => {
  try {
    const areas = await cabinet.getAllArea();
    let selected_id;
    if (req.body.area_id && req.body._csrf) {
      selected_id = await req.body.area_id;
      // вывести всех методистов по району

      const methodistData = await Methodist.getMethodistListByAreaId(
        req.body.area_id
      );

      return res.render("methodists_in_admin/statistic/admin_methodist_form2", {
        layout: "admin",
        areas,
        selected_id,
        methodistData,
        error: req.flash("error"),
        notice: req.flash("notice"),
      });
    }
    return res.render("methodists_in_admin/statistic/admin_methodist_form2", {
      layout: "admin",
      areas,
      error: req.flash("error"),
      notice: req.flash("notice"),
    });
  } catch (e) {
    console.log(e.message);
  }
};

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
        return res.status(200).redirect("/admin/methodist/list");
      }
    }

    return res.render("methodists_in_admin/admin_methodist_list", {
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

/** GET PROFILE METHODIST BY ID   */

exports.getProfileByMethodistId = async (req, res) => {
  try {
    console.log(req.params);
    const methodistInfo = await Methodist.getInformationMethodistById(
      req.params
    );
    const discipline_list = await Methodist.getDisciplineListByMethodistId(
      req.params
    );

    console.log(methodistInfo);
    console.log("------");
    console.log(discipline_list);
    console.log("here");

    return res.render("methodists_in_admin/admin_methodist_profile", {
      layout: "admin",
      title: "Профиль методиста",
      discipline_list,
      methodistInfo,
      notice: req.flash("notice"),
    });
  } catch (e) {
    console.log(e.message);
  }
};
/** END BLOCK */
