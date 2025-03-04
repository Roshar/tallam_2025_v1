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
 * METHODIST Получить общую информацию о методисте
 */

exports.getMethodistListByAreaId = async function (row) {
  try {
    const area_id = row;
    console.log(area_id);

    const dbh = await mysql.createConnection(dbl());

    const [res, fields] = await dbh.execute(
      `SELECT 
    m.id_user,
    m.firstname,
    m.surname,
    m.patronymic,
    m.position_id,
    mp.title_position
FROM methodists AS m
LEFT JOIN methodist_position AS mp ON m.position_id = mp.id_position WHERE m.area_id = ?`,
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

/**
 * METHODIST Получить количество оценок по каждому методисту
 */

exports.getMethodistListByAreaId = async function (row) {
  try {
    const area_id = row;
    console.log(area_id);

    const dbh = await mysql.createConnection(dbl());

    const [res, fields] = await dbh.execute(
      `SELECT 
      methodist_id,
      COUNT(*) AS record_count
  FROM card_from_project_teacher_mark3
  GROUP BY methodist_id WHERE methodist_id = ?`,
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

/**  Добавляем информацию после добавления оценки для статистики
 * createNewMarkInCardAll
 * createNewMarkInCardMethod
 */

exports.createStaticInfo = async (req, res) => {
  try {
    const dbh = await mysql.createConnection(dbl());

    let result, fields;

    [
      result,
      fields,
    ] = await dbh.execute(
      `INSERT INTO methodist_static VALUES (?,?,?,?,?,?,?)`,
      [
        methodist_id,
        teacher_id,
        card_type,
        discipline_id,
        card_id,
        area_id,
        created_date,
      ]
    );

    dbh.end();
    return result.insertId;
  } catch (e) {
    console.log(e.message);
  }
};

/** END BLOCK ----------------------------------------  */
