const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const dbl = require("../../middleware/dbdata");

/**
 * ######################  SELECT ROWS IN SQL #################################
 * ############################################################################
 */

/** GET PROFILE INFORMATION TEACHER BY ID */

exports.getProfileByTeacherId = async (req, res) => {
  try {
    const dbh = await mysql.createConnection(dbl());

    const teacher_id = await req.teacher_id;
    const [
      result,
      fields,
    ] = await dbh.execute(
      "SELECT teachers.id_teacher, teachers.surname, " +
        "teachers.firstname, teachers.patronymic, teachers.birthday, teachers.snils, teachers.gender_id, teachers.specialty,  " +
        "teachers.level_of_education_id, teachers.diploma, teachers.position, teachers.total_experience, teachers.teaching_experience, teachers.category_id, teachers.phone, teachers.email, teachers.avatar, " +
        "position.title_position, edu_level.title_edu_level, category.title_category, gender.id_gender, gender.gender_title " +
        "FROM  `teachers` " +
        "INNER JOIN `position` ON teachers.position = position.id_position " +
        "INNER JOIN `edu_level` ON teachers.level_of_education_id = edu_level.id_edu_level " +
        "INNER JOIN `category` ON teachers.category_id = category.id_category " +
        "INNER JOIN `gender` ON teachers.gender_id = gender.id_gender " +
        "WHERE teachers.id_teacher = ?",
      [teacher_id]
    );

    dbh.end();

    return result;
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK ----------------------------------------  */

/** GET INFORMATION ABOUT KPK TEACHER BY ID TEACHER  */

exports.getAllKpkByIdTeacher = async (req, res) => {
  try {
    const dbh = await mysql.createConnection(dbl());

    const teacher_id = await req.teacher_id;
    const [
      result,
      fields2,
    ] = await dbh.execute("SELECT * FROM training_kpk WHERE teacher_id = ?", [
      teacher_id,
    ]);

    dbh.end();
    return result;
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK ----------------------------------------  */

/** GET INFORMATION ABOUT TEACHER'S ISSET IN PROJECT BY TEACHER ID  */

exports.getInformationAboutIssetTeacherInProject = async (req, res) => {
  try {
    const dbh = await mysql.createConnection(dbl());

    const teacher_id = await req.teacher_id;

    const [projectе, fields1] = await dbh.execute(
      "SELECT * FROM project_middleware_names"
    );

    const name_table_project = [];

    for (let d = 0; d < projectе.length; d++) {
      name_table_project.push(projectе[d].tbl_name);
    }

    let dataarray = [];

    for (let op = 0; op < name_table_project.length; op++) {
      let [
        result,
        fields,
      ] = await dbh.execute(
        "SELECT tbl_name.teacher_id, tbl_name.in_project_status," +
          " tbl_name.project_id, projects.name_project FROM `" +
          name_table_project[op] +
          "` as tbl_name " +
          "INNER JOIN projects ON tbl_name.project_id = projects.id_project WHERE tbl_name.teacher_id = ? AND tbl_name.in_project_status = ? ",
        [teacher_id, 2]
      );
      if (result) {
        dataarray.push(result);
      }
    }

    let temp = [];

    for (let p = 0; p < dataarray.length; p++) {
      for (let i of dataarray[p]) i && temp.push(i);
    }

    dataarray = temp;

    dbh.end();
    return dataarray;
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK ----------------------------------------  */

/** GET ALL TEACHERS WITHOUT MEMBER LIST IN CURRENT PROJECT */

exports.getAllTeachersNotMembersInCurrentProject = async (req, res) => {
  try {
    const dbh = await mysql.createConnection(dbl());

    const school_id = await req.id_school;
    const project_id = await req.id_project;

    let name_table_project = null;

    const [projectе, fields1] = await dbh.execute(
      "SELECT * FROM project_middleware_names"
    );

    const project_array = [];

    for (let d = 0; d < projectе.length; d++) {
      project_array.push(projectе[d].tbl_name);
    }

    for (let num = 1; num < project_array.length; num++) {
      if (project_id == num + 1) {
        name_table_project = project_array[num];
      }
    }
    const [
      result,
      fields,
    ] = await dbh.execute(
      " SELECT teachers.id_teacher, teachers.firstname, teachers.surname, teachers.patronymic " +
        " FROM " +
        name_table_project +
        " as mpt INNER JOIN teachers ON mpt.teacher_id = teachers.id_teacher " +
        " WHERE teachers.school_id = ? AND mpt.in_project_status = ? ",
      [school_id, 1]
    );

    dbh.end();

    return result;
  } catch (e) {
    console.log(e);
  }
};

/** END BLOCK ----------------------------------------  */

/** GET ALL TEACHERS FROM THIS SCHOOL BY SCHOOL ID */

exports.getAllTeachersFromThisSchoolFromCurrentProject = async (req, res) => {
  try {
    const dbh = await mysql.createConnection(dbl());

    const school_id = await req.id_school;
    const project_id = await req.id_project;

    let name_table_project = null;

    const [projectе, fields1] = await dbh.execute(
      "SELECT * FROM project_middleware_names"
    );

    const project_array = [];

    for (let d = 0; d < projectе.length; d++) {
      project_array.push(projectе[d].tbl_name);
    }

    for (let num = 1; num < project_array.length; num++) {
      if (project_id == num + 1) {
        name_table_project = project_array[num];
      }
    }

    const [
      result,
      fields,
    ] = await dbh.execute(
      " SELECT teachers.id_teacher, teachers.firstname, teachers.surname, teachers.patronymic " +
        " FROM " +
        name_table_project +
        " as mpt INNER JOIN teachers ON mpt.teacher_id = teachers.id_teacher " +
        " WHERE teachers.school_id = ? AND mpt.in_project_status = ? ",
      [school_id, 2]
    );

    dbh.end();
    return result;
  } catch (e) {
    console.log(e);
  }
};

/** END BLOCK ----------------------------------------  */

/** GET GENDER */

exports.getGenders = async () => {
  try {
    const dbh = await mysql.createConnection(dbl());

    const [res, fields] = await dbh.execute("SELECT * FROM gender");

    dbh.end();
    return res;
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK ----------------------------------------  */

/** GET LEVEL EDUCATION  */

exports.getLevelEdu = async () => {
  try {
    const dbh = await mysql.createConnection(dbl());

    const [res, fields] = await dbh.execute("SELECT * FROM edu_level");

    dbh.end();
    return res;
  } catch (e) {
    console.log(e.message);
  }
};

/** END GET LEVEL EDUCATION */

/**  POSITION LIST */

exports.getPositionList = async () => {
  try {
    const dbh = await mysql.createConnection(dbl());

    const [res, fields] = await dbh.execute(
      "SELECT * FROM position ORDER BY title_position"
    );

    dbh.end();
    return res;
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK ----------------------------------------  */

/**  DISICPLINES LIST */

exports.getdisciplinesList = async () => {
  try {
    const dbh = await mysql.createConnection(dbl());

    const [res, fields] = await dbh.execute(
      "SELECT * FROM discipline_title ORDER BY title_discipline"
    );

    dbh.end();
    return res;
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK ----------------------------------------  */

/**  DISICPLINES LIST */

exports.getCategories = async () => {
  try {
    const dbh = await mysql.createConnection(dbl());

    const [res, fields] = await dbh.execute("SELECT * FROM category");

    dbh.end();
    return res;
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK ----------------------------------------  */

/** GET ALL TEACHERS FROM THIS SCHOOL BY SCHOOL ID */

exports.getAllTeachersFromThisSchool = async (req, res) => {
  try {
    const dbh = await mysql.createConnection(dbl());

    const school_id = await req.school_id;
    const [
      result,
      fields,
    ] = await dbh.execute(
      "SELECT teachers.id_teacher, teachers.surname, teachers.firstname, teachers.patronymic, teachers.phone, teachers.email," +
        "position.title_position FROM  `teachers` " +
        "INNER JOIN `position` ON teachers.position = position.id_position " +
        "WHERE teachers.school_id = ? ORDER BY teachers.surname ASC",
      [school_id]
    );

    dbh.end();
    return result;
  } catch (e) {
    console.log(e);
  }
};

/** END BLOCK ----------------------------------------  */

/** GET ALL TEACHERS FROM THIS SCHOOL BY SCHOOL ID */

exports.getMoreInformationTeachers = async (req, res) => {
  try {
    const dbh = await mysql.createConnection(dbl());

    const school_id = await req.school_id;

    const [
      result,
      fields,
    ] = await dbh.execute(
      "SELECT teachers.id_teacher, teachers.surname, " +
        " teachers.firstname, teachers.patronymic, teachers.birthday, teachers.snils, teachers.specialty,  " +
        " teachers.diploma, teachers.total_experience," +
        " teachers.teaching_experience, teachers.category_id, teachers.phone, teachers.email, teachers.avatar, " +
        " position.title_position, edu_level.title_edu_level, category.title_category, gender.id_gender, " +
        " gender.gender_title, schools.school_name, schools.id_school, area.title_area, area.id_area," +
        " training_kpk.year_training, training_kpk.place_training " +
        " FROM  `teachers` " +
        " INNER JOIN `position` ON teachers.position = position.id_position " +
        " INNER JOIN `edu_level` ON teachers.level_of_education_id = edu_level.id_edu_level " +
        " INNER JOIN `category` ON teachers.category_id = category.id_category " +
        " INNER JOIN `gender` ON teachers.gender_id = gender.id_gender " +
        " INNER JOIN `schools` ON teachers.school_id = schools.id_school" +
        " INNER JOIN `area` ON schools.area_id = area.id_area" +
        " INNER JOIN `training_kpk` ON teachers.id_teacher = training_kpk.teacher_id" +
        " WHERE teachers.school_id = ?",
      [school_id]
    );

    dbh.end();
    return result;
  } catch (e) {
    console.log(e);
  }
};

/** END BLOCK ----------------------------------------  */

/** GET  DISCIPLINE LIST BY TEACHER ID  */

exports.disciplineListByTeacherId = async function (req, res) {
  try {
    const dbh = await mysql.createConnection(dbl());

    const teacher_id = await req.teacher_id;
    //    console.log(teacher_id)

    // const [res, fields] = await dbh.execute("SELECT  * FROM `discipline_middleware` as dm INNER JOIN `area` ON schools.area_id = area.id_area WHERE id_school = ?",[teacher_id])
    const [
      res,
      fields,
    ] = await dbh.execute(
      "SELECT  discipline_middleware.discipline_id, discipline_title.title_discipline FROM `discipline_middleware` INNER JOIN discipline_title ON discipline_middleware.discipline_id = discipline_title.id_discipline WHERE discipline_middleware.teacher_id = ?",
      [teacher_id]
    );

    console.log("модель");
    console.log(res);

    dbh.end();
    return res;
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK ----------------------------------------  */

/** GET  MAIN INFO BY METHODIST ID  */

exports.mainInfoByMethodistId = async function (req, res) {
  try {
    const dbh = await mysql.createConnection(dbl());

    const id_methodist = await req.id_methodist;
    //    console.log(teacher_id)

    // const [res, fields] = await dbh.execute("SELECT  * FROM `discipline_middleware` as dm INNER JOIN `area` ON schools.area_id = area.id_area WHERE id_school = ?",[teacher_id])
    const [res, fields] = await dbh.execute(
      `SELECT m.id_user, m.firstname, m.surname, m.patronymic, md.title_position, m.position_id, m.area_id, m.department FROM methodists as m
       INNER JOIN methodist_position as md ON m.position_id = md.id_position  WHERE m.id_user = ?`,
      [id_methodist]
    );

    dbh.end();
    return res;
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK ----------------------------------------  */

/** GET  DISCIPLINE LIST BY TEACHER ID 2   */

exports.disciplineListByTeacherId2 = async function (req, res) {
  try {
    const dbh = await mysql.createConnection(dbl());

    const teacher_id = await req.teacher_id;

    //const [res, fields] = await dbh.execute("SELECT * FROM `discipline_middleware` WHERE teacher_id = ?",[teacher_id])
    // const [res, fields] = await dbh.execute("SELECT  * FROM `discipline_middleware` as dm INNER JOIN `area` ON schools.area_id = area.id_area WHERE id_school = ?",[teacher_id])
    const [
      res,
      fields,
    ] = await dbh.execute(
      "SELECT  discipline_middleware.discipline_id as id_discipline, discipline_title.title_discipline FROM `discipline_middleware` INNER JOIN discipline_title ON discipline_middleware.discipline_id = discipline_title.id_discipline WHERE discipline_middleware.teacher_id = ?",
      [teacher_id]
    );

    dbh.end();
    return res;
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK ----------------------------------------  */

/**
 * ######################  INSERT ROWS IN SQL #################################
 * ############################################################################
 */

/** CREATE A NEW TEACHER IN THIS SCHOOL  */

exports.addNewTeacher = async (req, res) => {
  try {
    const dbh = await mysql.createConnection(dbl());
    console.log("данные получаемы при добавлении");
    console.log(req);

    console.log("SchoolTeacher");
    /** sql for teachers table */
    const id_teacher = await req.id_teacher;
    const surname = await req.surname;
    const firstname = await req.firstname;
    const patronymic = await req.patronymic;
    const birthday = await req.birthday;
    const snils = await req.snils;
    const gender_id = await req.gender_id;
    const specialty = await req.specialty;
    const level_of_education_id = await req.level_of_education_id;
    const diploma = await req.diploma;
    const position = await req.position;
    const total_experience = (await req.total_experience) || 1;
    const teaching_experience = (await req.teaching_experience) || 1;
    const category = await req.category;
    const phone = await req.phone;
    const email = await req.email;
    /** sql for discipline table */
    const disciplines_id = await req.disciplines;
    /** sql for training_kpk table */
    const place_kpk = await req.place_kpk;
    const year_kpk = await req.year_kpk;
    /** sql for table_members table */
    const school_id = await req.school_id;
    const project_id = await req.project_id;

    let name_table_project = null;

    const [projectе, fields1] = await dbh.execute(
      "SELECT * FROM project_middleware_names"
    );

    const project_array = [];

    for (let d = 0; d < projectе.length; d++) {
      project_array.push(projectе[d].tbl_name);
    }

    //ADD IN PROJECT
    for (let num = 1; num < project_array.length; num++) {
      if (project_id == num + 1) {
        name_table_project = project_array[num];
      }
    }
    for (let op = 0; op < project_array.length; op++) {
      if (project_id == op + 1) {
        let [result1, fields1] = await dbh.execute(
          "INSERT INTO `" +
            project_array[op] +
            "` (teacher_id, in_project_status, project_id) VALUES (?,?,?)",
          [id_teacher, 2, op + 1]
        );
      } else {
        let [result2, fields2] = await dbh.execute(
          "INSERT INTO `" +
            project_array[op] +
            "` (teacher_id, in_project_status, project_id) VALUES (?,?,?)",
          [id_teacher, 1, op + 1]
        );
      }
    }

    const [
      result3,
      fields3,
    ] = await dbh.execute(
      "INSERT INTO teachers (id_teacher, surname, firstname, patronymic, birthday, snils, gender_id, specialty, level_of_education_id, diploma, position, total_experience, teaching_experience, category_id, phone,	email, school_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        id_teacher,
        surname,
        firstname,
        patronymic,
        birthday,
        snils,
        gender_id,
        specialty,
        level_of_education_id,
        diploma,
        position,
        total_experience,
        teaching_experience,
        category,
        phone,
        email,
        school_id,
      ]
    );

    // if (typeof disciplines_id !== "undefined") {
    //   console.log("длина массива с дисциплинами");
    //   console.log(disciplines_id.length);

    //   for (let i = 0; i < disciplines_id.length; i++) {
    //     console.log(i);
    //     const [
    //       result4,
    //       fields4,
    //     ] = await dbh.execute(
    //       "INSERT INTO discipline_middleware ( teacher_id, discipline_id) VALUES (?,?)",
    //       [id_teacher, disciplines_id[i]]
    //     );
    //   }
    // }

    if (typeof disciplines_id !== "undefined") {
      if (typeof disciplines_id == "object") {
        for (let i = 0; i < disciplines_id.length; i++) {
          const [
            result4,
            fields4,
          ] = await dbh.execute(
            "INSERT INTO discipline_middleware ( teacher_id, discipline_id) VALUES (?,?)",
            [id_teacher, disciplines_id[i]]
          );
        }
      } else {
        const [
          result6,
          fields6,
        ] = await dbh.execute(
          "INSERT INTO discipline_middleware ( teacher_id, discipline_id) VALUES (?,?)",
          [id_teacher, disciplines_id]
        );
      }
    }
    const [
      result5,
      fields5,
    ] = await dbh.execute(
      "INSERT INTO training_kpk (year_training, place_training, teacher_id) VALUES (?,?,?)",
      [year_kpk, place_kpk, id_teacher]
    );

    const [
      result6,
      fields6,
    ] = await dbh.execute(
      "select * from discipline_middleware where teacher_id = ?",
      [id_teacher]
    );

    console.log("-- -- - --- -- - --------- -- ----------");
    console.log("результат добавления");
    console.log(result6);

    dbh.end();
    return result3.insertId;
  } catch (e) {
    console.log(e);
  }
};

/** END BLOCK ----------------------------------------  */

/**
 * ######################  UPDATE ROWS IN SQL #################################
 * ############################################################################
 */

/** UPDATE  MAIN INFORMATION TEACHERS'S  BY TEACHER ID*/

exports.updateTeacherMainInformationById = async (req, res) => {
  try {
    const dbh = await mysql.createConnection(dbl());
    console.log("update");
    console.log(req);
    console.log("update end");

    const id_teacher = await req.id_teacher;
    const surname = await req.surname;
    const firstname = await req.firstname;
    const patronymic = await req.patronymic;
    const birthday = await req.birthday;
    const snils = await req.snils;
    const gender_id = await req.gender_id;
    const specialty = await req.specialty;
    const level_of_education_id = await req.level_of_education_id;
    const diploma = await req.diploma;
    const position = await req.position;
    /** sql for discipline table */
    const disciplines_id = await req["disciplines[]"];
    /** sql for training_kpk table */
    const place_kpk = await req.place_kpk;
    const year_kpk = (await req.year_kpk) || "не проходил(а)";
    /** sql for table_members table */
    const total_experience = (await req.total_experience) || 0;
    const teaching_experience = (await req.teaching_experience) || 0;
    const category = await req.category;
    const phone = await req.phone;
    const email = await req.email;

    const [
      result,
      fields,
    ] = await dbh.execute(
      "UPDATE `teachers` SET surname = ?, firstname = ?, patronymic = ?," +
        "birthday = ?,snils = ?, gender_id = ?, specialty = ?, level_of_education_id = ?," +
        "diploma= ?, position = ?, total_experience = ?,teaching_experience = ?, category_id = ?," +
        "phone = ?, email = ?  WHERE  id_teacher = ?  ",
      [
        surname,
        firstname,
        patronymic,
        birthday,
        snils,
        gender_id,
        specialty,
        level_of_education_id,
        diploma,
        position,
        total_experience,
        teaching_experience,
        category,
        phone,
        email,
        id_teacher,
      ]
    );

    const [
      resultk,
      fieldsk,
    ] = await dbh.execute("SELECT * FROM training_kpk WHERE teacher_id = ?", [
      id_teacher,
    ]);

    if (!resultk.length) {
      const [
        result5,
        fields5,
      ] = await dbh.execute(
        "INSERT INTO training_kpk (year_training, place_training, teacher_id) VALUES (?,?,?)",
        [year_kpk, place_kpk, id_teacher]
      );
    } else {
      const [
        result3,
        fields3,
      ] = await dbh.execute(
        "UPDATE `training_kpk` SET year_training = ?, place_training = ? WHERE teacher_id = ?",
        [year_kpk, place_kpk, id_teacher]
      );
    }

    if (typeof disciplines_id == "undefined") {
      const de =
        "DELETE FROM `discipline_middleware` WHERE teacher_id = " +
        `${id_teacher}`;
      const [
        result4,
        fields4,
      ] = await dbh.execute(
        "DELETE FROM `discipline_middleware` WHERE teacher_id = ?",
        [id_teacher]
      );
    } else {
      if (typeof disciplines_id == "string") {
        const [
          result5,
          fields5,
        ] = await dbh.execute(
          "DELETE FROM `discipline_middleware` WHERE teacher_id = ?",
          [id_teacher]
        );
        const [
          result6,
          fields6,
        ] = await dbh.execute(
          "INSERT INTO discipline_middleware ( teacher_id,	discipline_id) VALUES (?,?)",
          [id_teacher, disciplines_id]
        );
      } else if (typeof disciplines_id == "object") {
        const [
          result7,
          fields7,
        ] = await dbh.execute(
          "DELETE FROM `discipline_middleware` WHERE teacher_id = ?",
          [id_teacher]
        );
        for (let i = 0; i < disciplines_id.length; i++) {
          const [
            result8,
            fields8,
          ] = await dbh.execute(
            "INSERT INTO discipline_middleware ( teacher_id,	discipline_id) VALUES (?,?)",
            [id_teacher, disciplines_id[i]]
          );
        }
      }
    }

    dbh.end();
    return result;
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK ----------------------------------------  */

/** UPDATE  AVATAR TEACHERS'S  BY TEACHER ID*/

exports.updateTeacherAvatar = async (req, res) => {
  try {
    const dbh = await mysql.createConnection(dbl());

    const id_teacher = await req.teacher_id;
    const avatar = await req.name;

    const [
      result,
      fields,
    ] = await dbh.execute(
      "UPDATE `teachers` SET avatar = ?  WHERE  id_teacher = ?  ",
      [avatar, id_teacher]
    );

    dbh.end();
    return result;
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK ----------------------------------------  */

/**
 * ######################  DELETE ROWS IN SQL #################################
 * ############################################################################
 */

/** UPDATE  MAIN INFORMATION TEACHERS'S  BY TEACHER ID*/

exports.deleteTeacherProfileById = async (req, res) => {
  try {
    const dbh = await mysql.createConnection(dbl());

    const teacher_id = await req.teacher_id;
    const school_id = await req.school_id;

    const [projectе, fields1] = await dbh.execute(
      "SELECT * FROM project_middleware_names"
    );

    const name_table_project = [];

    for (let d = 0; d < projectе.length; d++) {
      name_table_project.push(projectе[d].tbl_name);
    }

    if (!teacher_id || !school_id) {
      throw new Error(
        "Неверне параментры! Какой то из параментров отсутствует!"
      );
    } else {
      const [
        result,
        fields,
      ] = await dbh.execute("DELETE FROM `teachers` WHERE id_teacher = ?", [
        teacher_id,
      ]);

      const [
        result2,
        fields2,
      ] = await dbh.execute("DELETE FROM `training_kpk` WHERE teacher_id = ?", [
        teacher_id,
      ]);

      const [
        result4,
        fields4,
      ] = await dbh.execute(
        "DELETE FROM `discipline_middleware` WHERE teacher_id = ?",
        [teacher_id]
      );

      for (let op = 0; op < name_table_project.length; op++) {
        console.log(name_table_project[op]);
        let [result5, fields5] = await dbh.execute(
          "DELETE FROM `" + name_table_project[op] + "` WHERE teacher_id = ? ",
          [teacher_id]
        );
      }

      dbh.end();
      return result;
    }
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK ----------------------------------------  */

/** Получить всех учителей по id школе */

/** Получить всех учителей по ID школы и по ID тем предметам, которые доступны для  методиста */

exports.getAllTeachersFromThisSchoolFromCurrentProjectAndByMethodistId = async (
  req,
  res
) => {
  try {
    console.log(
      "Получить всех учителей по ID школы и по ID тем предметам, которые доступны для  методиста"
    );
    const dbh = await mysql.createConnection(dbl());
    const school_id = await req.school_id;
    const discipline_list = await req.discipline_list;

    console.log(discipline_list);
    const project_id = await req.id_project;

    let name_table_project = null;

    const [projectе, fields1] = await dbh.execute(
      "SELECT * FROM project_middleware_names"
    );

    const project_array = [];

    for (let d = 0; d < projectе.length; d++) {
      project_array.push(projectе[d].tbl_name);
    }

    for (let num = 1; num < project_array.length; num++) {
      if (project_id == num + 1) {
        name_table_project = project_array[num];
      }
    }

    const disciplineIds = discipline_list.map((row) => row.discipline_id);

    console.log("disciplineIds list in model ", disciplineIds);

    // Генерация плейсхолдеров для IN
    const placeholders = disciplineIds.map(() => "?").join(",");

    console.log("placeholders", placeholders);
    console.log("name_table_project", name_table_project);
    console.log("discipline_middleware");

    const query = `SELECT DISTINCT 
      teachers.id_teacher, 
      teachers.firstname, 
      teachers.surname, 
      teachers.patronymic, 
      teachers.phone, 
      teachers.email, 
      teachers.school_id, 
      position.title_position  
    FROM ${name_table_project} AS mpt 
    INNER JOIN 
        teachers ON mpt.teacher_id = teachers.id_teacher  
    INNER JOIN 
        position ON teachers.position = position.id_position 
        INNER JOIN
        discipline_middleware ON discipline_middleware.teacher_id = teachers.id_teacher
    WHERE
        teachers.school_id = ? 
        AND mpt.in_project_status = ? 
        AND discipline_middleware.discipline_id IN (${placeholders})`;

    console.log(query);

    // Выполняем запрос
    const [result, fields] = await dbh.execute(query, [
      school_id,
      2,
      ...disciplineIds,
    ]);

    dbh.end();
    return result;
  } catch (e) {
    console.log(e);
  }
};

// помоги написать запрос для mysql бд

// есть три таблицы:

// 1- таблица methodist_discipline_middleware в которой харнятся предметы для методиста (связь один ко многим то есть  methodist_id   -один, discipline_id - многие)

//  со следующей структурой:
//  methodist_id
//  disciline_id

// 2- таблица discipline_middleware - тут хранятся предметы для учителей (связь один ко многим то есть teacher_id -один, discipline_id - многие)
// стурктура:
// teacher_id
// discipline_id

// 3 - таблица  teachers  в которой хранятся все учителя

// Теперь необходимо получить
