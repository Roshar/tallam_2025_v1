const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const dbl = require("../../middleware/dbdata");

/**
 * ######################  SELECT ROWS IN SQL #################################
 * ############################################################################
 */

/**
 * METHODIST Получить общую информацию о методисте
 */

exports.getInformationMethodistById = async function (req) {
  try {
    const id = req.id;
    const dbh = await mysql.createConnection(dbl());

    const [res, fields] = await dbh.execute(
      `SELECT m.id_user, m.email, m.password_val, m.firstname, m.surname, m.patronymic, m.phone,
       m.position_id, DATE_FORMAT(m.birthday, '%d.%m.%Y') AS birthday_formated, m.status, m.department, mp.title_position FROM methodists as m
       INNER JOIN methodist_position as mp ON m.position_id = mp.id_position WHERE m.id_user = ?`,
      [id]
    );

    dbh.end();
    return res;
  } catch (e) {
    console.log(e.message);
  }
};

/**
 * METHODIST END
 */

/**
 * METHODIST Получить общую информацию о методисте
 */

exports.getDisciplineListByMethodistId = async function (req) {
  try {
    const id = req.id;
    const dbh = await mysql.createConnection(dbl());

    const [res, fields] = await dbh.execute(
      `SELECT mdm.id_discipline, dt.title_discipline FROM methodist_discipline_middleware as mdm 
      INNER JOIN discipline_title as dt
        ON mdm.discipline_id = dt.id_discipline WHERE mdm.methodist_id = ?`,
      [id]
    );

    dbh.end();
    return res;
  } catch (e) {
    console.log(e.message);
  }
};

/**
 * METHODIST END
 */

/**
 * METHODIST Получить количество оценок по каждому методисту
 */

exports.getMethodistListByAreaId = async function (row) {
  try {
    const area_id = row;
    console.log(area_id);

    const dbh = await mysql.createConnection(dbl());

    //   const [res, fields] = await dbh.execute(
    //     `SELECT
    //     m.firstname,
    //     m.surname,
    //     m.patronymic,
    //     mp.title_position,

    //     COUNT(ms.id) AS record_count,
    //     dt.title_discipline
    // FROM methodist_static AS ms
    // INNER JOIN methodists AS m ON ms.methodist_id = m.id_user
    // INNER JOIN methodist_position AS mp ON m.position_id = mp.id_position
    // INNER JOIN discipline_title AS dt ON ms.discipline_id = dt.id_discipline
    // WHERE ms.area_id = ?
    // GROUP BY m.firstname, m.surname, m.patronymic, mp.title_position, dt.title_discipline`,
    //     [area_id]
    //   );

    const [res, fields] = await dbh.execute(
      `SELECT 
    m.id_user,
    m.firstname, 
    m.surname, 
    m.patronymic,
    mp.title_position,
    COUNT(ms.id) AS record_count,
    dt.title_discipline,
    
    (SELECT COUNT(DISTINCT s.id_school)
     FROM schools AS s
     WHERE s.area_id = ms.area_id) AS school_count,

    (SELECT COUNT(DISTINCT t.id_teacher)
     FROM teachers AS t
     INNER JOIN schools AS s ON t.school_id = s.id_school
     INNER JOIN discipline_middleware AS dm ON dm.teacher_id = t.id_teacher
     WHERE s.area_id = ms.area_id AND dm.discipline_id = ms.discipline_id
    ) AS teacher_count

FROM methodist_static AS ms
INNER JOIN methodists AS m ON ms.methodist_id = m.id_user
INNER JOIN methodist_position AS mp ON m.position_id = mp.id_position
INNER JOIN discipline_title AS dt ON ms.discipline_id = dt.id_discipline
WHERE ms.area_id = ?
GROUP BY m.id_user, m.firstname, m.surname, m.patronymic, mp.title_position, dt.title_discipline, ms.area_id,ms.discipline_id ;
`,
      [area_id]
    );

    console.log(res);

    dbh.end();
    return res;
  } catch (e) {
    console.log(e.message);
  }
};

/**
 * METHODIST END
 */
