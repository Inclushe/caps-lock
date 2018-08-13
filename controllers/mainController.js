exports.homePage = (req, res) => {
  res.render('index')
}

exports.redirectIfNotLoggedIn = (req, res, next) => {
  console.log(`from redirect: ${req.session.userId}`)
  if (req.session.userId) {
    next()
  } else {
    res.redirect('/')
  }
}