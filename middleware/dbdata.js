module.exports = function () {
  return {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    database: process.env.DATABASE,
    password: process.env.DATABASE_PASSWORD,
    // socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
    port: process.env.DB_PORT,
  };
};
