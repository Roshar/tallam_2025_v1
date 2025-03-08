const { Router } = require("express");
const router = Router();

router.get("/", (req, res) => {
  // Просто возвращаем успешный ответ, чтобы продлить сессию
  res.status(200).send("Session extended");
  console.log("extend");
});

module.exports = router;
