var socket = io()

document.getElementById("registerForm").addEventListener("submit", (e) => {
    e.preventDefault()
    if(document.getElementById("registerEmail").value && document.getElementById("registerPassword1").value && document.getElementById("registerPassword2").value){
        if(document.getElementById("registerPassword1").value == document.getElementById("registerPassword2").value){
            socket.emit("register", document.getElementById("registerEmail").value, document.getElementById("registerPassword1").value)
        } else{
            alert("password do not match")
        }
    }
})
socket.on("usernameExists", () => {
    document.getElementById("status").innerHTML = "This username already exists"
    document.getElementById("status").style.display = "block"
})