const { Router } = require("express");
const methCtrl = require("../../controllers/admin/methodist");
const { validationResult } = require("express-validator");
const { validatorForAddTeacherAdmin } = require("../../utils/validator");
// const auth = require('../../middleware/auth')

const router = Router();
router.get("/", methCtrl.index);
router.post("/list", methCtrl.getMethodistList);
router.get("/list", methCtrl.getMethodistList);
router.get("/statistic", methCtrl.getStatAllList);
router.post("/statistic/form2", methCtrl.getStatForm2);
router.get("/statistic/form2", methCtrl.getStatForm2);
router.get("/profile/:id", methCtrl.getProfileByMethodistId);

// router.get('/:id', schoolCtrl.getSchoolProfileById)

// router.get('/:id/:teacher_id/:project_id', schoolCtrl.getProfileByTeacherIdInProject)

// router.get('/:id/:teacher_id/', schoolCtrl.getProfileByTeacherId)

// router.post('/add_teacher_in_school', validatorForAddTeacherAdmin, schoolCtrl.insertNewTeacherInThisSchoolBase)

module.exports = router;
