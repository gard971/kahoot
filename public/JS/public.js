function check(){
    if(localStorage.getItem("username") && localStorage.getItem("key")){
        socket.emit("check", localStorage.getItem("username"), localStorage.getItem("key"))
    }
    else if(sessionStorage.getItem("username") && sessionStorage.getItem("key")){
        socket.emit("check", sessionStorage.getItem("username"), sessionStorage.getItem("key"))
    }
    else{
        window.location.href = "login.html"
    }
}
socket.on("notAllowed", () => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = "login.html"
})
function getKeys(){
    var keyReturns = []
    if(localStorage.getItem("username") && localStorage.getItem("key")){
        keyReturns = [localStorage.getItem("username"), localStorage.getItem("key")]
    }
    else if(sessionStorage.getItem("username") && sessionStorage.getItem("key")){
        keyReturns = [sessionStorage.getItem("username") && sessionStorage.getItem("key")]
    }
    
    if(keyReturns.length>0){
    return keyReturns
    }
    else{
        return false
    }
}