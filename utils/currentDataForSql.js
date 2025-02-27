const { DateTime } = require("luxon");
const getMoscowDateTime = () => {
  return DateTime.now()
    .setZone("Europe/Moscow")
    .toFormat("yyyy-MM-dd HH:mm:ss");
};

module.exports = getMoscowDateTime;
