const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];
const todos = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "user not found" });
  }

  request.username = username

  return next();

}

app.post('/users', (request, response) => {

  const { name, username } = request.body

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "username already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)

  return response.status(201).json(user)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.body
  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "user not found" });
  }

  return response.status(200).json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  //const { username } = request.headers
  const { title, deadline, username } = request.body
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    username,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "user not found" });
  }

  user.todos.push(todo)
  todos.push(todo)

  return response.status(201).json(todo)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  //const { username } = request.headers
  const { username } = request.body

  const user = users.find(user => user.username === username);

  const id = request.params.id;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "TODO ID not found" });
  }

  const { title, deadline } = request.body
  todo.title = title;
  todo.deadline = new Date(deadline)
  return response.status(200).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  //const { username } = request.headers
  const { username } = request.body

  const user = users.find(user => user.username === username);

  const id = request.params.id;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "TODO ID not found" });
  }

  todo.done = true;

  return response.status(200).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  //const { username } = request.headers
  const { username } = request.body

  const user = users.find(user => user.username === username);

  const id = request.params.id;

  var i = user.todos.length
  let todoExists = false
  for (const todo of user.todos) {
    i--;
    if (todo.id == id) {
      todoExists = true
      user.todos.splice(i, 1);
    }
  }
  if (!todoExists)
    return response.status(404).json({ error: "TODO ID not found" })
  else
    return response.status(204).json(user.todos)
});

module.exports = app;