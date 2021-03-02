(function () {
    arrowUpdate()
    plussButtonUpdate()
    updateBorders()
    var addQuestionButton = document.getElementsByClassName("newQuestionButton")[0]
    addQuestionButton.onclick = function () {
        var htmlstring = `
        <li class='newQuestionLI'>
        <form>
            <input class="questionInput" placeholder="Question" type="text">
            <p class="white downArrow">&#8595;</p>
        </form>
        <form class="answersForm" hidden>
            <input type="button" value="+" class="addAnswerButton">
            <input type="button" value="+" class="addAnswerButton"> 
            <input type="button" value="+" class="addAnswerButton">
            <input type="button" value="+" class="addAnswerButton">
        </form>
        </li>
        `
        var fianlElem = document.getElementById("finalElem")
        fianlElem.remove()
        $("#questionsUL").append(htmlstring)
        document.getElementById("questionsUL").appendChild(fianlElem)
        arrowUpdate()
        plussButtonUpdate()
        updateBorders()
    }
})()
function arrowUpdate(){
    var arrows = document.getElementsByClassName("downArrow")
    for (var i = 0; i < arrows.length; i++) {
        arrows[i].onclick = function () {
            this.parentElement.parentElement.getElementsByClassName("answersForm")[0].hidden = !this.parentElement.parentElement.getElementsByClassName("answersForm")[0].hidden
            if (this.classList.contains("over")) {
                this.classList.add("out")
                this.classList.remove("over")
                var elem = this
                window.setTimeout(function () {
                    elem.classList.remove("out")
                }, 150)
                this.parentElement.parentElement.style = "padding-bottom: 0px;"
            } else {
                this.classList.add("over")
                this.parentElement.parentElement.style = "padding-bottom: 40px;"
            }
        }
    }
}
function plussButtonUpdate(){
    var addAnswerButtons = document.getElementsByClassName("addAnswerButton")
    for (var i = 0; i < addAnswerButtons.length; i++) {
        addAnswerButtons[i].onclick = function () {
            this.value = ""
            this.type = "text"
            this.placeholder = "answer suggestion"
            this.style = "border-bottom:3px solid black;"
        }
    }
}
function updateBorders(){
    var nameInputs = document.getElementsByClassName("questionInput")
    for (var i = 0; i < nameInputs.length; i++) {
        nameInputs[i].onfocus = function () {
            var li = this
            li.style = "border-bottom:3px solid black;"
        }
        nameInputs[i].onblur = function () {
            this.style = "border-bottom:0;"
        }
    }
}
function save(){
    var liItems = document.getElementsByClassName("newQuestionLI")
    var quiz = {"name":"", "questions":[]}
    quiz.name = document.getElementById("nameInput").value
    if(!quiz.name || quiz.name == ""){
        alert("quiz is missing a name")
        return;
    }
    for(var i=0; i<liItems.length; i++){
        var question
        var answers = []
        if(liItems[i].id != "finalElem"){
            question = liItems[i].firstElementChild.firstElementChild.value
            if(!question || question == "" || question == " "){
                alert("make sure all questions have been typed out")
                return;
            }
            else{
                var answersForm = liItems[i].getElementsByClassName("answersForm")[0]
                var answersFormChildren = answersForm.children
                for(var i2=0; i2<answersFormChildren.length; i2++){
                    if(answersFormChildren[i2].type == "text" && answersFormChildren[i2].value){
                        answers.push(answersFormChildren[i2].value)
                    }
                }
            }
        }
        else{
            break;
        }
        if(answers < 1){
            alert("some questions are missing answers")
            return;
        }
        var newObject = {
            "question":question,
            "answers":answers
        }
        quiz.questions.push(newObject)
    }
    console.log(quiz)
}