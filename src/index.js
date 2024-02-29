const express = require('express')
const route = require('./routes')
const cors = require('cors');
const db = require('./config/db');
const bodyParser = require('body-parser');
const checkToken = require('./app/middleware/auth');

db.connect()
const app = express()
const port = 8000

app.use(cors())

// áp dụng auth lên tất cả các path
// app.use(checkToken)

app.use(bodyParser.json());

app.use(express.urlencoded({
    extended: true
}))

app.use(express.json())

route(app)

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})