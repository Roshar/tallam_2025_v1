const Auth = require("../../models/admin/Auth");
// const {validationResult} = require('express-validator');
const error_base = require("../../helpers/error_msg");
const notice_base = require("../../helpers/notice_msg");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
// const auth = require('../../middleware/auth');

const transporter = nodemailer.createTransport({
  sendgrid,
});

exports.existsUserInDb = async (req, res) => {
  try {
    console.log("контроллер existsUserInDb ");
    const userData = await Auth.getExistsUserInDb(req.body);
    console.log("user data: ", userData);

    if (!userData[0]) {
      req.flash("error", error_base.incorrect_data);
      return res.status(422).redirect("/auth");
      // throw new Error('Пользователь не найден!')
    }
    //const getRole = await Auth.getRoleFromSession()
    if (await bcrypt.compare(req.body.password, userData[0].password)) {
      req.session.user = userData[0];

      if (userData[0].role === "admin" && userData[0].status === "on") {
        req.session.isAdmin = true;

        return res.redirect("/admin/school_list");
      } else if (
        userData[0].role === "school_admin" &&
        userData[0].status === "on"
      ) {
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) {
            throw err;
          } else {
            return res.redirect("/school/cabinet/");
          }
        });
        // версия 2.0
        // добавлен блок для методиста ------ начало
      } else if (
        userData[0].role === "methodist" &&
        userData[0].status === "on"
      ) {
        console.log("мы тут");
        req.session.isAuthenticated = true;
        req.session.isMethodist = true;
        req.session.save((err) => {
          if (err) {
            throw err;
          } else {
            return res.redirect("/methodist/cabinet/");
          }
        });
      }
      // добавлен блок для методиста ------ конец
      else {
        req.session.isAuthenticated = false;
        req.session.save((err) => {
          if (err) {
            throw err;
          } else {
            // return res.redirect('/school/cabinet/');
            req.flash("error", error_base.blocked);

            return res.status(422).redirect("/auth");
          }
        });
      }
    } else {
      console.log("не соответствуют пароли!");
      req.flash("error", error_base.incorrect_data);
      return res.status(422).redirect("/auth");
    }
  } catch (e) {
    console.log(e.message);
  }
};
