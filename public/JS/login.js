var socket = io();
(function(){
})()
document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault()
    if(document.getElementById("username").value && document.getElementById("password").value){
        socket.emit("login", document.getElementById("username").value, document.getElementById("password").value)
    }
})
socket.on("passwordCorrect", (username, key) => {
    localStorage.setItem("username", username)
    localStorage.setItem("key", key)
    window.location.href="creategame.html"
})
socket.on("passwordWrong", () => {
    document.getElementById("status").style.display = "block"
})