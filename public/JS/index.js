var socket = io()
var state = 0
var port
var nickname
var timeOutCheck
document.getElementById("idForm").addEventListener("submit", (e) => {
    e.preventDefault()
    if(state == 0){
        socket.emit("pinCheck", document.getElementById("gamePin").value)
        document.getElementById("loadBlock").style.display = "block"
        timeOutCheck = setInterval(() => {
            alert("ERROR! Request timed out. Please try again later")
            document.getElementById("loadBlock").style.display = "none"
            clearInterval(timeOutCheck)
        }, 10000)
    }
})
socket.on("gameFound", (gamePort, code) => {
    sessionStorage.setItem("gameCode", code)
    clearInterval(timeOutCheck)
    document.getElementById("loadBlock").style.display = "none"
    port = gamePort
    document.getElementById("gamePin").placeholder = "Nickname"
})
socket.on("wrongPin", () => {
    clearInterval(timeOutCheck)
    console.log(timeOutCheck)
    document.getElementById("loadBlock").style.display = "none"
    document.getElementById("wrongPinP").style.display = "block"
    document.getElementById("idForm").style.marginLeft = "-131.5px"
    document.getElementById("idForm").style.marginTop = "-81px"
}) 