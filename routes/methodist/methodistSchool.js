const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const methodist = require("../../controllers/methodist/methodist");

const router = Router();
console.log("route");
//получить учителей из определенной школы по id
// router.get("/school/:school_id/", methodist.getTeacherListFromSchoolById);

// href="/methodist/user/{{../id_user}}/area/{{../area_id}}/school/{{../id_school}}">
//                                             {{school_name}}

// router.post('/', body('email').isEmail(), body('message').notEmpty(), school_cabinetCtrl.getSchoolData)

module.exports = router;
