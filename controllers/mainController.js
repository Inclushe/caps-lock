var isProduction = process.env.NODE_ENV === 'production'

exports.homePage = (req, res) => {
  res.render('index')
}

exports.viewPage = (req, res, next) => {
  if (!isProduction) {
    res.render(req.params.page)
  } else {
    next(404)
  }
}

exports.redirectIfNotLoggedIn = (req, res, next) => {
  console.log(`from redirect: ${req.session.userId}`)
  if (req.session.userId) {
    next()
  } else {
    res.redirect('/')
  }
}
