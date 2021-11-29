const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAlreadyExists = users.find((user) => user.username === username);

  if(!userAlreadyExists) {
    return response.status(404).json({ "error": "User not exists" });
  }

  request.user = userAlreadyExists;

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.find((user) => user.username === username);

  if(userAlreadyExists) {
    return response.status(400).json({ "error": "Username already exists."});
  }

  const userInserted = { 
    id: uuidv4(), name, username, todos: []
  };

  users.push(userInserted);

  return response.status(201).json(userInserted);
});

app.get('/users', (request, response) => {
  if(users.length === 0) {
    return response.status(404).json({ "error": "There are no cadastred users" });
  }

  return response.json(users);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(), title, done: false, deadline: new Date(deadline), created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { todos } = user;

  const todoAlreadyExists = todos.find((todo) => todo.id === id);

  if(!todoAlreadyExists) {
    return response.status(404).json({ "error": "Todo not exists" });
  }

  todoAlreadyExists.title = title;
  todoAlreadyExists.deadline = deadline;

  return response.json(todoAlreadyExists);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoAlreadyExists = user.todos.find((todo) => todo.id === id);

  if(!todoAlreadyExists) {
    return response.status(404).json({ "error": "Todo not exists" });
  }

  todoAlreadyExists.done = true;

  return response.json(todoAlreadyExists);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { todos } = user;

  const indexTodo = todos.findIndex((todo) => todo.id === id);

  if(indexTodo < 0) {
    return response.status(404).json({ "error": "Todo not exists" });
  }
  
  todos.splice(indexTodo, 1);

  return response.status(204).json(todos);

});

module.exports = app;