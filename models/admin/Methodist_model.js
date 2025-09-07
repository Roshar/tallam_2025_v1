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

    const [res, fields] = await dbh.execute(
      `SELECT
      m.id_user,
      m.firstname,
      m.surname,
      m.patronymic,
      mp.title_position,
      COUNT(DISTINCT ms.id) AS record_count,

      GROUP_CONCAT(DISTINCT dt.title_discipline SEPARATOR ', ') AS disciplines
  FROM 
      methodists AS m
  LEFT JOIN 
      methodist_static AS ms ON ms.methodist_id = m.id_user
  LEFT JOIN 
      methodist_discipline_middleware AS mdm ON mdm.methodist_id = m.id_user
  LEFT JOIN 
      discipline_title AS dt ON mdm.discipline_id = dt.id_discipline
  INNER JOIN 
      methodist_position AS mp ON m.position_id = mp.id_position
  WHERE 
      m.area_id = ?
  GROUP BY 
      m.id_user, m.firstname, m.surname, m.patronymic, mp.title_position`,
      [area_id]
    );

    const [res1, fields2] = await dbh.execute(
      `SELECT m.id_user, COUNT(s.id_school) as schools_number FROM methodists as m 
    INNER JOIN schools as s ON m.area_id = s.area_id WHERE m.area_id = ? GROUP BY m.id_user
    `,
      [area_id]
    );

    const [res3, fields3] = await dbh.execute(
      `SELECT 
      m.id_user AS user_id,
      COUNT(DISTINCT dm.teacher_id) AS teacher_count
  FROM 
      methodists AS m
  JOIN 
      methodist_discipline_middleware AS mdm 
      ON m.id_user = mdm.methodist_id
  JOIN 
      discipline_middleware AS dm 
      ON mdm.discipline_id = dm.discipline_id
  WHERE 
      m.area_id = ?
  GROUP BY 
      m.id_user`,
      [area_id]
    );

    function mergeUserData(table1, table2, table3) {
      // Преобразуем table2 и table3 в объекты для быстрого доступа по id_user/user_id
      const table2Map = Object.fromEntries(
        table2.map((row) => [row.id_user, row])
      );
      const table3Map = Object.fromEntries(
        table3.map((row) => [row.user_id, row])
      );

      // Соединяем данные из всех таблиц
      return table1.map((row, index) => {
        const userId = Object.keys(table2Map)[index]; // Получаем user_id из table2
        const schoolsData = table2Map[userId] || {};
        const teacherData = table3Map[userId] || {};

        return {
          ...row,
          id_user: userId,
          schools_number: schoolsData.schools_number || null,
          teacher_count: teacherData.teacher_count || null,
        };
      });
    }

    const mergedData = mergeUserData(res, res1, res3);
    console.log(mergedData);

    dbh.end();
    return mergedData;
  } catch (e) {
    console.log(e.message);
  }
};

/**
 * METHODIST END
 */
