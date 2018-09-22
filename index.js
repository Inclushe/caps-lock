var app = require('./app')
require('dotenv').config({ path: './vars.env' })
var server = app.listen(process.env.PORT, () => {
  console.log(`Listening on ${server.address().port}`)
})
