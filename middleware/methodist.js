module.exports = (req, res, next) => {
  if (!req.session.isMethodist) {
    return res.redirect("/auth");
  }
  next();
};
