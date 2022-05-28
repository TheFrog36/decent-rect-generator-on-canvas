const BASE_URL = 'https://628b2f12667aea3a3e290de6.mockapi.io/todos'

let todosArray = [];


function goToTodoPage(id) {
  let urlString = "/todo.html"
  if(id){
    urlString = urlString + '?id=' + id;
  }
  window.location.href = urlString;
}

// function goToTodoPage2(todo){
//   let urlString = "/todo.html"
//   if (todo) {
//     const todoString = JSON.stringify(todo);
//     sessionStorage.setItem('selectedTodo', todoString);
//   }
//   window.location.href = urlString;
// }

function populateTagContainer(container, tags){
  for (const tag of tags) {
    const span = document.createElement('span');
    span.classList.add('chip');
    const node = document.createTextNode('#' + tag);
    span.appendChild(node);
    container.appendChild(span)
  }
}


function createTodoCard(todo){

  const cardTemplate = `
      <span class="todo-name">#NAME</span>
      <div class="tag-container"></div>
      <span>#CREATIONDATE</span>
      <div class="divider"></div>
      <div class="buttons-container">
        <button class="delete-button"><img width="20px" src="./assets/delete.svg" alt=""></button>
        <button class="edit-button"><img width="20px" src="./assets/edit.svg" alt=""></button>
        <button class="done-button"><img width="20px" src="./assets/check.svg" alt=""></button>
        </div>`
  
  
  //const humanDate = new Date(todo.creationDate * 1000)
  const todoHtml = cardTemplate.replace('#NAME', todo.name)
                               .replace('#CREATIONDATE', todo.creationDate.toLocaleString())

  return todoHtml;
}

function startLoading(){
  const loader = document.getElementById('loader')
  loader.style.display = 'inline-block'
  const refresh = document.getElementById('refresh-button');
  refresh.style.display = 'none';
}

function stopLoading() {
  const loader = document.getElementById('loader')
  loader.style.display = 'none'
  const refresh = document.getElementById('refresh-button');
  refresh.style.display = 'inline-block';
}

function filterTodos(t1, t2){
  return t1.id !== t2.id;
}

function removeTodoAndRefesh(todo){
  stopLoading()
  todosArray = todosArray.filter(t1 => filterTodos(t1, todo))
  displayTodos(todosArray);
}

function deleteTodo(id){
  
    startLoading()
    const deleteUrl = BASE_URL + '/' + id;
    const fetchOptions = { method: 'delete' };
    fetch(deleteUrl, fetchOptions)
      .then(response => response.json())
      .then(result => removeTodoAndRefesh(result))
      .catch(error => stopLoading())
    
}

function requestConfirmToDelete(id){
  if (confirm('sei pazzo??? potresti pentirtene in futuro...')) {
    deleteTodo(id)
  } else {
    alert('fiu... ci è mancato poco!')
  }
}

function todoDone(todo){
  todo.doneDate = new Date().getTime() / 1000;
  todo.priority = Todo.PRIORITY.done;
  const dbObj = todo.toDbObj();
  const dbObjJson = JSON.stringify(dbObj);

  const url = BASE_URL + '/' + todo.id;

  fetchOptions = {
    method: 'PUT', body: dbObjJson, headers: {
      'Content-Type': 'application/json'
    }
  };

  fetch(url, fetchOptions)
  .then(resp => resp.json())
  .then(res => displayTodos(todosArray))

}

function displayTodos(todos){

  todosArray.sort(Todo.orderTodoByPriority);  //Ordino l'arrey di todos in base alla priorità
  const todosContainer = document.getElementById('todos-container');  //prendo dall'index l'elemento con l'id todos-container

  todosContainer.innerHTML = '';  //pulisco il testo interno di todosContainer

  for (const todo of todos) {  //inizio un ciclo che si ripete per ogni elemento dell'arrayTodos

    const todoCard = document.createElement('div');  //creo un div
    todoCard.classList.add('todo-card');  //al div do la classe 'todo-card'

    todoCard.innerHTML = createTodoCard(todo);  //chiamo la funzione createTodoCard() dichiarata a riga 34 per creare l'html di un todo. L'html creato lo inserisco all'interno del testo (.innerhtml) di todocard

    const tagContainer = todoCard.querySelector('.tag-container');  //all'interno di todoCard cerco un elemento classe ='tag-container' (creato con createTodoCard())

    populateTagContainer(tagContainer, todo.tags)  //riempo il tagContainer con dei tag chiamando la funzione populateTagContainer() dichiarata a riga 23

    const deleteButton = todoCard.querySelector('.delete-button');  //Nel todoCard cerco un elemento con classe 'delete-button'
    deleteButton.onclick = () => requestConfirmToDelete(todo.id);  //Al click del bottone recuperato a riga 137, chiamo la funzione requestConfirmToDelete() dichiarata a riga 91

    const editButton = todoCard.querySelector('.edit-button');  //Nel todoCard cerco un elemento con classe 'edit-button'
    if (todo.doneDate) {
      editButton.style.display = 'none';  //Se il todo ha una data di completamento, metto la sua proprietà display = 'none' per farlo sparire
    } else {
      editButton.onclick = () => goToTodoPage(todo.id);  //Altrimenti gli passo la funzione onlick =  goToTodoPage() dichiarata a riga 6
    }
    

    const doneButton = todoCard.querySelector('.done-button');
    if (todo.doneDate) {
      doneButton.style.display = 'none';
    } else {
      doneButton.onclick = () => todoDone(todo);
    }
    
  
    const divider = todoCard.querySelector('.divider');
    divider.style.backgroundColor = todo.priority.color;

    // const span = document.createElement('span');
    // const nameNode = document.createTextNode(todo.name);
    // span.appendChild(nameNode);

    // todoCard.appendChild(span);

    // const button = document.createElement('button');
    // button.onclick = () => deleteTodo(todo.id)
    // const deleteNode = document.createTextNode('delete');
    // button.appendChild(deleteNode);

    // todoCard.appendChild(button);

    todosContainer.appendChild(todoCard);

  }
  
}

function initTodos(todos){
  stopLoading();
  todosArray = todos.map(obj => Todo.fromDbObj(obj));
  displayTodos(todosArray);
}



function loadTodos(){
  startLoading()
  fetch(BASE_URL)
  .then(response => response.json())
  .then(result => initTodos(result))
  //.catch(error => stopLoading())
}

loadTodos()