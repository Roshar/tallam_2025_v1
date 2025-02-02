const { Router } = require("express");
const methCtrl = require("../../controllers/admin/methodist");
const { validationResult } = require("express-validator");
const { validatorForAddTeacherAdmin } = require("../../utils/validator");
// const auth = require('../../middleware/auth')

const router = Router();
router.post("/", methCtrl.getMethodistList);
router.get("/", methCtrl.getMethodistList);

// router.post('/area', schoolCtrl.getShoolsByAreaId)

// router.get('/:id', schoolCtrl.getSchoolProfileById)

// router.get('/:id/:teacher_id/:project_id', schoolCtrl.getProfileByTeacherIdInProject)

// router.get('/:id/:teacher_id/', schoolCtrl.getProfileByTeacherId)

// router.post('/add_teacher_in_school', validatorForAddTeacherAdmin, schoolCtrl.insertNewTeacherInThisSchoolBase)

module.exports = router;
