const { Router } = require("express");
const auth = require("../../middleware/auth");
const { body, validationResult } = require("express-validator");
const { validatorForAddMark } = require("../../utils/validator_card");
const {
  validatorForAddMarkMethod,
} = require("../../utils/validator_card_method");
const school_cardCtrl = require("../../controllers/school_admin/school_card");

const router = Router();

router.post(
  "/single/:id_card/project/:project_id/:teacher_id/full",
  school_cardCtrl.getSingleCardByIdFull
);
router.get(
  "/single/:id_card/project/:project_id/:teacher_id/full",
  school_cardCtrl.getSingleCardByIdFull
);
router.post(
  "/single/:id_card/project/:project_id/:teacher_id/method",
  school_cardCtrl.getSingleCardByIdMethod
);
router.get(
  "/single/:id_card/project/:project_id/:teacher_id/method",
  school_cardCtrl.getSingleCardByIdMethod
);
router.post(
  "/project/:project_id/teacher/:teacher_id",
  school_cardCtrl.getCardPageByTeacherId
);
router.get(
  "/project/:project_id/teacher/:teacher_id/",
  school_cardCtrl.getCardPageByTeacherId
);
router.get(
  "/check/project/:project_id/teacher/:teacher_id",
  school_cardCtrl.checkCard
);
router.post(
  "/add/project/:project_id/teacher/:teacher_id/all",
  validatorForAddMark,
  school_cardCtrl.addMarkForTeacherAll
);
router.get(
  "/add/project/:project_id/teacher/:teacher_id/all",
  school_cardCtrl.addMarkForTeacherAll
);
router.post(
  "/add/project/:project_id/teacher/:teacher_id/method",
  validatorForAddMarkMethod,
  school_cardCtrl.addMarkForTeacherMethod
);
router.get(
  "/add/project/:project_id/teacher/:teacher_id/method",
  school_cardCtrl.addMarkForTeacherMethod
);
router.get(
  "/create_tbl_marks/teacher/:teacher_id/project/:project_id",
  school_cardCtrl.getAllMarksByTeacherId
);

module.exports = router;
