//config
var port = 3000
//dependencies
const app = require('express')()
const express = require('express')
const http = require('http').createServer(app).listen(port, () => {
    console.log(`server listening on port: ${port}`)
})
const fs = require('fs')
const path = require('path')
const bcrypt = require("bcrypt")
const {
    json
} = require('express')
const io = require('socket.io')(http)
var gamePins = []
var unavailiblePorts = [] //any ports that should NOT be used for setting up games. Only uses ports 3000-4000 so can only handle 1K games at a time
var approvedKeys = [] //Leave alone
var saltRounds = 10

app.use(express.static(path.join(__dirname + '/public')))

io.on('connection', socket => {
    socket.on("login", (username, password, rememberMe) => {
        var json = jsonRead("data/users.json")
        if (json) {
            var found = false
            var needConfirm = false
            json.forEach(user => {
                if (user.username == username && bcrypt.compareSync(password, user.password) && user.confirmation) {
                    socket.emit("redir", "needConfirm.html")
                    needConfirm = true
                } else if (user.username == username && bcrypt.compareSync(password, user.password)) {
                    var newObject = {
                        "username": username,
                        "key": Math.floor(Math.random() * 100000000000000000000),
                        "admin": user.admin
                    }
                    approvedKeys.push(newObject)
                    found = true
                    console.log(newObject)
                    socket.emit("passwordCorrect", newObject.username, newObject.key, rememberMe)
                }
            })
            if (!found && !needConfirm) {
                socket.emit("passwordWrong")
            }
        }
    })
    //venter på register requests og legger den nye kontoen inn i databasen hvis brukernavnet ikke allerede eksisterer
    socket.on("register", (username, nonHashPassword) => {
        hash(nonHashPassword).then(function (password) {
            if (password == false) {
                socket.emit("eror", "500 internal server error, server could not secure your password and therefore registration was cancelled. ERR:HASHERR")
                return false
            }
            var json = jsonRead("data/users.json")
            var found = false
            json.forEach(user => {
                if (user.username == username) {
                    socket.emit("usernameExists")
                    found = true
                }
            })
            if (!found) {
                var newObject = {
                    "username": username,
                    "password": password,
                    "admin": false,
                    "confirmation": {
                        "id": Math.random()
                    }
                }
                json.push(newObject)
                var status = jsonWrite("data/users.json", json)
                if (status == false) {
                    socket.emit("eror", "somthing went wrong when saving your username to the database. ERR:DATABASEFAIL");
                    return false
                } else {
                    socket.emit("userCreated")
                }
                sendMail(newObject.username, "Confirm Email", `hello ${newObject.username} you can confirm you email by pressing this link: http://31.45.72.232/confirm.html?id=${newObject.confirmation.id}`)
            }
        })
    })
    //sjekker om personer som er på innloggede sider faktisk har logget inn
    socket.on("check", (username, key, needsAdminPerms) => {
        var found = check(username, key, needsAdminPerms)
        if (!found) {
            socket.emit("notAllowed")
        } else {
            socket.emit("allowed")
        }
    })
    socket.on("pinCheck", pin => {
        var found = false
        gamePins.forEach(gamePin => {
            if (pin == gamePin.pin) {
                socket.emit("gameFound", (gamePin.port, gamePin.code))
                found = true
            }
        })
        if (!found) {
            socket.emit("wrongPin")
        }
    })
    socket.on("save", (quiz, username, key) => {
        var loggedIn = check(username, key, false)
        var notOwner = false
        if (loggedIn) {
            var quizes = jsonRead("data/quizes.json")
            if (quiz.id) {
                quizes.forEach((quizFromDatabase, i) => {
                    if (quizFromDatabase.id == quiz.id && quizFromDatabase.owner == username) {
                        quiz.owner = username
                        quizes.splice(i, 1)
                        quizes.push(quiz)
                    } else {
                        socket.emit("notOwner")
                        notOwner = true
                    }
                })
            } else {
                var genInfo = jsonRead("data/genInfo.json")
                quiz.id = genInfo.nextGameId
                quiz.owner = username
                quizes.push(quiz)
                genInfo.nextGameId++
                jsonWrite("data/genInfo.json", genInfo)
            }
            if (!notOwner) {
                jsonWrite("data/quizes.json", quizes)
            }
        } else {
            socket.emit("notAllowed")
        }
    })
});

function jsonRead(file) {
    var data = fs.readFileSync(file, "utf-8")
    return JSON.parse(data)
}

