require('dotenv').config()

const App = require('./app')

const app = new App()

app.configure()
app.start()
