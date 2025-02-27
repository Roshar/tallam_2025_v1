const SchoolCabinet = require("../../models/school_admin/SchoolCabinet");
const SchoolProject = require("../../models/school_admin/SchoolProject");
const SchoolTeacher = require("../../models/school_admin/SchoolTeacher");
const SchoolCard = require("../../models/school_admin/SchoolCard");
const Cabinet = require("../../models/admin/Cabinet");
const { validationResult } = require("express-validator");
const error_base = require("../../helpers/error_msg");
const notice_base = require("../../helpers/notice_msg");
const fs = require("fs");
const excel = require("exceljs");
const path = require("path");
const { Document, Packer, Paragraph, TextRun } = require("docx");
const dateformat = require("../../utils/formatdate");
const checkFromSQL = require("../../utils/prepareData");
const checkFromSQL2 = require("../../utils/prepareData2");
const setValueForInput = require("../../utils/specialValue");
const getMoscowDateTime = require("../../utils/currentDataForSql");
// const dboptions = require('../../helpers/dbh_options')
const { v4: uuidv4 } = require("uuid");

/**
 * Главная страница личного кабинета методиста
 * Methodist */

exports.index = async (req, res) => {
  try {
    if (req.session.user && req.session.user.role === "methodist") {
      // console.log("начало контроллера ");
      const user = req.session.user;

      console.log("СТАТУС", req.session.isAuthenticated);

      console.log(req.session.user);

      // console.log(user);
      const id_user = req.session.user.id_user;
      const emailUser = req.session.user.email;
      const firstname = req.session.user.firstname;
      const surname = req.session.user.surname;
      const patronymic = req.session.user.patronymic;
      const area_id = req.session.user.area_id;

      let areaData;
      let schools;
      let num = 1;
      let schoolsInProject;
      let countSchoolsInProject = 0;
      let analysisData;
      let positionTitle;
      let discipline_list;

      areaData = await Cabinet.getAreaById(user);
      schools = await Cabinet.getSchoolsByAreaId(user);
      schoolsInProject = await Cabinet.getSchoolsInProjectAndActive(user);
      countSchoolsInProject = schoolsInProject.length;
      analysisData = await Cabinet.getAnalysis(req.session.user);
      positionTitle = await Cabinet.getPositionByMethodistId(req.session.user);
      discipline_list = await Cabinet.disciplineListByMethodistId(
        req.session.user
      );
      console.log(discipline_list);

      let position = positionTitle[0]["title_position"];

      let countAnalisys = analysisData[0]["id_card"];

      console.log("count ", countAnalisys);

      const area_title = areaData[0]["title_area"];

      return res.render("methodist_cabinet", {
        layout: "main",
        emailUser,
        num,
        area_id,
        id_user,
        firstname,
        surname,
        patronymic,
        position,
        discipline_list,
        countAnalisys,
        schools,
        area_title,
        countSchoolsInProject,
        error: req.flash("error"),
        notice: req.flash("notice"),
      });
    } else {
      req.session.isAuthenticated = false;
      req.session.destroy((err) => {
        if (err) {
          throw err;
        } else {
          res.redirect("/auth");
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
};

//получить всех учителей школы для методиста

exports.getTeacherListFromSchoolById = async (req, res) => {
  try {
    console.log("ffffffffffff");
    console.log("req params: ", req.params);
    // const project_id = await req.params.project_id;

    const project_id = 2;
    const project = await Cabinet.getInfoFromProjectById(project_id);

    console.log("project", project);

    const school = await SchoolCabinet.getSchoolData(req.params);
    console.log("school", school);
    const discipline_list = await Cabinet.getDisicplinesForMethodist(
      req.params
    );

    console.log("discipline_list", discipline_list);

    const area_id = req.params.id_area;
    const obj = {};
    obj.school_id = req.params.school_id;
    obj.id_project = project_id;
    obj.discipline_list = discipline_list;

    obj.methodist_position_id = req.session.user.position_id;
    const teachers = await SchoolTeacher.getAllTeachersFromThisSchoolFromCurrentProjectAndByMethodistId(
      obj
    );

    const school_id = req.params.school_id;
    const id_methodist = req.params.id_methodist;

    const school_name = await school[0].school_name;

    if (req.session.user && req.session.user.role === "methodist") {
      const areaData = await Cabinet.getAreaById(req.session.user);
      const title_area = areaData.title_area;

      const area_title = areaData[0]["title_area"];
      console.log(area_title);

      return res.render("methodist_school_profile", {
        layout: "mainprofile",
        title: "Общий список учителей",
        school_id,
        school,
        teachers,
        area_id,
        id_methodist,
        school_name,
        title_area,
        error: req.flash("error"),
        notice: req.flash("notice"),
      });
    } else {
      req.session.isAuthenticated = false;
      req.session.destroy((err) => {
        if (err) {
          throw err;
        } else {
          res.redirect("/auth");
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
};

/** END BLOCK */

//получить всех учителей школы для методиста

exports.getTeacherByIdForMethodist = async (req, res) => {
  try {
    console.log("Контроллер: getTeacherByIdForMethodist");
    console.log("req параметры: ", req.params);
    if (req.session.user) {
      const obj = {};
      obj.teacher_id = req.params.id_teacher;
      const teacher = await SchoolTeacher.getProfileByTeacherId(obj);

      if (!teacher.length) {
        return res.status(422).redirect("/school/cabinet");
      }
      req.params.teacher_id = req.params.id_teacher;

      const school = await SchoolCabinet.getSchoolData(req.params);
      const school_id = await school[0].id_school;
      const teacher_id = await req.params.teacher_id;
      const kpk = await SchoolTeacher.getAllKpkByIdTeacher(req.params);

      const d = teacher[0].birthday.getDate();
      const m = teacher[0].birthday.getMonth();
      const month = [
        "января",
        "февраля",
        "марта",
        "апреля",
        "мая",
        "июня",
        "июля",
        "августа",
        "сентября",
        "октября",
        "ноября",
        "декабря",
      ];

      const y = teacher[0].birthday.getFullYear();
      const birthdayShort = `${d}  ${month[m]} ${y}`;
      const discipline = await SchoolTeacher.disciplineListByTeacherId(
        req.params
      );

      const school_name = await school[0].school_name;
      const title_area = await school[0].title_area;

      return res.render("methodist_school_teacher_profile", {
        layout: "mainprofile",
        title: "Профиль учителя",
        school_id,
        teacher_id,
        teacher,
        birthdayShort,
        school_name,
        kpk,
        discipline,
        title_area,
        error: req.flash("error"),
        notice: req.flash("notice"),
      });
    } else {
      req.session.isAuthenticated = false;
      req.session.destroy((err) => {
        if (err) {
          throw err;
        } else {
          res.redirect("/auth");
        }
      });
    }
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK */

/**
 * Страница учителя с оценками
 *
 */

exports.getCardPageByTeacherIdForMethodist = async (req, res) => {
  try {
    if (req.session.user) {
      req.params.project_id = 2;
      req.params.teacher_id = req.params.id_teacher;
      console.log(req.params);
      const id_methodist = req.params.id_methodist;
      // название школы и района
      const school = await SchoolCabinet.getSchoolData(req.params);

      const school_name = await school[0].school_name;
      const area_id = await school[0].area_id;

      // имя проекта
      const project = await SchoolProject.getInfoFromProjectById(req.params);

      if (!project.length) {
        return res.status(422).redirect("/school/cabinet");
      }

      //проверка участвует школа в проекте
      const projectsIssetSchool = await SchoolProject.getAllProjectsWithThisSchool(
        req.params
      );

      let resultA = [];

      for (let i = 0; i < projectsIssetSchool.length; i++) {
        if (project[0].id_project == projectsIssetSchool[i].project_id) {
          resultA.push(project[0].id_project);
        }
      }

      if (!resultA.length || resultA == 1) {
        return res.status(422).redirect("/school/cabinet");
      }

      // получает общие  данные учителя
      const teacher = await SchoolTeacher.getProfileByTeacherId(req.params);

      if (!teacher.length) {
        return res.status(422).redirect("/school/cabinet");
      }

      // тут получаем список дисциплин учителя, на самом деле это не нужно, потому что методист
      //должен оценить только по своему одному проекту

      const disciplineListByTeacherId = await SchoolTeacher.disciplineListByTeacherId(
        req.params
      );
      const teacher_id = await teacher[0].id_teacher;

      if (req.params.project_id == 2) {
        if (req.body.add_methodist && req.body._csrf) {
          // let card = await SchoolCard.getCardByTeacherIdWhithFilter(req.body);
          req.body.methodist_id = id_methodist;
          let card = await SchoolCard.getCardByTeacherIdWhithFilterAndMethodist(
            req.body
          );
          const currentSourceId = await card.source;
          const currentDisc = await card.disc;

          return res.render("methodist_school_teacher_card", {
            layout: "maincard",
            title: "Личная карта учителя",
            school_name,
            teacher,
            card,
            teacher_id,
            area_id,
            id_methodist,
            school_id: school[0].id_school,
            disciplineListByTeacherId,
            project_name: project[0].name_project,
            project_id: project[0].id_project,
            currentSourceId,
            currentDisc,
            error: req.flash("error"),
            notice: req.flash("notice"),
          });
        }

        // получаем все оценки учителя и методиста по id учителя и id методиста
        let card = await SchoolCard.getCardByTeacherIdByMethodistId(req.params);

        return res.render("methodist_school_teacher_card", {
          layout: "maincard",
          title: "Личная карта учителя",
          school_name,
          teacher,
          card,
          teacher_id,
          school_id: school[0].id_school,
          id_methodist,
          disciplineListByTeacherId,
          area_id,
          project_name: project[0].name_project,
          project_id: project[0].id_project,
          currentSourceId: "",
          currentDisc: "",
          error: req.flash("error"),
          notice: req.flash("notice"),
        });
      } else if (req.params.id_project == 3) {
        console.log("Данный раздел находится в разработке");
        return res.render("admin_page_not_ready", {
          layout: "main",
          title: "Ошибка",
          title: "Предупрехждение",
          error: req.flash("error"),
          notice: req.flash("notice"),
        });
      } else {
        console.log("Ошибка в выборе проекта");
        console.log(req.params);
        return res.status(404).render("404_error_template", {
          layout: "404",
          title: "Страница не найдена!",
        });
      }
    } else {
      req.session.isAuthenticated = false;
      req.session.destroy((err) => {
        if (err) {
          throw err;
        } else {
          res.redirect("/auth");
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
};

/** END BLOCK */

/**
 * Выбор карты для оценивания
 */
exports.checkCardForMethodist = async (req, res) => {
  try {
    console.log(req.params);
    const id_methodist = req.params.id_methodist;
    const school_id = req.params.school_id;
    const teacher_id = req.params.id_teacher;
    return res.render("methodist_check_card", {
      id_methodist,
      school_id,
      teacher_id,
    });
  } catch (e) {
    console.log(e.message);
  }
};
/**
 * END
 */

////////////////////////////////

/**
 * РАБОТЫ С КАРТАМИ
 * Методические карты
 */

/** Получить карту методическую для оценивания
 * + обработака и добавление новой оценки
 */

exports.addMarkForTeacherMethodForMethodist = async (req, res) => {
  try {
    if (req.session.user) {
      // console.log(req.params);
      req.params.project_id = 2;
      const project = await SchoolProject.getInfoFromProjectById(req.params);

      if (!project.length) {
        return res.status(422).redirect("/methodist/cabinet");
      }

      const current_date = dateformat();

      const projectsIssetSchool = await SchoolProject.getAllProjectsWithThisSchool(
        req.params
      );

      let resultA = [];

      for (let i = 0; i < projectsIssetSchool.length; i++) {
        if (project[0].id_project == projectsIssetSchool[i].project_id) {
          resultA.push(project[0].id_project);
        }
      }

      if (!resultA.length || resultA == 1) {
        return res.status(422).redirect("/methodist/cabinet");
      }

      const teacher = await SchoolTeacher.getProfileByTeacherId(req.params);
      if (!teacher.length) {
        return res.status(422).redirect("/methodist/cabinet");
      }

      const teacher_id = await teacher[0].id_teacher;
      const school = await SchoolCabinet.getSchoolData(req.params);
      const school_id = await school[0].id_school;
      const school_name = await school[0].school_name;
      const title_area = await school[0].title_area;
      const area_id = await school[0].area_id;
      const disciplineListByTeacherId = await SchoolTeacher.disciplineListByTeacherId(
        req.params
      );
      const methodist_info = await SchoolTeacher.mainInfoByMethodistId(
        req.params
      );

      const project_id = await project[0].id_project;

      if (req.body.id_teacher && req.body._csrf) {
        console.log("MMMMMMMMMMM", methodist_info);
        const id_methodist = methodist_info[0]["id_user"];
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          req.flash("error", error_base.empty_input);
          return res
            .status(422)
            .redirect(
              `/methodist/cabinet/school/${school_id}/area/${area_id}/methodist/${id_methodist}/analysis/${teacher_id}`
            );
        }
        req.body.id_methodist = req.params.id_methodist;

        req.body.source_fio =
          methodist_info[0]["surname"] +
          " " +
          methodist_info[0]["firstname"] +
          " " +
          methodist_info[0]["patronymic"];
        req.body.position_name = methodist_info[0]["title_position"];
        req.body.source_workplace = methodist_info[0]["department"];
        req.body.source_id = 1;
        req.body.date_create = getMoscowDateTime();

        console.log("КОНТРОЛЛЕР данные с формы", req.body);

        let lastId = await SchoolCard.createNewMarkInCardMethod(req.body);

        console.log(" Id добавленной оценки " + lastId);

        // console.log('/school/card/project/' + project_id + '/teacher/' + teacher_id)
        if (lastId) {
          req.flash("notice", notice_base.success_insert_sql);
          return res
            .status(200)
            .redirect(
              `/methodist/cabinet/school/${school_id}/area/${area_id}/methodist/${id_methodist}/analysis/${teacher_id}`
            );
        } else {
          req.flash("error", error_base.wrong_sql_insert);
          return res
            .status(422)
            .redirect(
              `/methodist/cabinet/school/${school_id}/area/${area_id}/methodist/${id_methodist}/analysis/${teacher_id}`
            );
        }
      }

      return res.render(
        "card_templates/methodist_school_teacher_card_add_mark_method",
        {
          layout: "maincard",
          title: "Оценить урок",
          teacher,
          teacher_id,
          school_id,
          id_methodist: req.params.id_methodist,
          project_id,
          school_name,
          disciplineListByTeacherId,
          title_area,
          current_date,
          error: req.flash("error"),
          notice: req.flash("notice"),
        }
      );
    } else {
      req.session.isAuthenticated = false;
      req.session.destroy((err) => {
        if (err) {
          throw err;
        } else {
          res.redirect("/auth");
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
};

/** END BLOCK */

/**
 * Показ результат по шаблону карты - Методическая карта
 * удалить оценку/скачать метод реком/отправить по эл
 *
 */

exports.getSingleCardByIdMethodForMethodist = async (req, res) => {
  try {
    if (req.session.user) {
      req.params.project_id = 2;
      req.params.school_id = req.params.id_school;
      const methodist_id = req.params.methodist_id;
      let authorCard = false;

      const school = await SchoolCabinet.getSchoolData(req.params);
      const school_id = school[0]["id_school"];
      const school_name = await school[0].school_name;
      const project = await SchoolProject.getInfoFromProjectById(req.params);
      const area_id = school[0].area_id;

      if (!project.length) {
        return res.status(422).redirect("/methodist/cabinet");
      }

      const projectsIssetSchool = await SchoolProject.getAllProjectsWithThisSchool(
        req.params
      );

      let resultA = [];

      for (let i = 0; i < projectsIssetSchool.length; i++) {
        if (project[0].id_project == projectsIssetSchool[i].project_id) {
          resultA.push(project[0].id_project);
        }
      }

      if (!resultA.length || resultA == 1) {
        return res.status(422).redirect("/methodist/cabinet/");
      }

      if (req.params.project_id == 2) {
        const singleCard = await SchoolCard.getSingleCard(req.params);

        if (singleCard[0]["methodist_id"] === methodist_id) {
          authorCard = true;
        }
        if (!singleCard.length) {
          return res.status(422).redirect("/methodist/cabinet/");
        }
        const teacher_id = await singleCard[0].teacher_id;

        const teacher = await SchoolTeacher.getProfileByTeacherId({
          teacher_id,
        });

        function countOptional(num) {
          if (num == 8) {
            return 0;
          } else if (num == 0) {
            return -1;
          } else {
            return num;
          }
        }

        let secondBloc =
          singleCard[0].k_2_1 +
          singleCard[0].k_2_2 +
          singleCard[0].k_2_3 +
          singleCard[0].k_2_4 +
          singleCard[0].k_2_5 +
          singleCard[0].k_2_6 +
          singleCard[0].k_2_7 +
          singleCard[0].k_2_8 +
          singleCard[0].k_2_9 +
          singleCard[0].k_2_10 +
          singleCard[0].k_2_11 +
          singleCard[0].k_2_12 +
          singleCard[0].k_2_13 +
          singleCard[0].k_2_14 +
          singleCard[0].k_2_15 +
          singleCard[0].k_2_16 +
          singleCard[0].k_2_17 +
          singleCard[0].k_2_18 +
          singleCard[0].k_2_19 +
          singleCard[0].k_2_20 +
          singleCard[0].k_2_21 +
          singleCard[0].k_2_22;

        let secondInterest = Math.round((secondBloc * 100) / 33);

        const secondBlockInfo = {
          num: 2,
          highLevelMax: 34,
          highLevelMin: 25,
          baseLevelMax: 24,
          baseLevelMin: 17,
          lowLevelMax: 16,
        };

        const levelNum = checkFromSQL(secondBloc, secondBlockInfo);

        const conclusion_second_block = await SchoolCard.getConclusion({
          levelNum,
          num_bloc: secondBlockInfo.num,
        });

        function calculateInterest(num, text) {
          const property = {};

          if (num > 75) {
            property.level = "Выше базового уровня ";
            property.levelText = "Уровень " + text + " выше базового";
            property.levelStyle = "success";
          } else if (num >= 50 && num <= 75) {
            property.level = "Базовый уровень";
            property.levelText = "Базовый уровень " + text;
            property.levelStyle = "good";
          } else if (num < 50) {
            property.level = "Ниже базового уровня (критический)";
            property.levelText = "Уровень " + text + " ниже базового";
            property.levelStyle = "danger";
          }
          return property;
        }
        const specialVal = [];
        specialVal["k_2_10"] = setValueForInput(singleCard[0].k_2_10);
        specialVal["k_2_11"] = setValueForInput(singleCard[0].k_2_11);
        specialVal["k_2_19"] = setValueForInput(singleCard[0].k_2_19);
        specialVal["k_2_20"] = setValueForInput(singleCard[0].k_2_20);

        let resultSecond = calculateInterest(
          secondInterest,
          "методических компетенций"
        );

        const d = singleCard[0].create_mark_date.getDate();
        const m = singleCard[0].create_mark_date.getMonth();
        const month = [
          "января",
          "февраля",
          "марта",
          "апреля",
          "мая",
          "июня",
          "июля",
          "августа",
          "сентября",
          "октября",
          "ноября",
          "декабря",
        ];
        const y = singleCard[0].create_mark_date.getFullYear();
        const create_mark_date = `${d}  ${month[m]} ${y}`;
        let sourceData;
        if (singleCard[0].source_id == 2) {
          sourceData = "Внтуришкольная";
        } else {
          sourceData =
            singleCard[0].source_fio +
            ", " +
            singleCard[0].position_name +
            " ( " +
            singleCard[0].source_workplace +
            ")";
        }
        singleCard[0].fio =
          teacher[0].surname +
          " " +
          teacher[0].firstname +
          " " +
          teacher[0].patronymic;
        singleCard[0].position = teacher[0].title_position;
        singleCard[0].school_name = school_name;

        if (req.body.excel_tbl) {
          const jsonsingleCard = JSON.parse(JSON.stringify(singleCard));
          let workbook = new excel.Workbook();
          let worksheet = workbook.addWorksheet("Singlecard");

          worksheet.columns = [
            { header: "ФИО", key: "fio", width: 10 },
            { header: "Должность", key: "position", width: 30 },
            { header: "Предмет", key: "title_discipline", width: 30 },
            {
              header:
                "Учитель обучает учащихся ставить учебную цель, используя проблемные вопросы, смысловые догадки, метод ассоциаций и другое",
              key: "k_2_1",
              width: 50,
            },
            {
              header:
                "Цель урока сформулирована так, что ее достижение можно проверить",
              key: "k_2_2",
              width: 50,
            },
            {
              header:
                " Составлены критерии оценки деятельности и результатов учащихся на уроке",
              key: "k_2_3",
              width: 50,
            },
            {
              header:
                "Учитель формирует положительную учебную мотивацию, интерес учащихся к теме урока",
              key: "k_2_4",
              width: 50,
            },
            {
              header:
                "Учитель применяет приемы активизации познавательной деятельности учащихся и диалоговые технологии",
              key: "k_2_5",
              width: 50,
            },
            {
              header:
                "Учитель организует самостоятельную работу учащихся с учебником",
              key: "k_2_6",
              width: 50,
            },
            {
              header:
                "Учитель формирует универсальные учебные действия учащихся на предметном материале урока ",
              key: "k_2_7",
              width: 50,
            },
            {
              header:
                "Учитель использует разнообразные способы и средства обратной связи с учащимися",
              key: "k_2_8",
              width: 50,
            },
            {
              header:
                "Учитель организует разнообразные формы учебного сотрудничества учащихся ",
              key: "k_2_9",
              width: 50,
            },
            {
              header: "* На уроке организована проектная деятельность учащихся",
              key: "k_2_10",
              width: 50,
            },
            {
              header:
                "* На уроке организована учебно-исследовательская деятельность учащихся",
              key: "k_2_11",
              width: 50,
            },
            {
              header:
                "Учитель применяет на уроке приемы формирующего оценивания (задания на самооценку, рефлексивные вопросы, которые помогают учащимся осознать свои затруднения и достижения на уроке)",
              key: "k_2_12",
              width: 50,
            },
            {
              header:
                "Учитель оценивает выполнение заданий на уроке учащимися на основе критериев оценки",
              key: "k_2_13",
              width: 50,
            },
            {
              header: "Учитель комментирует выставленные отметки",
              key: "k_2_14",
              width: 50,
            },
            {
              header:
                "Учитель организует на уроке рефлексию учащихся с учетом их возрастных особенностей",
              key: "k_2_15",
              width: 50,
            },
            {
              header:
                "Учитель использует наглядность (знаково-символические средства, модели и другое)",
              key: "k_2_16",
              width: 50,
            },
            {
              header:
                "Учитель организует работу учащихся с разнообразным учебным материалом (тексты, таблица, схема, график, видео, аудио) ",
              key: "k_2_17",
              width: 50,
            },
            {
              header:
                "Учитель использует на уроке электронные учебные материалы и ресурсы Интернета",
              key: "k_2_18",
              width: 50,
            },
            {
              header: "* Учитель использует ИКТ-технологии",
              key: "k_2_19",
              width: 50,
            },
            {
              header:
                "* Учитель использует разнообразные справочные материалы (словари, энциклопедии, справочники) ",
              key: "k_2_20",
              width: 50,
            },
            {
              header:
                "Учитель чередует различные виды деятельности учащихся, соблюдая требования СанПиН и СП",
              key: "k_2_21",
              width: 50,
            },
            {
              header:
                "Учитель включает в урок динамические паузы (физкультминутки), проводит комплекс упражнений для профилактики сколиоза, утомления глаз учащихся",
              key: "k_2_22",
              width: 50,
            },
            { header: "Вывод", key: "conclusion_second_block", width: 30 },
            { header: "Сумма баллов", key: "commonValue", width: 50 },
            { header: "Оценка", key: "level", width: 50 },
            { header: "Источник ФИО", key: "source_fio", width: 50 },
            { header: "Субьект оценивания:", key: "name_source", width: 30 },
            { header: "Наименование ОО", key: "school_name", width: 30 },
          ];

          worksheet.addRows(jsonsingleCard);

          let dt = new Date();
          let dtName =
            dt.getDate() + "-" + dt.getMonth() + 1 + "-" + dt.getFullYear();
          let excelFileName = teacher[0].surname + "-" + dtName;

          await workbook.xlsx.writeFile(
            `files/excels/schools/tmp/${excelFileName}.xlsx`
          );

          return res.download(
            path.join(
              __dirname,
              "..",
              "..",
              "files",
              "excels",
              "schools",
              "tmp",
              `${excelFileName}.xlsx`
            ),
            (err) => {
              if (err) {
                console.log("Ошибка при скачивании" + err);
              }
            }
          );
        }

        if (req.body.method_rec) {
          const jsonsingleCard = JSON.parse(JSON.stringify(singleCard));

          const k_2_1 = await SchoolCard.getRecommendation({
            k_param: "k_2_1",
            v_param: jsonsingleCard[0].k_2_1,
          });

          const k_2_2 = await SchoolCard.getRecommendation({
            k_param: "k_2_2",
            v_param: jsonsingleCard[0].k_2_2,
          });

          const k_2_3 = await SchoolCard.getRecommendation({
            k_param: "k_2_3",
            v_param: jsonsingleCard[0].k_2_3,
          });
          const k_2_4 = await SchoolCard.getRecommendation({
            k_param: "k_2_4",
            v_param: jsonsingleCard[0].k_2_4,
          });

          const k_2_5 = await SchoolCard.getRecommendation({
            k_param: "k_2_5",
            v_param: jsonsingleCard[0].k_2_5,
          });
          const k_2_6 = await SchoolCard.getRecommendation({
            k_param: "k_2_6",
            v_param: jsonsingleCard[0].k_2_6,
          });
          const k_2_7 = await SchoolCard.getRecommendation({
            k_param: "k_2_7",
            v_param: jsonsingleCard[0].k_2_7,
          });
          const k_2_8 = await SchoolCard.getRecommendation({
            k_param: "k_2_8",
            v_param: jsonsingleCard[0].k_2_8,
          });
          const k_2_9 = await SchoolCard.getRecommendation({
            k_param: "k_2_9",
            v_param: jsonsingleCard[0].k_2_9,
          });
          const k_2_10 = await SchoolCard.getRecommendation({
            k_param: "k_2_10",
            v_param: jsonsingleCard[0].k_2_10,
          });
          const k_2_11 = await SchoolCard.getRecommendation({
            k_param: "k_2_11",
            v_param: jsonsingleCard[0].k_2_11,
          });
          const k_2_12 = await SchoolCard.getRecommendation({
            k_param: "k_2_12",
            v_param: jsonsingleCard[0].k_2_12,
          });
          const k_2_13 = await SchoolCard.getRecommendation({
            k_param: "k_2_13",
            v_param: jsonsingleCard[0].k_2_13,
          });
          const k_2_14 = await SchoolCard.getRecommendation({
            k_param: "k_2_14",
            v_param: jsonsingleCard[0].k_2_14,
          });
          const k_2_15 = await SchoolCard.getRecommendation({
            k_param: "k_2_15",
            v_param: jsonsingleCard[0].k_2_15,
          });
          const k_2_16 = await SchoolCard.getRecommendation({
            k_param: "k_2_16",
            v_param: jsonsingleCard[0].k_2_16,
          });
          const k_2_17 = await SchoolCard.getRecommendation({
            k_param: "k_2_17",
            v_param: jsonsingleCard[0].k_2_17,
          });
          const k_2_18 = await SchoolCard.getRecommendation({
            k_param: "k_2_18",
            v_param: jsonsingleCard[0].k_2_18,
          });
          const k_2_19 = await SchoolCard.getRecommendation({
            k_param: "k_2_19",
            v_param: jsonsingleCard[0].k_2_19,
          });
          const k_2_20 = await SchoolCard.getRecommendation({
            k_param: "k_2_20",
            v_param: jsonsingleCard[0].k_2_20,
          });
          const k_2_21 = await SchoolCard.getRecommendation({
            k_param: "k_2_21",
            v_param: jsonsingleCard[0].k_2_21,
          });
          const k_2_22 = await SchoolCard.getRecommendation({
            k_param: "k_2_22",
            v_param: jsonsingleCard[0].k_2_22,
          });

          const doc = new Document();

          doc.addSection({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `ФИО учителя: ${teacher[0].surname} ${teacher[0].firstname} ${teacher[0].patronymic}`,
                    bold: true,
                  }),
                  new TextRun("  "),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Школа: ${school[0].school_name}`,
                    bold: true,
                  }),
                  new TextRun("  "),
                ],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: `город/район: ${school[0].title_area}`,
                    bold: true,
                  }),
                  new TextRun("  "),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text:
                      "                                                    ЗАКЛЮЧЕНИЕ ПО ИТОГУ АНАЛИЗА УРОКА",
                    bold: true,
                  }),
                  new TextRun("  "),
                ],
              }),

              new Paragraph({
                children: [new TextRun("   ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: "Категория: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: k_2_1[0].category,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_1[0].title,
                    bold: true,
                  }),
                  new TextRun("  "),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),

              new Paragraph({
                children: [new TextRun(k_2_1[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_2[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_2[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_3[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_3[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_4[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_4[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_5[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_5[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_6[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_6[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_7[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun(k_2_7[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_8[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_8[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_9[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_9[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_10[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_10[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_11[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_11[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_12[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_12[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_13[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_13[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_14[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_14[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_15[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_15[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_16[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_16[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_17[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_17[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_18[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_18[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_19[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_19[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_20[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_20[0].content)],
              }),

              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_21[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_21[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_22[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: "Экспертная оценка: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: conclusion_second_block,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),

              //////////////////////////////конец второго пункта

              //////////////////////////////конец 10-го пункта
            ],
          });

          let excelFileName = teacher[0].surname + "-" + Date.now();

          await Packer.toBuffer(doc).then((buffer) => {
            fs.writeFileSync(
              `files/excels/schools/tmp/${excelFileName}.docx`,
              buffer,
              (err) => {
                if (err) throw err;
              }
            );
          });

          return res.download(
            path.join(
              __dirname,
              "..",
              "..",
              "files",
              "excels",
              "schools",
              "tmp",
              `${excelFileName}.docx`
            ),
            (err) => {
              if (err) {
                console.log("Ошибка при скачивании" + err);
              }
            }
          );
        }

        if (req.body.delete_teacher_school && req.body.delete_teacher_id) {
          // Удалить оценку в карте учителя

          req.body["id_card"] = req.params["id_card"];
          req.body["session"] = req.params;

          let deleteMarkInCard = await SchoolCard.deleteMarkInCard(req.body);
          console.log(deleteMarkInCard);
          if (deleteMarkInCard.affectedRows) {
            req.flash("notice", notice_base.success_delete_rows);
            res.redirect(
              `/methodist/cabinet/school/${school_id}/area/${area_id}/methodist/${methodist_id}/analysis/${teacher_id}`
            );
          } else {
            req.flash("error", error_base.wrong_sql_insert);
            res
              .status(422)
              .redirect(
                `/methodist/cabinet/school/${school_id}/area/${area_id}/methodist/${methodist_id}/analysis/${teacher_id}`
              );
          }
        }

        return res.render("methodist_school_teacher_card_single_method", {
          layout: "maincard",
          title: "Личная карта учителя",
          school_name,
          teacher,
          singleCard,
          authorCard,
          teacher_id,
          id_methodist: req.params.methodist_id,
          resultSecond,
          secondInterest,
          create_mark_date,
          sourceData,
          specialVal,
          area_id,
          school_id: school[0].id_school,
          project_name: project[0].name_project,
          project_id: project[0].id_project,
          error: req.flash("error"),
          notice: req.flash("notice"),
        });
      } else if (req.params.id_project == 3) {
        console.log("Данный раздел находится в разработке");
        return res.render("admin_page_not_ready", {
          layout: "main",
          title: "Ошибка",
          title: "Предупрехждение",
          error: req.flash("error"),
          notice: req.flash("notice"),
        });
      } else {
        console.log("Ошибка в выборе проекта");
        console.log(req.params);
        return res.status(404).render("404_error_template", {
          layout: "404",
          title: "Страница не найдена!",
        });
      }
    } else {
      req.session.isAuthenticated = false;
      req.session.destroy((err) => {
        if (err) {
          throw err;
        } else {
          res.redirect("/auth");
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
};

/**
 * END
 */

/**
 * РАБОТЫ С КАРТАМИ
 * Комплексная карта
 */

/** Получить карту комлексную для оценивания
 * + обработака и добавление новой оценки
 */

exports.addMarkForTeacherAllforMethodist = async (req, res) => {
  try {
    if (req.session.user) {
      req.params.project_id = 2;
      const project = await SchoolProject.getInfoFromProjectById(req.params);

      if (!project.length) {
        return res.status(422).redirect("/methodist/cabinet");
      }

      const current_date = dateformat();

      const projectsIssetSchool = await SchoolProject.getAllProjectsWithThisSchool(
        req.params
      );

      let resultA = [];

      for (let i = 0; i < projectsIssetSchool.length; i++) {
        if (project[0].id_project == projectsIssetSchool[i].project_id) {
          resultA.push(project[0].id_project);
        }
      }

      if (!resultA.length || resultA == 1) {
        return res.status(422).redirect("/methodist/cabinet");
      }

      const teacher = await SchoolTeacher.getProfileByTeacherId(req.params);
      if (!teacher.length) {
        return res.status(422).redirect("/methodist/cabinet");
      }

      const teacher_id = await teacher[0].id_teacher;
      const school = await SchoolCabinet.getSchoolData(req.params);
      const school_id = await school[0].id_school;
      const school_name = await school[0].school_name;
      const title_area = await school[0].title_area;
      const area_id = await school[0].area_id;
      const disciplineListByTeacherId = await SchoolTeacher.disciplineListByTeacherId(
        req.params
      );
      const methodist_info = await SchoolTeacher.mainInfoByMethodistId(
        req.params
      );
      const project_id = await project[0].id_project;

      if (req.body.id_teacher && req.body._csrf) {
        const id_methodist = methodist_info[0]["id_user"];
        const errors = validationResult(req);
        console.log(req.body);

        if (!errors.isEmpty()) {
          console.log("Ошибки валидации:", errors.array()); // Логируем ошибки валидации

          req.flash("error", error_base.empty_input);
          return res
            .status(422)
            .redirect(
              `/methodist/cabinet/school/${school_id}/area/${area_id}/methodist/${id_methodist}/analysis/${teacher_id}`
            );
        }

        req.body.id_methodist = req.params.id_methodist;

        req.body.source_fio =
          methodist_info[0]["surname"] +
          " " +
          methodist_info[0]["firstname"] +
          " " +
          methodist_info[0]["patronymic"];
        req.body.position_name = methodist_info[0]["title_position"];
        req.body.source_workplace = methodist_info[0]["department"];
        req.body.source_id = 1;
        req.body.date_create = getMoscowDateTime();

        let lastId = await SchoolCard.createNewMarkInCardAll(req.body);

        if (lastId) {
          req.flash("notice", notice_base.success_insert_sql);
          return res
            .status(200)
            .redirect(
              `/methodist/cabinet/school/${school_id}/area/${area_id}/methodist/${id_methodist}/analysis/${teacher_id}`
            );
        } else {
          req.flash("error", error_base.wrong_sql_insert);
          return res
            .status(422)
            .redirect(
              `/methodist/cabinet/school/${school_id}/area/${area_id}/methodist/${id_methodist}/analysis/${teacher_id}`
            );
        }
      }

      return res.render(
        "card_templates/methodist_school_teacher_card_add_mark_all",
        {
          layout: "maincard",
          title: "Оценить урок",
          teacher,
          teacher_id,
          school_id,
          project_id,
          id_methodist: req.params.id_methodist,
          school_name,
          disciplineListByTeacherId,
          title_area,
          current_date,
          error: req.flash("error"),
          notice: req.flash("notice"),
        }
      );
    } else {
      req.session.isAuthenticated = false;
      req.session.destroy((err) => {
        if (err) {
          throw err;
        } else {
          res.redirect("/auth");
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
};

/** END BLOCK */

/**
 *
 *  Показ результат по шаблону карты - кмоплексная карта
 *  удалить оценку/скачать метод реком/отправить по эл
 */

exports.getSingleCardByIdFullForMethodist = async (req, res) => {
  try {
    if (req.session.user) {
      req.params.project_id = 2;
      req.params.school_id = req.params.id_school;
      const methodist_id = req.params.methodist_id;
      let authorCard;

      const school = await SchoolCabinet.getSchoolData(req.params);
      const school_id = school[0]["id_school"];
      const area_id = school[0]["area_id"];
      const school_name = await school[0].school_name;
      const project = await SchoolProject.getInfoFromProjectById(req.params);
      if (!project.length) {
        return res.status(422).redirect("/school/cabinet");
      }
      const projectsIssetSchool = await SchoolProject.getAllProjectsWithThisSchool(
        req.params
      );
      let resultA = [];
      for (let i = 0; i < projectsIssetSchool.length; i++) {
        if (project[0].id_project == projectsIssetSchool[i].project_id) {
          resultA.push(project[0].id_project);
        }
      }
      if (!resultA.length || resultA == 1) {
        return res.status(422).redirect("/methodist/cabinet");
      }

      if (req.params.project_id == 2) {
        const singleCard = await SchoolCard.getSingleCard(req.params);
        console.log("singleCard", singleCard);
        console.log("methodist_id", methodist_id);

        if (singleCard[0]["methodist_id"] === methodist_id) {
          console.log("автор");
          authorCard = true;
        } else {
          console.log("не авторh");
        }

        if (!singleCard.length) {
          return res.status(422).redirect("/methodist/cabinet");
        }
        const teacher_id = await singleCard[0].teacher_id;
        const teacher = await SchoolTeacher.getProfileByTeacherId({
          teacher_id,
        });

        let firstBloc =
          singleCard[0].k_1_1 +
          singleCard[0].k_1_2 +
          singleCard[0].k_1_3 +
          singleCard[0].k_1_4 +
          singleCard[0].k_1_5 +
          singleCard[0].k_1_6 +
          singleCard[0].k_1_7;

        let secondBloc =
          singleCard[0].k_2_1 +
          singleCard[0].k_2_2 +
          singleCard[0].k_2_3 +
          singleCard[0].k_2_4 +
          singleCard[0].k_2_5 +
          singleCard[0].k_2_6 +
          singleCard[0].k_2_7 +
          singleCard[0].k_2_8 +
          singleCard[0].k_2_9 +
          singleCard[0].k_2_10 +
          singleCard[0].k_2_11 +
          singleCard[0].k_2_12 +
          singleCard[0].k_2_13 +
          singleCard[0].k_2_14 +
          singleCard[0].k_2_15 +
          singleCard[0].k_2_16 +
          singleCard[0].k_2_17 +
          singleCard[0].k_2_18 +
          singleCard[0].k_2_19 +
          singleCard[0].k_2_20 +
          singleCard[0].k_2_21 +
          singleCard[0].k_2_22;

        let thirdBloc =
          singleCard[0].k_3_1 + singleCard[0].k_3_2 + singleCard[0].k_3_3;
        let fourthBloc =
          singleCard[0].k_4_1 + singleCard[0].k_4_2 + singleCard[0].k_4_3;

        let firstInterest = Math.round((firstBloc * 100) / 13);
        let secondInterest = Math.round((secondBloc * 100) / 33);
        let thirdInterest = Math.round((thirdBloc * 100) / 6);
        let fourthInterest = Math.round((fourthBloc * 100) / 6);

        function calculateInterest(num, text) {
          const property = {};

          if (num >= 75) {
            property.level = "Выше базового уровня ";
            property.levelText = "Уровень " + text + " выше базового";
            property.levelStyle = "success";
          } else if (num >= 50 && num <= 74) {
            property.level = "Базовый уровень";
            property.levelText = "Базовый уровень " + text;
            property.levelStyle = "good";
          } else if (num <= 49) {
            property.level = "Ниже базового уровня (критический)";
            property.levelText = "Уровень " + text + " ниже базового";
            property.levelStyle = "danger";
          }
          return property;
        }

        let resultFirst = calculateInterest(
          firstInterest,
          "предметных компетенций"
        );
        let resultSecond = calculateInterest(
          secondInterest,
          "методических компетенций"
        );
        let resultThird = calculateInterest(
          thirdInterest,
          "психолого-педагогических компетенций"
        );
        let resultFourth = calculateInterest(
          fourthInterest,
          "коммуникативных компетенций"
        );

        const firstBlockInfo = {
          num: 1,
          highLevelMax: 13,
          highLevelMin: 10,
          baseLevelMax: 9,
          baseLevelMin: 6,
          lowLevelMax: 5,
        };

        const secondBlockInfo = {
          num: 2,
          highLevelMax: 34,
          highLevelMin: 25,
          baseLevelMax: 24,
          baseLevelMin: 17,
          lowLevelMax: 16,
        };

        const thirdBlockInfo = {
          num: 3,
          highLevelMax: 6,
          highLevelMin: 4,
          borderTwo: 3,
          borderOne: 2,
        };

        const fourthBlockInfo = {
          num: 4,
          highLevelMax: 6,
          highLevelMin: 4,
          borderTwo: 3,
          borderOne: 2,
        };

        const levelNum1 = checkFromSQL(firstBloc, firstBlockInfo);
        const levelNum2 = checkFromSQL(secondBloc, secondBlockInfo);
        const levelNum3 = checkFromSQL2(thirdBloc, thirdBlockInfo);
        const levelNum4 = checkFromSQL2(fourthBloc, fourthBlockInfo);

        const conclusion_first_block = await SchoolCard.getConclusion({
          levelNum: levelNum1,
          num_bloc: firstBlockInfo.num,
        });
        const conclusion_second_block = await SchoolCard.getConclusion({
          levelNum: levelNum2,
          num_bloc: secondBlockInfo.num,
        });
        const conclusion_third_block = await SchoolCard.getConclusion({
          levelNum: levelNum3,
          num_bloc: thirdBlockInfo.num,
        });
        const conclusion_fourth_block = await SchoolCard.getConclusion({
          levelNum: levelNum4,
          num_bloc: fourthBlockInfo.num,
        });

        const d = singleCard[0].create_mark_date.getDate();
        const m = singleCard[0].create_mark_date.getMonth();
        const month = [
          "января",
          "февраля",
          "марта",
          "апреля",
          "мая",
          "июня",
          "июля",
          "августа",
          "сентября",
          "октября",
          "ноября",
          "декабря",
        ];
        const y = singleCard[0].create_mark_date.getFullYear();
        const create_mark_date = `${d}  ${month[m]} ${y}`;
        let sourceData;
        if (singleCard[0].source_id == 2) {
          sourceData = "Внтуришкольная";
        } else {
          sourceData =
            singleCard[0].source_fio +
            ", " +
            singleCard[0].position_name +
            " ( " +
            singleCard[0].source_workplace +
            ")";
        }
        const specialVal = [];
        specialVal["k_1_7"] = setValueForInput(singleCard[0].k_1_7);
        specialVal["k_2_10"] = setValueForInput(singleCard[0].k_2_10);
        specialVal["k_2_11"] = setValueForInput(singleCard[0].k_2_11);
        specialVal["k_2_19"] = setValueForInput(singleCard[0].k_2_19);
        specialVal["k_2_20"] = setValueForInput(singleCard[0].k_2_20);
        specialVal["k_4_3"] = setValueForInput(singleCard[0].k_4_3);

        singleCard[0].fio =
          teacher[0].surname +
          " " +
          teacher[0].firstname +
          " " +
          teacher[0].patronymic;
        singleCard[0].position = teacher[0].title_position;
        singleCard[0].school_name = school_name;

        if (req.body.excel_tbl) {
          const jsonsingleCard = JSON.parse(JSON.stringify(singleCard));
          let workbook = new excel.Workbook();
          let worksheet = workbook.addWorksheet("Singlecard");

          worksheet.columns = [
            { header: "ФИО", key: "fio", width: 10 },
            { header: "Должность", key: "position", width: 30 },
            { header: "Предмет", key: "title_discipline", width: 30 },
            { header: "Экспертная оценка:", key: "expertRes", width: 30 },
            {
              header:
                "Учитель проводит урок по теме, которая соответствует теме в его рабочей программе и календарно-тематическом плане ",
              key: "k_1_1",
              width: 50,
            },
            {
              header:
                "Учитель направляет внимание учащихся на тему урока и на главные (новые) слова в ней",
              key: "k_1_2",
              width: 50,
            },
            {
              header:
                "Учитель организует самостоятельную работу учащихся с учебником",
              key: "k_1_3",
              width: 50,
            },
            {
              header: "Учитель владеет материалом по теме урока",
              key: "k_1_4",
              width: 50,
            },
            {
              header: "Учитель обучает учащихся работать с ошибками",
              key: "k_1_5",
              width: 50,
            },
            {
              header:
                "Учитель обучает учащихся устанавливать связи между знаниями по теме урока и знаниями из других тем (внутрипредметные связи)",
              key: "k_1_6",
              width: 50,
            },
            {
              header:
                "* Учитель обучает учащихся устанавливать связи между знаниями по теме урока и знаниями из других учебных предметов (межпредметные связи) ",
              key: "k_1_7",
              width: 50,
            },
            { header: "Вывод", key: "conclusion_first_block", width: 30 },
            {
              header:
                "Учитель обучает учащихся ставить учебную цель, используя проблемные вопросы, смысловые догадки, метод ассоциаций и другое",
              key: "k_2_1",
              width: 50,
            },
            {
              header:
                "Цель урока сформулирована так, что ее достижение можно проверить",
              key: "k_2_2",
              width: 50,
            },
            {
              header:
                " Составлены критерии оценки деятельности и результатов учащихся на уроке",
              key: "k_2_3",
              width: 50,
            },
            {
              header:
                "Учитель формирует положительную учебную мотивацию, интерес учащихся к теме урока",
              key: "k_2_4",
              width: 50,
            },
            {
              header:
                "Учитель применяет приемы активизации познавательной деятельности учащихся и диалоговые технологии",
              key: "k_2_5",
              width: 50,
            },
            {
              header:
                "Учитель организует самостоятельную работу учащихся с учебником",
              key: "k_2_6",
              width: 50,
            },
            {
              header:
                "Учитель формирует универсальные учебные действия учащихся на предметном материале урока ",
              key: "k_2_7",
              width: 50,
            },
            {
              header:
                "Учитель использует разнообразные способы и средства обратной связи с учащимися",
              key: "k_2_8",
              width: 50,
            },
            {
              header:
                "Учитель организует разнообразные формы учебного сотрудничества учащихся ",
              key: "k_2_9",
              width: 50,
            },
            {
              header: "* На уроке организована проектная деятельность учащихся",
              key: "k_2_10",
              width: 50,
            },
            {
              header:
                "* На уроке организована учебно-исследовательская деятельность учащихся",
              key: "k_2_11",
              width: 50,
            },
            {
              header:
                "Учитель применяет на уроке приемы формирующего оценивания (задания на самооценку, рефлексивные вопросы, которые помогают учащимся осознать свои затруднения и достижения на уроке)",
              key: "k_2_12",
              width: 50,
            },
            {
              header:
                "Учитель оценивает выполнение заданий на уроке учащимися на основе критериев оценки",
              key: "k_2_13",
              width: 50,
            },
            {
              header: "Учитель комментирует выставленные отметки",
              key: "k_2_14",
              width: 50,
            },
            {
              header:
                "Учитель организует на уроке рефлексию учащихся с учетом их возрастных особенностей",
              key: "k_2_15",
              width: 50,
            },
            {
              header:
                "Учитель использует наглядность (знаково-символические средства, модели и другое)",
              key: "k_2_16",
              width: 50,
            },
            {
              header:
                "Учитель организует работу учащихся с разнообразным учебным материалом (тексты, таблица, схема, график, видео, аудио) ",
              key: "k_2_17",
              width: 50,
            },
            {
              header:
                "Учитель использует на уроке электронные учебные материалы и ресурсы Интернета",
              key: "k_2_18",
              width: 50,
            },
            {
              header: "* Учитель использует ИКТ-технологии",
              key: "k_2_19",
              width: 50,
            },
            {
              header:
                "* Учитель использует разнообразные справочные материалы (словари, энциклопедии, справочники) ",
              key: "k_2_20",
              width: 50,
            },
            {
              header:
                "Учитель чередует различные виды деятельности учащихся, соблюдая требования СанПиН и СП",
              key: "k_2_21",
              width: 50,
            },
            {
              header:
                "Учитель включает в урок динамические паузы (физкультминутки), проводит комплекс упражнений для профилактики сколиоза, утомления глаз учащихся",
              key: "k_2_22",
              width: 50,
            },
            { header: "Вывод", key: "conclusion_second_block", width: 30 },
            {
              header:
                "Учитель формирует ценность здоровья и безопасного образа жизни у обучающихся",
              key: "k_3_1",
              width: 50,
            },
            {
              header:
                "Учитель организует обучение учащихся на основе дифференциации и индивидуализации с учетом особенностей их когнитивного и эмоционального развития",
              key: "k_3_2",
              width: 50,
            },
            {
              header:
                "Учитель применяет приемы развития внимания и памяти, мышления и речи, критического мышления и креативности учащихся ",
              key: "k_3_3",
              width: 50,
            },
            { header: "Вывод", key: "conclusion_third_block", width: 30 },
            {
              header:
                "Учитель организует общение и взаимодействие с учащимися на уроке",
              key: "k_4_1",
              width: 50,
            },
            {
              header:
                "Учитель организует совместную деятельность учащихся в командах (группах)",
              key: "k_4_2",
              width: 50,
            },
            {
              header:
                "* Учитель умеет работать с конфликтной ситуацией на уроке",
              key: "k_4_3",
              width: 50,
            },
            { header: "Вывод", key: "conclusion_fourth_block", width: 30 },
            { header: "Сумма баллов", key: "commonValue", width: 50 },
            { header: "Оценка", key: "level", width: 50 },
            { header: "Источник ФИО", key: "source_fio", width: 50 },
            { header: "Субьект оценивания:", key: "name_source", width: 30 },
            { header: "Наименование ОО", key: "school_name", width: 30 },
          ];

          worksheet.addRows(jsonsingleCard);

          let dt = new Date();
          let dtName =
            dt.getDate() + "-" + dt.getMonth() + 1 + "-" + dt.getFullYear();
          let excelFileName = teacher[0].surname + "-" + dtName;

          await workbook.xlsx.writeFile(
            `files/excels/schools/tmp/${excelFileName}.xlsx`
          );

          return res.download(
            path.join(
              __dirname,
              "..",
              "..",
              "files",
              "excels",
              "schools",
              "tmp",
              `${excelFileName}.xlsx`
            ),
            (err) => {
              if (err) {
                console.log("Ошибка при скачивании" + err);
              }
            }
          );
        }

        if (req.body.method_rec) {
          const jsonsingleCard = JSON.parse(JSON.stringify(singleCard));

          const k_1_1 = await SchoolCard.getRecommendation({
            k_param: "k_1_1",
            v_param: jsonsingleCard[0].k_1_1,
          });
          const k_1_2 = await SchoolCard.getRecommendation({
            k_param: "k_1_2",
            v_param: jsonsingleCard[0].k_1_2,
          });

          const k_1_3 = await SchoolCard.getRecommendation({
            k_param: "k_1_3",
            v_param: jsonsingleCard[0].k_1_3,
          });

          const k_1_4 = await SchoolCard.getRecommendation({
            k_param: "k_1_4",
            v_param: jsonsingleCard[0].k_1_4,
          });

          const k_1_5 = await SchoolCard.getRecommendation({
            k_param: "k_1_5",
            v_param: jsonsingleCard[0].k_1_5,
          });
          const k_1_6 = await SchoolCard.getRecommendation({
            k_param: "k_1_6",
            v_param: jsonsingleCard[0].k_1_6,
          });
          const k_1_7 = await SchoolCard.getRecommendation({
            k_param: "k_1_7",
            v_param: jsonsingleCard[0].k_1_7,
          });
          const k_2_1 = await SchoolCard.getRecommendation({
            k_param: "k_2_1",
            v_param: jsonsingleCard[0].k_2_1,
          });

          const k_2_2 = await SchoolCard.getRecommendation({
            k_param: "k_2_2",
            v_param: jsonsingleCard[0].k_2_2,
          });

          const k_2_3 = await SchoolCard.getRecommendation({
            k_param: "k_2_3",
            v_param: jsonsingleCard[0].k_2_3,
          });
          const k_2_4 = await SchoolCard.getRecommendation({
            k_param: "k_2_4",
            v_param: jsonsingleCard[0].k_2_4,
          });

          const k_2_5 = await SchoolCard.getRecommendation({
            k_param: "k_2_5",
            v_param: jsonsingleCard[0].k_2_5,
          });
          const k_2_6 = await SchoolCard.getRecommendation({
            k_param: "k_2_6",
            v_param: jsonsingleCard[0].k_2_6,
          });
          const k_2_7 = await SchoolCard.getRecommendation({
            k_param: "k_2_7",
            v_param: jsonsingleCard[0].k_2_7,
          });
          const k_2_8 = await SchoolCard.getRecommendation({
            k_param: "k_2_8",
            v_param: jsonsingleCard[0].k_2_8,
          });
          const k_2_9 = await SchoolCard.getRecommendation({
            k_param: "k_2_9",
            v_param: jsonsingleCard[0].k_2_9,
          });
          const k_2_10 = await SchoolCard.getRecommendation({
            k_param: "k_2_10",
            v_param: jsonsingleCard[0].k_2_10,
          });
          const k_2_11 = await SchoolCard.getRecommendation({
            k_param: "k_2_11",
            v_param: jsonsingleCard[0].k_2_11,
          });
          const k_2_12 = await SchoolCard.getRecommendation({
            k_param: "k_2_12",
            v_param: jsonsingleCard[0].k_2_12,
          });
          const k_2_13 = await SchoolCard.getRecommendation({
            k_param: "k_2_13",
            v_param: jsonsingleCard[0].k_2_13,
          });
          const k_2_14 = await SchoolCard.getRecommendation({
            k_param: "k_2_14",
            v_param: jsonsingleCard[0].k_2_14,
          });
          const k_2_15 = await SchoolCard.getRecommendation({
            k_param: "k_2_15",
            v_param: jsonsingleCard[0].k_2_15,
          });
          const k_2_16 = await SchoolCard.getRecommendation({
            k_param: "k_2_16",
            v_param: jsonsingleCard[0].k_2_16,
          });
          const k_2_17 = await SchoolCard.getRecommendation({
            k_param: "k_2_17",
            v_param: jsonsingleCard[0].k_2_17,
          });
          const k_2_18 = await SchoolCard.getRecommendation({
            k_param: "k_2_18",
            v_param: jsonsingleCard[0].k_2_18,
          });
          const k_2_19 = await SchoolCard.getRecommendation({
            k_param: "k_2_19",
            v_param: jsonsingleCard[0].k_2_19,
          });
          const k_2_20 = await SchoolCard.getRecommendation({
            k_param: "k_2_20",
            v_param: jsonsingleCard[0].k_2_20,
          });
          const k_2_21 = await SchoolCard.getRecommendation({
            k_param: "k_2_21",
            v_param: jsonsingleCard[0].k_2_21,
          });
          const k_2_22 = await SchoolCard.getRecommendation({
            k_param: "k_2_22",
            v_param: jsonsingleCard[0].k_2_22,
          });
          const k_3_1 = await SchoolCard.getRecommendation({
            k_param: "k_3_1",
            v_param: jsonsingleCard[0].k_3_1,
          });
          const k_3_2 = await SchoolCard.getRecommendation({
            k_param: "k_3_2",
            v_param: jsonsingleCard[0].k_3_2,
          });
          const k_3_3 = await SchoolCard.getRecommendation({
            k_param: "k_3_3",
            v_param: jsonsingleCard[0].k_3_3,
          });

          const k_4_1 = await SchoolCard.getRecommendation({
            k_param: "k_4_1",
            v_param: jsonsingleCard[0].k_4_1,
          });
          const k_4_2 = await SchoolCard.getRecommendation({
            k_param: "k_4_2",
            v_param: jsonsingleCard[0].k_4_2,
          });
          const k_4_3 = await SchoolCard.getRecommendation({
            k_param: "k_4_3",
            v_param: jsonsingleCard[0].k_4_3,
          });

          const doc = new Document();

          doc.addSection({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `ФИО учителя: ${teacher[0].surname} ${teacher[0].firstname} ${teacher[0].patronymic}`,
                    bold: true,
                  }),
                  new TextRun("  "),
                ],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Школа: ${school[0].school_name}`,
                    bold: true,
                  }),
                  new TextRun("  "),
                ],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: `город/район: ${school[0].title_area}`,
                    bold: true,
                  }),
                  new TextRun("  "),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text:
                      "                                                    ЗАКЛЮЧЕНИЕ ПО ИТОГУ АНАЛИЗА УРОКА",
                    bold: true,
                  }),
                  new TextRun("  "),
                ],
              }),

              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [
                  new TextRun(
                    "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -"
                  ),
                ],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: "Категория: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: k_1_1[0].category,
                    bold: true,
                  }),
                ],
              }),

              new Paragraph({
                children: [new TextRun("   ")],
              }),

              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: k_1_1[0]["title"],
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun(k_1_1[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_1_2[0]["title"],
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun(k_1_2[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_1_3[0]["title"], //1.3. Учитель организует самостоятельную работу учащихся с учебником
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun(k_1_3[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_1_4[0]["title"],
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun(k_1_4[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_1_5[0]["title"],
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun(k_1_5[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_1_6[0]["title"],
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun(k_1_6[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_1_7[0]["title"],
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun(k_1_7[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Экспертная оценка: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: conclusion_first_block,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              //////////////////////////////конец первой группы ПРЕДМЕТНЫЕ

              new Paragraph({
                children: [
                  new TextRun(
                    "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -"
                  ),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: "Категория: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: k_2_1[0].category,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_1[0].title,
                    bold: true,
                  }),
                  new TextRun("  "),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),

              new Paragraph({
                children: [new TextRun(k_2_1[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_2[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_2[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_3[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_3[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_4[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_4[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_5[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_5[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_6[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_6[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_7[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun(k_2_7[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_8[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_8[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_9[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_9[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_10[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_10[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_11[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_11[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_12[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_12[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_13[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_13[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_14[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_14[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_15[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_15[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_16[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_16[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_17[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_17[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_18[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_18[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_19[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_19[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_20[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_20[0].content)],
              }),

              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_21[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_21[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_2_22[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [new TextRun(k_2_22[0].content)],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Экспертная оценка: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: conclusion_second_block,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),

              //////////////////////////////конец второго пункта

              new Paragraph({
                children: [
                  new TextRun(
                    "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -"
                  ),
                ],
              }),

              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Категория: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: k_3_1[0].category,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_3_1[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun(k_3_1[0].content)],
              }),

              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_3_2[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun(k_3_2[0].content)],
              }),

              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_3_3[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun(k_3_3[0].content)],
              }),

              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Экспертная оценка: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: conclusion_third_block,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),

              //////////////////////////////конец третьего пункта

              new Paragraph({
                children: [
                  new TextRun(
                    "- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -"
                  ),
                ],
              }),

              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Категория: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: k_4_1[0].category,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_4_1[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun(k_4_1[0].content)],
              }),

              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_4_2[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun(k_4_2[0].content)],
              }),

              new Paragraph({
                children: [new TextRun("  ")],
              }),

              new Paragraph({
                children: [
                  new TextRun({
                    text: k_4_3[0].title,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun(k_4_3[0].content)],
              }),

              new Paragraph({
                children: [new TextRun("  ")],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Экспертная оценка: ",
                    bold: true,
                  }),
                  new TextRun({
                    text: conclusion_fourth_block,
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun("   ")],
              }),

              //////////////////////////////конец 10-го пункта
            ],
          });

          let excelFileName = teacher[0].surname + "-" + Date.now();

          await Packer.toBuffer(doc).then((buffer) => {
            fs.writeFileSync(
              `files/excels/schools/tmp/${excelFileName}.docx`,
              buffer,
              (err) => {
                if (err) throw err;
              }
            );
          });

          return res.download(
            path.join(
              __dirname,
              "..",
              "..",
              "files",
              "excels",
              "schools",
              "tmp",
              `${excelFileName}.docx`
            ),
            (err) => {
              if (err) {
                console.log("Ошибка при скачивании" + err);
              }
            }
          );
        }

        if (req.body.delete_teacher_school && req.body.delete_teacher_id) {
          // Удалить оценку в карте учителя

          req.body["id_card"] = req.params["id_card"];
          req.body["session"] = req.params;

          let deleteMarkInCard = await SchoolCard.deleteMarkInCard(req.body);
          if (deleteMarkInCard.affectedRows) {
            req.flash("notice", notice_base.success_delete_rows);
            res.redirect(
              `/methodist/cabinet/school/${school_id}/area/${area_id}/methodist/${methodist_id}/analysis/${teacher_id}`
            );
          } else {
            req.flash("error", error_base.wrong_sql_insert);
            res
              .status(422)
              .redirect(
                `/methodist/cabinet/school/${school_id}/area/${area_id}/methodist/${methodist_id}/analysis/${teacher_id}`
              );
          }
          // console.log(school[0].id_school)
        }

        return res.render("methodist_school_teacher_card_single_full", {
          layout: "maincard",
          title: "Личная карта учителя",
          school_name,
          teacher,
          singleCard,
          teacher_id,
          resultFirst,
          resultSecond,
          authorCard,
          methodist_id,
          resultThird,
          area_id,
          resultFourth,
          firstInterest,
          secondInterest,
          thirdInterest,
          fourthInterest,
          create_mark_date,
          sourceData,
          school_id,
          specialVal,
          school_id: school[0].id_school,
          project_name: project[0].name_project,
          project_id: project[0].id_project,
          error: req.flash("error"),
          notice: req.flash("notice"),
        });
      } else if (req.params.id_project == 3) {
        console.log("Данный раздел находится в разработке");
        return res.render("admin_page_not_ready", {
          layout: "main",
          title: "Ошибка",
          title: "Предупрехждение",
          error: req.flash("error"),
          notice: req.flash("notice"),
        });
      } else {
        console.log("Ошибка в выборе проекта");
        console.log(req.params);
        return res.status(404).render("404_error_template", {
          layout: "404",
          title: "Страница не найдена!",
        });
      }
    } else {
      req.session.isAuthenticated = false;
      req.session.destroy((err) => {
        if (err) {
          throw err;
        } else {
          res.redirect("/auth");
        }
      });
    }
  } catch (e) {
    console.log(e);
  }
};