function jsonWrite(file, data) {
    fs.writeFile(file, JSON.stringify(data), err => {
        if (err) {
            console.log(err);
            return false;
        } else {
            return true
        }
    })
}
async function hash(password) {
    try {
        var hashPassword = await bcrypt.hash(password, saltRounds)
        return hashPassword.toString()
    } catch (error) {
        console.log(error)
        return "error"
    }
}

function sendMail(reciver, emailSubject, message) {
    if (emailUsername) {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: emailUsername,
                pass: emailPassword
            }
        })
        let mailOptions = {
            from: emailUsername,
            to: reciver,
            subject: emailSubject,
            text: message + " This is an automated message. Please do not respond"
        }
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                log(error)
                return console.log(error)
            }
            log(`sent mail to reciver`)
        })
    }
}

function log(msg, isErr) { //main logging function
    var date = new Date()
    var month = date.getMonth() + 1
    var firstMinutes = date.getMinutes()
    var minutes
    if (firstMinutes < 10) {
        minutes = "0" + firstMinutes
    } else {
        minutes = firstMinutes
    }
    var fullMsg = "[" + date.getDate() + "." + month + "." + date.getFullYear() + " @ " + date.getHours() + ":" + minutes + "] " + msg
    if (!msg) {
        log("tried to log with no message provided")
        return;
    }
    if (fs.existsSync("data/logs/log.log") && useLogs || fs.existsSync("data/logs/log.log") && isErr) {
        fs.appendFileSync("data/logs/log.log", fullMsg + "\r\n")
    } else if (useLogs && fs.existsSync("data/logs") || isErr && fs.existsSync("data/logs")) {
        fs.writeFileSync("data/logs/log.log", "[" + date.getDate() + "." + month + "." + date.getFullYear() + " @ " + date.getHours() + ":" + minutes + `] Log file created, to disable logging check the index.js file: config section. logging is currently: useLogs \r\n`)
        fs.appendFileSync("data/logs/log.log", fullMsg + "\r\n")
    } else if (useLogs || isErr) {
        fs.mkdirSync("data/logs")
        fs.writeFileSync("data/logs/log.log", "[" + date.getDate() + "." + month + "." + date.getFullYear() + " @ " + date.getHours() + ":" + minutes + `] Log file created, to disable logging check the index.js file: config section. logging is currently: useLogs \r\n`)
        fs.appendFileSync("data/logs/log.log", fullMsg + "\r\n")
    }
}

function generatePorts() {
    var returnPorts = []
    var nextPort = 3000;
    for (var i = 0; i < 1000; i++) {
        var newObject = {
            "port": nextPort,
            "availible": true
        }
        returnPorts.push(newObject)
        nextPort++
    }
    return returnPorts
}

function check(username, key, needsAdminPerms) {
    var found = false
    approvedKeys.forEach(approvedKey => {
        if (approvedKey.username == username && approvedKey.key == key) {
            if (needsAdminPerms && approvedKey.admin) {
                found = true
            } else if (!needsAdminPerms) {
                found = true
            }
        }
    })
    return found
}

function updateQuizes(username, key, quizId, remove) {
    if (check(username, key)) {
        var found = false
        var users = jsonRead("data/users.json")
        users.forEach((user, i) => {
            if (user.username == username) {
                user.quizes.forEach((userQuiz, i2) => {
                    if (userQuiz == quizId && remove) {
                        user.quizes.splice(i2, 1)
                        found = true
                    } else if (userQuiz == quizId && !remove) {
                        found = true
                    }
                })
                if (!remove && !found) {
                    user.quizes.push(quizId)
                }
            }
        })
    }
}
(function () {
    var statusSent = false
    console.log("\x1b[33m%s\x1b[0m", "Looking for missing files.....")
    var allFiles = [
        ["users.json", "[]"],
        ["quizes.json", "[]"],
        ["ports.json", `[${ JSON.stringify(generatePorts())}]`],
        ["genInfo.json", '{"nextGameId":0}']
    ]
    if (!fs.existsSync("data/")) {
        statusSent = true
        console.log("\x1b[33m%s\x1b[0m", "Missing Files found. Generating now.....")
        fs.mkdirSync("data/")
    }
    allFiles.forEach(file => {
        if (!fs.existsSync(`data/${file[0]}`)) {
            if (!statusSent) {
                console.log("\x1b[33m%s\x1b[0m", "Missing Files found. Generating now.....")
                statusSent = true
            }
            jsonWrite(`data/${file[0]}`, JSON.parse(file[1]))
        }
    })
    if (statusSent) {
        console.log("\x1b[32m%s\x1b[0m", "All files were created!")
    } else {
        console.log("\x1b[32m%s\x1b[0m", "No files were missing!")
    }
})()