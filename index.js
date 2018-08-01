var app = require('express')()
var morgan = require('morgan')

app.use(morgan('dev'))
app.get('/', (req, res) => {
  res.send('<h1>Hello world!</h1>')
})
  var server = app.listen(process.env.PORT, () => {
  console.log(`Listening on localhost:${server.address().port}`)
})