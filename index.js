const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const mysql = require("mysql");
const fileUpload = require("express-fileupload");
const MySQLStore = require("express-mysql-session")(session);
const csrf = require("csurf");
const { check, validateResult } = require("express-validator");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const flash = require("connect-flash");
const cabinetRoutes = require("./routes/school_admin/school_cabinet");
const projectsRoutes = require("./routes/school_admin/school_project");
const schoolList = require("./routes/school_admin/school_list");
const schoolCardRoutes = require("./routes/school_admin/school_card");
const support = require("./routes/school_admin/support");

dotenv.config();

const addRoutes = require("./routes/school_admin/add");
const authRoutes = require("./routes/auth");
const globalListRoutes = require("./routes/school_admin/global_list");
const globalProfileRoutes = require("./routes/school_admin/global_profile");

const libraryListRoutes = require("./routes/school_admin/library_list");
const addNewCabinetFormGeneration = require("./routes/admin/add_new_cabinet_form_gener");
const addNewCabinetFormHandler = require("./routes/admin/add_new_cabinet_form_handler");
const listCabinetRoutes = require("./routes/admin/list_cabinet");
const addNewSchoolRoutes = require("./routes/admin/add_new_school");
const listSchoolsRoutes = require("./routes/admin/main_school_list");
const school_profileRoutes = require("./routes/admin/school_profile");
const teacherEditAndDelete = require("./routes/admin/teacher");
const adminProjectsRoutes = require("./routes/admin/projects");
const adddeletemembersRoutes = require("./routes/admin/add_delete_members");
const cardsRoutes = require("./routes/admin/card");
const allMethodistRoutes = require("./routes/methodist/methodistAllRoutest");
const adminMethodistRoutes = require("./routes/admin/methodistCollection");

const varMiddle = require("./middleware/variables");
const dbopt = require("./middleware/dbdata");
// const ST = require('./models/admin/Auth')
const isAuth = require("./middleware/auth");
const isAdmin = require("./middleware/admin");
const isMethodist = require("./middleware/methodist");

const dbhoptions = require("./helpers/dbh_options");

const app = express();

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",

  helpers: {
    // get status
    setStatus: (status) => {
      if (status === "on") {
        return "off";
      } else {
        return "on";
      }
    },
    setStatusTitle: (status) => {
      if (status === "on") {
        return "Заблокировать";
      } else {
        return "Разблокировать";
      }
    },

    // add number for list
    increment: (index) => {
      return parseInt(index) + 1;
    },
    // for html selected
    selected: (value, value2) => {
      if (value == value2) {
        return " selected ";
      } else {
        return "";
      }
    },
    addClass: (value, value2) => {
      if (value == value2) {
        return "delete";
      } else {
        return "add";
      }
    },
    addLink: (value, value2) => {
      if (value == value2) {
        return "delete_from_current_project";
      } else {
        return "add_in_current_project";
      }
    },

    getMonthFromArray: (val) => {
      if (val == 1) {
        return "Января";
      } else if (val == 2) {
        return "Февраля";
      } else if (val == 3) {
        return "Марта";
      } else if (val == 4) {
        return "Апреля";
      } else if (val == 5) {
        return "Мая";
      } else if (val == 6) {
        return "Июня";
      } else if (val == 7) {
        return "Июля";
      } else if (val == 8) {
        return "Августа";
      } else if (val == 9) {
        return "Сентября";
      } else if (val == 10) {
        return "Октября";
      } else if (val == 11) {
        return "Ноября";
      } else if (val == 12) {
        return "Декабря";
      }
    },
    getSource: (n) => {
      if (n == 1) {
        return "Внешняя";
      } else if (n == 2) {
        return "Внутришкольная";
      }
    },
    getCardName: (n) => {
      if (n == 1) {
        return "Карта №1 (Комплексная)";
      } else if (n == 2) {
        return "Карта №2 (Методические компетенции)";
      }
    },
    getCardLink: (n) => {
      if (n == 2) {
        return "method";
      } else {
        return "full";
      }
    },
    checkAuthorCard: (n) => n === true,
  },
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use((jsonParser = bodyParser.json()));

