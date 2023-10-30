class Model {
    constructor(){
        this.todos = [
            {id:1, text:'Read a marathon', complete:false},
            {id:2, text:'Plant a garden', complete:false},
        ]

        this.todos = JSON.parse(localStorage.getItem('todos')) || [];

    }

    #commit(todos){
        this.onTodoListChanged(todos);

        localStorage.setItem('todos', JSON.stringify(todos));
    }

    bindTodoListChanged(callback){
        this.onTodoListChanged = callback;
    }

    addTodo (todoText){
        const todo = {
            id : this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
            text: todoText,
            complete: false,
        }
        this.todos.push(todo);
        this.#commit(this.todos);
        console.log(this.todos);
    }

    editTodo(id,updatedText){
      this.todos = this.todos.map((todo)=>{
           return todo.id === id ? {id:todo.id, text:updatedText, complete:todo.complete}:todo;
        })

        this.#commit(this.todos);
    }
    deleteTodo(id){
        this.todos = this.todos.filter((todo)=>{
            return todo.id !== id;
        })

        this.#commit(this.todos);
    }
    toggleTodo(id){
        this.todos = this.todos.map((todo)=>{
            return todo.id === id ? {id:todo.id,text:todo.text, complete: !todo.complete}:todo;
        })

        this.#commit(this.todos);
    }
}


class View {
    constructor(){
        //the root element
        this.app = this.getElement('#root');

        //the Title of the app
        this.title = this.createElement('h1');
        this.title.textContent = 'Todos';

        //the form with a [type='text'], input and submit button.
        this.form = this.createElement('form');

        this.input = this.createElement('input');
        this.input.type = 'text';
        this.input.placeholder = 'Add todo';
        this.input.name = 'todo';

        this.submitButton = this.createElement('button');
        this.submitButton.textContent = 'Submit';

        //the visual representation of the todo list.
        this.todoList = this.createElement("ul", 'todo-list');

        //append the input and the submit button to the form
        this.form.append(this.input, this.submitButton);

        //append the title, form and the todo list to the app.
        this.app.append(this.title, this.form, this.todoList);

        //for the editing mode
        this._temporaryTodoText;
        this._initLocalListeners();
    }

    //update temporary state
    _initLocalListeners(){
        this.todoList.addEventListener("input", event => {
            if(event.target.className === 'editable'){
                this._temporaryTodoText = event.target.innerText;
            }
        })
    }

    //Send the completed value to the model
    bindEditTodo(handler){
        this.todoList.addEventListener('focusout', event => {
            if (this._temporaryTodoText) {
                const id = parseInt(event.target.parentElement.id);

                handler(id, this._temporaryTodoText);

                this._temporaryTodoText = '';
            }
        })
    }

    get #todoText(){
        return this.input.value
    }

    #resetInput(){
        this.input.value = '';
    }

    //Create an element with an optional class
    createElement(tag,className){
        const element = document.createElement(tag);
        if (className) {
            element.classList.add(className);
        }
        return element;
    }

    //Retrieve an element from the DOM
    getElement(selector){
        const element = document.querySelector(selector);

        return element;
    }

    bindAddTodo(handler){
      this.form.addEventListener('submit',(event)=>{
        event.preventDefault();

        if(this.#todoText){
            handler(this.#todoText);
            this.#resetInput();
        }
      });  
    }

    bindDeleteTodo(handler){
       this.todoList.addEventListener('click', event =>{
        if (event.target.className === 'delete') {
            const id = parseInt(event.target.parentElement.id);

            handler(id);
        }
       }) 
    }

    bindToggleTodo(handler){
        this.todoList.addEventListener('click', event => {
            if(event.target.type === 'checkbox'){
                const id = parseInt(event.target.parentElement.id);

                handler(id);

            }
        })
    }

    //the displayTodos function will create the ul and li that the todo consists of and display them.
    displayTodos(todos){

        //Delete all nodes
        while(this.todoList.firstChild){

            this.todoList.removeChild(this.todoList.firstChild);
        }

        //Show default Message
        if(todos.length === 0){
            const p = this.createElement('p');
            p.textContent = "Nothing to do! Add a task?";
            this.todoList.append(p);
        } else{

            //Create todo item nodes for each todo in state

            todos.forEach(todo => {
                //create a list element
                const li = this.createElement("li");
                li.id = todo.id;

                //Each todo item will have a checkbox you can toggle
                const checkbox = this.createElement("input");
                checkbox.type = 'checkbox';
                checkbox.checked = todo.complete;

                //The todo item will be in a content-editable span
                const span = this.createElement('span');
                span.contentEditable = true;
                span.classList.add("editable");

                //if the todo is complete it will have a strikethrough
                if(todo.complete){
                    const strike = this.createElement("s");
                    strike.textContent = todo.text;
                    span.append(strike);
                }else{
                    span.textContent = todo.text;
                }

                //the todos will have a delete button
                const deleteButton = this.createElement("button", "delete");
                deleteButton.textContent = 'Delete';

                //append all the elements created to the li element
                li.append(checkbox, span, deleteButton);

                //append nodes the todo list

                this.todoList.append(li);

            });
        }
    }

}

class Controller{

    constructor(model, view){
        this.model = model;
        this.view = view;

        //Display initial todos
        this.onTodoListChanged(this.model.todos);

        this.view.bindAddTodo(this.handleAddTodo);
        this.view.bindDeleteTodo(this.handleDeleteTodo);
        this.view.bindToggleTodo(this.handleToggleTodo);
        this.view.bindEditTodo(this.handleEditTodo);

        this.model.bindTodoListChanged(this.onTodoListChanged);
        
    }

    onTodoListChanged = (todos)=>{
        this.view.displayTodos(todos);
    }

    handleAddTodo = (todoText) => {
        this.model.addTodo(todoText);
    }

    handleEditTodo = (id,todoText) => {
        this.model.editTodo(id, todoText);
    }

    handleDeleteTodo = (id) => {
        this.model.deleteTodo(id);
    }

    handleToggleTodo = (id) => {
        this.model.toggleTodo(id);
    }
    
    

}

const app = new Controller(new Model(), new View());

