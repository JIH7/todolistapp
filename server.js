const { request, response } = require('express')
const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
const PORT = 2121
require('dotenv').config()

let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'ToDoList'

MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true})
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
})

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.get('/', async (req, res)=>{
    const todoItems = await db.collection('ToDoList').find().toArray()
    const itemsLeft = await db.collection('ToDoList').countDocuments({completed: false})
    res.render('index', {items: todoItems, left: itemsLeft})
})

app.post('/addTodo', (req, res) => {
    db.collection('ToDoList').insertOne({thing: req.body.todoItem, completed: false})
    .then(result => {
        console.log('Todo added')
        res.redirect('/')
    })
    .catch(error => console.log(error))
})

app.put('/markComplete', (req, res) => {
    db.collection('ToDoList').updateOne({thing: req.body.itemFromJS},{
        $set: {
            completed: true
        }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked Complete')
        res.json('Marked Complete')
    })
    .catch(error => console.error(error))
})

app.put('/markUnComplete', (req, res) => {
    db.collection('ToDoList').updateOne({thing: req.body.itemFromJS},{
        $set: {
            completed: false
        }
    },{
        sort: {_id: -1},
        upsert: false
    })
    .then(result => {
        console.log('Marked UnComplete')
        res.json('Marked UnComplete')
    })
    .catch(error => console.error(error))
})

app.delete('/deleteItem', (req, res) => {
    db.collection('ToDoList').deleteOne({thing: req.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        res.json('Todo Deleted')
    })
    .catch(error => console.log(error))
})

app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})