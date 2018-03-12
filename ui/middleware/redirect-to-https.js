module.exports = function redirectToHttps(req, res, next) {
  const forceHttps = process.env.FORCE_HTTPS === `force`;
  const noHttpsUsed = req.headers[`x-forwarded-proto`] !== `https`;

  if (forceHttps && noHttpsUsed) {
    return res.redirect(`https://${req.get(`Host`)}${req.url}`);
  }

  return next();
};
