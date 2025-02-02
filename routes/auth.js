const { Router } = require("express");
const router = Router();
const authCntrl = require("../controllers/admin/auth");
const isAuth = require("../middleware/isAuth");

router.get("/", isAuth, (req, res) => {
  res.render("auth", {
    layout: "auth",
    title: "Форма авторизации",
    isAuth: req.session.isAuthenticated,
    isRole: req.session.isRole,
    error: req.flash("error"),
    notice: req.flash("notice"),
  });
});

router.get("/logout", async (req, res) => {
  req.session.isAuthenticated = false;
  req.session.isAdmin = false;
  req.session.destroy((err) => {
    if (err) {
      throw err;
    } else {
      res.redirect("/auth");
    }
  });
});

// версия 1.0
// router.post("/login", authCntrl.existsUserInDb);

// версия 2.0
router.post("/loginSchool", authCntrl.existsUserInDb);
router.post("/loginMethodist", authCntrl.existsUserInDb);

module.exports = router;