// const sessionStore = ST.sessionStore()

/**
 * -------------
 *
 */

const pool = mysql.createPool(dbhoptions);

// Пример запроса
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Ошибка подключения к пулу:", err);
    return;
  }

  connection.query("SELECT * FROM 	category", (error, results) => {
    connection.release(); // Освобождаем соединение обратно в пул

    if (error) {
      console.error("Ошибка запроса:", error);
      return;
    }

    console.log(results);
  });
});

const dbh = mysql.createConnection(dbhoptions);

// const pool = mysql.createPool(dbhoptions);

function keepAlive() {
  dbh.query("select 1", function (err, result) {
    console.log("setInterval");
    if (err) return console.log(err);
  });
}

setInterval(keepAlive, 4000);

const options = {
  // checkExpirationInterval: 1000 * 60 * 15,
  // expiration: 86400000,
  clearExpired: true,
  createDatabaseTable: true,
};

const sessionStore = new MySQLStore(options, pool);

/**
 * -------------
 *
 */

// app.use(
//   session({
//     key: "ninja1",
//     secret: "secret",
//     store: sessionStore,
//     resave: false,
//     saveUninitialized: false,
//   })
// );

app.use(
  session({
    key: "ninja1",
    secret: "secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

// const session = require("express-session");
// const csrf = require("csurf");

// app.use(
//   session({
//     secret: "your_secret_key",
//     resave: false,
//     saveUninitialized: true,
//     cookie: { maxAge: 60000 }, // Время жизни куки сессии в миллисекундах (например, 60 секунд)
//   })
// );

// app.use(csrf());

// app.use()

app.use(csrf());
app.use(varMiddle);
app.use(flash());

app.use(
  fileUpload({
    createParentPath: true,
  })
);

//app.use(varmiddleware)

//роутеры
app.use("/", cabinetRoutes);
app.use("/auth", authRoutes);
app.use("/school/cabinet", isAuth, cabinetRoutes);
app.use("/school/project", isAuth, projectsRoutes);
app.use("/school/list", isAuth, schoolList);
app.use("/school/card", isAuth, schoolCardRoutes);
app.use("/school/support", isAuth, support);
app.use("/school_admin/global_add", isAuth, addRoutes);
app.use("/school_admin/global_list", isAuth, globalListRoutes);
app.use("/school_admin/global_profile", isAuth, globalProfileRoutes);
app.use("/school_admin/library_list", isAuth, libraryListRoutes);

// роуты для админки
app.use("/admin/add_new_cabinet", isAdmin, addNewCabinetFormGeneration);
app.use("/admin/add_new_cabinet/handler", isAdmin, addNewCabinetFormHandler);
app.use("/admin/list_cabinet", isAdmin, listCabinetRoutes);
app.use("/admin/add_new_school", isAdmin, addNewSchoolRoutes);
app.use("/admin/school_list", isAdmin, listSchoolsRoutes);
app.use("/admin/school_profile", isAdmin, school_profileRoutes);
app.use("/admin/projects/", isAdmin, adminProjectsRoutes);
app.use("/admin/teacher/", isAdmin, teacherEditAndDelete);
app.use("/admin/library/", isAdmin, adddeletemembersRoutes);
app.use("/admin/cards/", isAdmin, cardsRoutes);
app.use("/admin/methodist/", isAdmin, adminMethodistRoutes);

//роуты для методиста

app.use("/methodist/cabinet", isMethodist, allMethodistRoutes);
app.use("/methodist/school", isMethodist, allMethodistRoutes);

////////////////////////////////////////////////////////////////////////

app.use(function (req, res, next) {
  res.status(404).render("404_error_template", {
    layout: "404",
    title: "Страница не найдена!",
  });
});

const PORT = process.env.APP_PORT || 9000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
