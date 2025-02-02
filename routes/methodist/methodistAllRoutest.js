const { Router } = require("express");
const { body, validationResult } = require("express-validator");
const methodist = require("../../controllers/methodist/methodist");
const { validatorForAddMark } = require("../../utils/validator_card");
const {
  validatorForAddMarkMethod,
} = require("../../utils/validator_card_method");

const router = Router();

//получить все школы в рамках определенного методиста (
router.get("/", methodist.index);
//получить учителей из определенной школы по id
router.get(
  "/school/:school_id/area/:id_area/methodist/:id_methodist/teachers",
  methodist.getTeacherListFromSchoolById
);

// получить оьщую информацию про учителя - профиль
router.get(
  "/school/:school_id/area/:id_area/methodist/:id_methodist/teacherinfo/:id_teacher",
  methodist.getTeacherByIdForMethodist
);

// получить все оценки учителя по фильтру
router.post(
  "/school/:school_id/area/:id_area/methodist/:id_methodist/analysis/:id_teacher",
  methodist.getCardPageByTeacherIdForMethodist
);

// получить все оценки учителя
router.get(
  "/school/:school_id/area/:id_area/methodist/:id_methodist/analysis/:id_teacher",
  methodist.getCardPageByTeacherIdForMethodist
);

// выбор карты для оценивания
router.get(
  "/school/:school_id/card/methodist/:id_methodist/teacher/:id_teacher/check",
  methodist.checkCardForMethodist
);

// Обработка добавления

router.post(
  "/school/:school_id/card/add/methodist/:id_methodist/teacher/:teacher_id/method",
  validatorForAddMarkMethod,
  methodist.addMarkForTeacherMethodForMethodist
);

// страница с картой методической для оценивания

router.get(
  "/school/:school_id/card/add/methodist/:id_methodist/teacher/:teacher_id/method",
  methodist.addMarkForTeacherMethodForMethodist
);

// Обработка добавления

router.post(
  "/school/:school_id/card/add/methodist/:id_methodist/teacher/:teacher_id/all",
  validatorForAddMark,
  methodist.addMarkForTeacherAllforMethodist
);

// страница с картой комплексной для оценивания

router.get(
  "/school/:school_id/card/add/methodist/:id_methodist/teacher/:teacher_id/all",
  methodist.addMarkForTeacherAllforMethodist
);

// просмотр оценки
router.post(
  "/school/:id_school/showcard/:id_card/methodist/:methodist_id/teacher/:teacher_id/method",
  methodist.getSingleCardByIdMethodForMethodist
);

// просмотр оценки

router.get(
  "/school/:id_school/showcard/:id_card/methodist/:methodist_id/teacher/:teacher_id/method",
  methodist.getSingleCardByIdMethodForMethodist
);

//
router.get(
  "/school/:id_school/showcard/:id_card/methodist/:methodist_id/teacher/:teacher_id/full",
  methodist.getSingleCardByIdFullForMethodist
);

//
router.post(
  "/school/:id_school/showcard/:id_card/methodist/:methodist_id/teacher/:teacher_id/full",
  methodist.getSingleCardByIdFullForMethodist
);

// router.post('/', body('email').isEmail(), body('message').notEmpty(), school_cabinetCtrl.getSchoolData)

module.exports = router;
