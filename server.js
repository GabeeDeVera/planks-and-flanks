// Declaration Statements


/// Port
const PORT = process.env.PORT || 4000;

/// Options for file reading
const OPTIONS = {
    root: __dirname
}

/// Room Code Length
const ROOM_CODE_LENGTH = 4;

// Packages and Initializers

/// File Reader
const { readFile, writeFile, readFileSync, writeFileSync, stat, unlink, write } = require("fs");

//// Making a function to check file availability
const fileExists = async (path) => {
    let result = new Promise((resolve, reject) => {
        stat(path, (err, _) => {
            if (err == null) {
                resolve(true);
            }
            else if (err.code === "ENOENT") {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });

    return result;

};

//// Getting Error Codes
const errorCodes = new Map(JSON.parse(readFileSync("data/errorCodes.json", { encoding: "utf-8" })));

/// Express
const express = require("express");
const app = express();

/// Other Functions

//// Function to get the map of the storm distance given the double turn number
function getTransitionMap(mapSize) {
    let transitionMapLength = Math.floor(mapSize / 2);
    let transitionMap = [];

    let currentSum = 0;
    for (let i = transitionMapLength; i > 0; i--) {
        transitionMap.push(currentSum);
        currentSum += 2 * i;
    }
    currentSum += 20;
    transitionMap.push(currentSum);
    currentSum += 1;
    transitionMap.push(currentSum);
    return transitionMap;
}

//// Function to read the transition map
function getStormDistance(transitionMap, currentDoubleTurn) {
    for (let i = transitionMap.length - 1; i >= 0; i--) {
        if (currentDoubleTurn >= transitionMap[i]) {
            return i;
        }
    }
    return 0;
}

//// Perlin Noise Generator

function generateGridGradient(size, vectorValues = [[-1,-1],[-1,1],[1,-1],[1,1]])
{
    let gradientGrid=[];
    for(let i = 0; i < size; i++)
    {
        gradientGrid.push([]);
        for(let j = 0; j < size; j++)
        {
            gradientGrid[i].push(vectorValues[Math.floor(Math.random()*vectorValues.length)]);
        }
    }
    return gradientGrid;
}

function dot(vec1, vec2)
{
    if(vec1.length!==vec2.length)
    {
        return 0;
    }
    else
    {
        let sum = 0;
        for(let i = 0; i < vec1.length; i++)
        {
            sum += vec1[i]*vec2[i];
        }
        return sum;
    }
}

function lerp(val1, val2, midVal)
{
    return (val2 - val1) * (3.0 - midVal * 2.0) * midVal * midVal + val1;

    //return return (val2-val1) * midVal + val1; (normal)
    //return (val2 - val1) * (3.0 - midVal * 2.0) * midVal * midVal + val1; (smooth)
}

function generateNoiseGrid(size, sizeGridGradient, sizeGridGradientScaling)
{
    let noiseGrid = [...new Array(size)].map(item => [...new Array(size)]);
    let gradientGrid = generateGridGradient(sizeGridGradient);

    for(let y = 0; y < size; y++)
    {
        for(let x = 0; x < size; x++)
        {
            let gridVectorIndices = [Math.floor(x / sizeGridGradientScaling), Math.floor(y / sizeGridGradientScaling)];
            let fracX = (x % sizeGridGradientScaling) / sizeGridGradientScaling;
            let fracY = (y % sizeGridGradientScaling) / sizeGridGradientScaling;
            let distanceVectors = [[gridVectorIndices[0] - x / sizeGridGradientScaling, gridVectorIndices[1] - y / sizeGridGradientScaling], [gridVectorIndices[0] + 1 - x / sizeGridGradientScaling, gridVectorIndices[1] - y / sizeGridGradientScaling], [gridVectorIndices[0] - x / sizeGridGradientScaling, gridVectorIndices[1] + 1 - y / sizeGridGradientScaling], [gridVectorIndices[0] + 1 - x / sizeGridGradientScaling, gridVectorIndices[1] + 1 - y / sizeGridGradientScaling]];
            let dotGradients = [...new Array(4)].map((_,index) => dot(distanceVectors[index], gradientGrid[gridVectorIndices[0] + index % 2][gridVectorIndices[1] + Math.floor(index / 2)] ));
            noiseGrid[x][y] = lerp(lerp(dotGradients[0], dotGradients[1], fracX), lerp(dotGradients[2], dotGradients[3], fracX), fracY)
        }
    }

    return noiseGrid;
}

// Setting up Routes
app.use(express.static(`${__dirname}/docs`));

app.use((req, res, next) => {
    console.log(`Requesting ${req.originalUrl}`);
    next();
})

app.get("/", (req, res) => {
    res.redirect("/home");
});

app.get("/home", (req, res) => {
    res.sendFile("docs/homePage.html", { ...OPTIONS, "content-type": "text/html" });
});

app.get("/rooms/:roomCode", (req, res) => {

    readFile(`rooms/${req.params.roomCode}.json`, (err, data) => {
        if (err) {
            res.status(403).redirect("/error/101");
        }
        else {
            res.sendFile("docs/room.html", { ...OPTIONS, "content-type": "text/html" });
        }
    })
})

app.get("/error/:errCode", (req, res) => {
    if (errorCodes.has(req.params.errCode)) {
        res.send(`
        <html>
            <head>
                <link rel="stylesheet" href="/styles/errorPage.css">
            </head>
            <body>
                <main id = "content">
                    <h1 id="errorHeader">Error Code ${req.params.errCode}</h1>
                    <p id="errorDescription">${errorCodes.get(req.params.errCode)}</p>
                </main>
            </body>
        </html>
        `);
    }
    else {
        res.send(`
        <html>
            <head>
                <link rel="stylesheet" href="/styles/errorPage.css">
            </head>
            <body>
                <main id = "content">
                    <h1 id="errorHeader">Error Code ${req.params.errCode}</h1>
                    <p id="errorDescription">An unknown error occured</p>
                </main>
            </body>
        </html>
        `);
    }
});

app.get("/styles/:fileName", (req, res) => {
    res.sendFile(`styles/${req.params.fileName}`, { ...OPTIONS, "content-type": "text/css" });
});

app.get("/scripts/:fileName", (req, res) => {
    res.sendFile(`scripts/${req.params.fileName}`, { ...OPTIONS, "content-type": "text/js" });
});

app.get("/images/:fileName", (req, res) => {
    res.sendFile(`images/${req.params.fileName}`, { ...OPTIONS, "content-type": `image/${req.params.fileName.split(".")[1]}` });
});

// Creating HTTP Server
const http = require("http");
const httpServer = http.createServer(app);
const socketIo = require("socket.io");
const io = socketIo(httpServer);

// Server Logic

/// Client - Server communication

const clientsInRoom = (code) => {
    /*NOTE: io.sockets.adapter.rooms is in the form of:
    Map {
        "roomId1" => Set {...clients}
        "roomId2" => Set {...clients}
    }
    */
    //Tests to see if a certain room is valid or not
    if (io.sockets.adapter.rooms.has(code)) {
        //If valid
        return [...io.sockets.adapter.rooms.get(code)];
    } else {
        //If invalid
        return [];
    }
};

io.on("connection", (socket) => {
    console.log(`${socket.id} is connecting`);
    socket.roomCode = null;

    //// homePage
    /*
        socket.on("setSocketId", (socketId) => {
            socket.id = socketId;
            socket.emit("socketIdUpdateSuccess");
        });
    
        socket.on("getSocketId", () => {
            socket.emit("sendSocketId", socket.id);
        });
    */
    socket.on("createRoom", async (roomName, mapSize) => {
        let roomCode;
        let roomExists;

        do {
            roomCode = [...new Array(ROOM_CODE_LENGTH)].map(item => "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_".charAt(Math.floor(Math.random() * 64))).reduce((acc, cur) => acc + cur);
            roomExists = await fileExists(`rooms/${roomCode}.json`);
        }
        while (roomExists);

        writeFile(`rooms/${roomCode}.json`, JSON.stringify({
            roomName: roomName,
            state: "Intermission",
            host: null,
            inRoom: [],
            inGame: [],
            usernames: {},
            mapSize: mapSize,
            game: {
                currentDoubleTurn: 0,
                currentPlayerIndex: 0,
                currentPlayer: null,
                status: {

                }
            }
        }), (err) => {
            if (err) {
                console.log(err);
            }
        });
        socket.emit("redirectToRoom", roomCode);
    });

    //// room

    socket.on("joinRoom", (roomCode, username) => {
        console.log(`Client ${socket.id} joined ${roomCode}`);
        socket.roomCode = roomCode;
        readFile(`rooms/${roomCode}.json`, { encoding: "utf-8" }, (err, data) => {
            if (err || ![...data].toString().trim()) {
                console.log("join error");
            }
            else {
                jsonData = JSON.parse(data);
                console.log(jsonData);

                // Checking for duplicate client instances
                if (socket.id in jsonData.inRoom) {
                    socket.emit("rejectJoinRoom", 102);
                }
                else {
                    jsonData.inRoom.push(socket.id);
                    jsonData.usernames[socket.id] = username;
                    socket.join(roomCode);

                    socket.emit("acceptJoinRoom", jsonData, socket.id);

                    // User is the first one in the room; make him/her the host
                    if (jsonData.inRoom.length == 1) {
                        jsonData.host = socket.id;
                    }
                }

                // Updating json data
                writeFile(`rooms/${roomCode}.json`, JSON.stringify(jsonData), (err) => {
                    if (err) {
                        console.log(err);
                    }
                });

                // Updating room with new data
                io.sockets.to(roomCode).emit("updateRoom", jsonData);
            }
        });
    });

    socket.on("requestStartGame", (roomCode, reqSocketId) => {
        readFile(`rooms/${roomCode}.json`, (err, data) => {
            if (err || ![...data].toString().trim()) {
                console.log("start error");
            }
            else {
                jsonData = JSON.parse(data);

                if (reqSocketId === jsonData.host) {
                    // Move the users in the lobby to the game
                    jsonData.inGame = jsonData.inRoom;
                    jsonData.state = "Game";

                    jsonData.game = {
                        currentDoubleTurn: 0,
                        currentPlayerIndex: 0,
                        currentPlayer: jsonData.inGame[0],
                        stormTransitionMap: getTransitionMap(jsonData.mapSize),
                        stormDistance: 0,
                        status: {

                        },
                        map: {

                        },
                        firedBullets: [

                        ],
                        walls: [
                            
                        ],
                        biomeMap: generateNoiseGrid(jsonData.mapSize, jsonData.mapSize / 10 + 1, 20)
                    };

                    jsonData.inGame.forEach(id => {

                        let previousStatus = {};
                        if (Object.keys(jsonData.game.status).length > 0) {
                            Object.assign(previousStatus, jsonData.game.status);
                        }
                        let playerInitX, playerInitY;

                        do {
                            playerInitX = Math.floor(Math.random() * jsonData.mapSize);
                            playerInitY = Math.floor(Math.random() * jsonData.mapSize);

                            jsonData.game.status[id] = {
                                hp: 5,
                                wood: 0,
                                ammo: 0,
                                gun: false,
                                x: playerInitX,
                                y: playerInitY,
                                facing: ["N", "S", "E", "W"][Math.floor(Math.random() * 4)]
                            };
                            console.log([...Object.values(previousStatus)]);
                        }
                        while ([...Object.values(previousStatus)].map(item => item.x === playerInitX && item.y === playerInitY).reduce((acc, cur) => acc || cur, false));
                    });

                    // Generate Items

                    // Initializing Map
                    for (let i = 0; i < jsonData.mapSize; i++) {
                        for (let j = 0; j < jsonData.mapSize; j++) {
                            jsonData.game.map[`${i},${j}`] = {
                                hasWood: false,
                                hasAmmo: false,
                                hasGun: false
                            };
                        }
                    }

                    // Generating guns
                    let totalGunAmount = Math.max(jsonData.inGame.length, Math.floor(jsonData.mapSize * jsonData.mapSize / 100));
                    let totalGunsPlaced = 0;
                    while (totalGunsPlaced < totalGunAmount) {
                        let posX = Math.floor(Math.random() * jsonData.mapSize);
                        let posY = Math.floor(Math.random() * jsonData.mapSize);

                        // If no player is on the block
                        if (![...Object.values(jsonData.game.status)].map(item => item.x === posX && item.y === posY).reduce((acc, cur) => acc || cur, false)) {
                            jsonData.game.map[`${posX},${posY}`].hasGun = true;
                        }
                        else {
                            continue;
                        }
                        totalGunsPlaced++;
                    }

                    for (let i = 0; i < jsonData.mapSize; i++) {
                        for (let j = 0; j < jsonData.mapSize; j++) {
                            // If there is no gun on the block
                            if (!(jsonData.game.map[`${i},${j}`].hasGun)) {
                                // If no player is on the block
                                if (![...Object.values(jsonData.game.status)].map(item => item.x === i && item.y === j).reduce((acc, cur) => acc || cur, false)) {
                                    // This determines if something will spawn on this block
                                    if (Math.random() < 0.5) {

                                        // This determines the thing that will spawn on the block
                                        if (Math.random() < 0.5) {
                                            // Place Ammo
                                            jsonData.game.map[`${i},${j}`] = {
                                                hasWood: false,
                                                hasAmmo: true,
                                                hasGun: false
                                            };
                                        }
                                        else {
                                            // Place Wood
                                            jsonData.game.map[`${i},${j}`] = {
                                                hasWood: true,
                                                hasAmmo: false,
                                                hasGun: false
                                            };
                                        }
                                    }
                                }
                                else {
                                    // There is a player on the block
                                    jsonData.game.map[`${i},${j}`] = {
                                        hasWood: false,
                                        hasAmmo: false,
                                        hasGun: false
                                    };
                                }
                            }
                        }
                    }

                    // Tell the connected clients that the game is starting
                    io.sockets.to(roomCode).emit("startGame");

                    // Update room info
                    writeFile(`rooms/${roomCode}.json`, JSON.stringify(jsonData), (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });

                    // Update client side
                    io.sockets.to(roomCode).emit("updateRoom", jsonData);

                    /*setTimeout(()=>{
                        jsonData.state = "Intermission";
                        jsonData.inGame = [];
                        io.sockets.to(roomCode).emit("endGame");
                        
                        writeFile(`rooms/${roomCode}.json`, JSON.stringify(jsonData), (err) => {
                            if(err)
                            {
                                console.log(err);
                            }
                        });
                        // Update client side
                        io.sockets.to(roomCode).emit("updateRoom", jsonData);
                    }, 10000);*/
                }
            }
        })
    });

    socket.on("move", (posX, posY, heading) => {
        readFile(`rooms/${socket.roomCode}.json`, { encoding: "utf-8" }, (err, data) => {
            if (err || ![...data].toString().trim()) {
                console.log("move error");
            }
            else {
                let jsonData = JSON.parse(data);
                let [oldX, oldY] = [jsonData.game.status[socket.id].x, jsonData.game.status[socket.id].y];

                // If the user who requests to move is the current player, and there is no wall obstructing the player's movement, allow the player to move
                console.log(`${socket.id} - ${jsonData.game.currentPlayer}`);
                if (socket.id === jsonData.game.currentPlayer && (posX < jsonData.mapSize && posX >= 0) && (posY < jsonData.mapSize && posY >= 0) && Object.values(jsonData.game.status).filter(item => item.x === posX && item.y === posY).length === 0 && (!jsonData.game.walls.includes(JSON.stringify([oldX, oldY, posX, posY])) && !jsonData.game.walls.includes(JSON.stringify([posX, posY, oldX, oldY]))))
                {
                    // Move User
                    console.log(`pos{${posX}, ${posY}}`);
                    jsonData.game.status[socket.id].x = posX;
                    jsonData.game.status[socket.id].y = posY;
                    jsonData.game.status[socket.id].facing = heading;

                    // There is wood on the new square, let the player obtain the wood
                    if (jsonData.game.map[`${posX},${posY}`].hasWood) {
                        jsonData.game.status[socket.id].wood++;
                        jsonData.game.map[`${posX},${posY}`].hasWood = false;
                    }

                    // There is ammo on the new square, let the player obtain the ammo
                    if (jsonData.game.map[`${posX},${posY}`].hasAmmo) {
                        jsonData.game.status[socket.id].ammo++;
                        jsonData.game.map[`${posX},${posY}`].hasAmmo = false;
                    }

                    // There is a gun on the new square, let the player obtain the gun if they don't have one already
                    if (jsonData.game.map[`${posX},${posY}`].hasGun && !jsonData.game.status[socket.id].gun) {
                        jsonData.game.status[socket.id].gun = true;
                        jsonData.game.map[`${posX},${posY}`].hasGun = false;
                    }

                    // Check if the player moved over a bullet and inflict damage upon them if they have (delete bullet(s) that have hit the player)
                    if (jsonData.game.firedBullets.map(item => item.x === posX && item.y === posY).reduce((acc, cur) => acc || cur, 0)) {
                        jsonData.game.status[socket.id].hp -= jsonData.game.firedBullets.map(item => item.x === posX && item.y === posY).reduce((acc, cur) => acc + (cur ? 1 : 0), 0);
                        jsonData.game.firedBullets.filter(item => item.x === posX && item.y === posY).forEach((_, index) => {
                            jsonData.game.firedBullets.splice(index, 1);
                        })
                    }

                    // End current player's turn
                    jsonData.game.currentDoubleTurn += (jsonData.game.currentPlayerIndex + 1 === jsonData.inGame.length ? 1 : 0);

                    jsonData.game.currentPlayerIndex = (jsonData.game.currentPlayerIndex + 1) % jsonData.inGame.length;
                    jsonData.game.currentPlayer = jsonData.inGame[jsonData.game.currentPlayerIndex];

                    // Update Storm
                    jsonData.game.stormDistance = getStormDistance(jsonData.game.stormTransitionMap, jsonData.game.currentDoubleTurn);

                    // Damage Players in Storm
                    jsonData.inGame.forEach(item => {
                        let [playerPosX, playerPosY] = [jsonData.game.status[item].x, jsonData.game.status[item].y];

                        // Player is in storm, inflict damage
                        if (playerPosX < jsonData.game.stormDistance || playerPosX >= jsonData.mapSize - jsonData.game.stormDistance || playerPosY < jsonData.game.stormDistance || playerPosY >= jsonData.mapSize - jsonData.game.stormDistance) {
                            jsonData.game.status[item].hp--;
                        }
                    });

                    // Move bullets
                    let bulletList = jsonData.game.firedBullets;
                    for (let i = 0; i < bulletList.length; i++) {
                        let currentBullet = {};
                        Object.assign(currentBullet, bulletList[i]);

                        // Move the bullet
                        switch (currentBullet.facing) {
                            case "N":
                                currentBullet.y--;
                                break;
                            case "W":
                                currentBullet.x--;
                                break;
                            case "S":
                                currentBullet.y++;
                                break;
                            case "E":
                                currentBullet.x++;
                                break;
                        }

                        // Move the bullet if it will remain inside the map; otherwise, delete it
                        if (jsonData.game.walls.includes(JSON.stringify([jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y, currentBullet.x, currentBullet.y])) || jsonData.game.walls.includes(JSON.stringify([currentBullet.x, currentBullet.y, jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y]))) {
                            // The bullet hit a wall, delete the wall and the bullet
                            jsonData.game.walls = jsonData.game.walls.filter(item => item !== JSON.stringify([jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y, currentBullet.x, currentBullet.y]) && item !== JSON.stringify([currentBullet.x, currentBullet.y, jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y]));

                            // Bullet will hit a wall; delete it
                            jsonData.game.firedBullets.splice(i, 1);
                        }
                        else if (currentBullet.y < jsonData.mapSize && currentBullet.y >= 0 && currentBullet.x < jsonData.mapSize && currentBullet.x >= 0) {
                            jsonData.game.firedBullets[i].x = currentBullet.x;
                            jsonData.game.firedBullets[i].y = currentBullet.y;
                            // If player is hit by bullet, reduce HP
                            Object.entries(jsonData.game.status).forEach(item => {
                                if (item[1].x == currentBullet.x && item[1].y == currentBullet.y) {
                                    jsonData.game.firedBullets.splice(i, 1);
                                    jsonData.game.status[item[0]].hp--;
                                }
                            });
                        }
                        else {
                            // Bullet will go out of bounds; delete it
                            jsonData.game.firedBullets.splice(i, 1);
                        }
                    }

                    // Check for player deaths
                    let previousInGame = jsonData.inGame;
                    Object.entries(jsonData.game.status).forEach(item => {
                        // Kill the player if their hp is less than or equal to 0
                        if (jsonData.game.status[item[0]].hp <= 0) {
                            // Player has 0 hp. End their game
                            io.sockets.to(item[0]).emit("endGame", `You died. Game Over.`);

                            let indexOfLeavingPlayer = jsonData.inGame.indexOf(item[0]);

                            // Remove killed player from list of players in game
                            jsonData.inGame = jsonData.inGame.filter(id => id !== item[0]);
                            delete jsonData.game.status[item[0]];

                            // Since the player died, handle the changing of the turns

                            // The index of the player who died is greater than the currentPlayingIndex, there will be no effect
                            // The index of the player who died equals the currentPlayingIndex, the currentPlayingIndex will not change (unless currentPlayingIndex=players.length), but the currentPlayer will
                            if (indexOfLeavingPlayer === jsonData.game.currentPlayerIndex) {
                                jsonData.game.currentPlayerIndex %= Math.max(jsonData.inGame.length, 1);
                                jsonData.game.currentPlayer = jsonData.inGame[jsonData.game.currentPlayerIndex];
                            }
                            else if (indexOfLeavingPlayer < jsonData.game.currentPlayerIndex) // The index of the player who died is less than the currentPlayingIndex, the current player will not change, but the currentPlayingIndex will decrease by -1
                            {
                                jsonData.game.currentPlayerIndex--;
                            }
                        }
                    });

                    // If the total number of players is 1, end the game
                    if (jsonData.inGame.length === 1) {
                        io.sockets.to(jsonData.inGame[0]).emit("endGame", "Congratulations, you won!");
                        jsonData.inRoom.filter(id => !previousInGame.includes(id)).forEach(id => {
                            io.sockets.to(id).emit("announceEndGame", `Game Over! ${jsonData.usernames[jsonData.inGame[0]]} has won the game`);
                        });

                        // Update room info
                        jsonData.state = "Intermission";
                        jsonData.inGame = [];
                    }
                    else if (jsonData.inGame.length === 0) {
                        jsonData.inRoom.filter(id => !previousInGame.includes(id)).forEach(id => {
                            io.sockets.to(id).emit("announceEndGame", `Game Over! No one won the game.`);
                        });

                        jsonData.state = "Intermission";
                    }

                    // Update File
                    writeFile(`rooms/${socket.roomCode}.json`, JSON.stringify(jsonData), (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });

                    // Update Room
                    io.sockets.to(socket.roomCode).emit("updateRoom", jsonData);
                }
            }
        })
    });

    socket.on("skip", () => {
        readFile(`rooms/${socket.roomCode}.json`, { encoding: "utf-8" }, (err, data) => {
            if (err || ![...data].toString().trim()) {
                console.log("skip error");
            }
            else {
                let jsonData = JSON.parse(data);

                console.log(`${socket.id} - ${jsonData.game.currentPlayer}`);
                // If the user who requested the skip is the current player, skip
                if (socket.id === jsonData.game.currentPlayer) {
                    // Change the current player to the next player
                    jsonData.game.currentDoubleTurn += (jsonData.game.currentPlayerIndex + 1 === jsonData.inGame.length ? 1 : 0);

                    jsonData.game.currentPlayerIndex = (jsonData.game.currentPlayerIndex + 1) % jsonData.inGame.length;
                    jsonData.game.currentPlayer = jsonData.inGame[jsonData.game.currentPlayerIndex];

                    // Update Storm
                    jsonData.game.stormDistance = getStormDistance(jsonData.game.stormTransitionMap, jsonData.game.currentDoubleTurn);

                    // Update Storm
                    jsonData.game.stormDistance = getStormDistance(jsonData.game.stormTransitionMap, jsonData.game.currentDoubleTurn);

                    // Damage Players in Storm
                    jsonData.inGame.forEach(item => {
                        let [playerPosX, playerPosY] = [jsonData.game.status[item].x, jsonData.game.status[item].y];

                        // Player is in storm, inflict damage
                        if (playerPosX < jsonData.game.stormDistance || playerPosX >= jsonData.mapSize - jsonData.game.stormDistance || playerPosY < jsonData.game.stormDistance || playerPosY >= jsonData.mapSize - jsonData.game.stormDistance) {
                            jsonData.game.status[item].hp--;
                        }
                    });

                    // Move bullets
                    let bulletList = jsonData.game.firedBullets;
                    for (let i = 0; i < bulletList.length; i++) {
                        let currentBullet = {};
                        Object.assign(currentBullet, bulletList[i]);

                        // Move the bullet
                        switch (currentBullet.facing) {
                            case "N":
                                currentBullet.y--;
                                break;
                            case "W":
                                currentBullet.x--;
                                break;
                            case "S":
                                currentBullet.y++;
                                break;
                            case "E":
                                currentBullet.x++;
                                break;
                        }

                        // Move the bullet if it will remain inside the map; otherwise, delete it
                        if (jsonData.game.walls.includes(JSON.stringify([jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y, currentBullet.x, currentBullet.y])) || jsonData.game.walls.includes(JSON.stringify([currentBullet.x, currentBullet.y, jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y]))) {
                            // The bullet hit a wall, delete the wall and the bullet
                            jsonData.game.walls = jsonData.game.walls.filter(item => item !== JSON.stringify([jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y, currentBullet.x, currentBullet.y]) && item !== JSON.stringify([currentBullet.x, currentBullet.y, jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y]));

                            // Bullet will hit a wall; delete it
                            jsonData.game.firedBullets.splice(i, 1);
                        }
                        else if (currentBullet.y < jsonData.mapSize && currentBullet.y >= 0 && currentBullet.x < jsonData.mapSize && currentBullet.x >= 0) {
                            jsonData.game.firedBullets[i].x = currentBullet.x;
                            jsonData.game.firedBullets[i].y = currentBullet.y;
                            // If player is hit by bullet, reduce HP
                            Object.entries(jsonData.game.status).forEach(item => {
                                if (item[1].x == currentBullet.x && item[1].y == currentBullet.y) {
                                    jsonData.game.firedBullets.splice(i, 1);
                                    jsonData.game.status[item[0]].hp--;
                                }
                            });
                        }
                        else {
                            // Bullet will go out of bounds; delete it
                            jsonData.game.firedBullets.splice(i, 1);
                        }
                    }

                    // Check for player deaths
                    let previousInGame = jsonData.inGame;
                    Object.entries(jsonData.game.status).forEach(item => {
                        // Kill the player if their hp is less than or equal to 0
                        if (jsonData.game.status[item[0]].hp <= 0) {
                            // Player has 0 hp. End their game
                            io.sockets.to(item[0]).emit("endGame", `You died. Game Over.`);

                            let indexOfLeavingPlayer = jsonData.inGame.indexOf(item[0]);

                            // Remove killed player from list of players in game
                            jsonData.inGame = jsonData.inGame.filter(id => id !== item[0]);
                            delete jsonData.game.status[item[0]];

                            // Since the player died, handle the changing of the turns

                            // The index of the player who died is greater than the currentPlayingIndex, there will be no effect
                            // The index of the player who died equals the currentPlayingIndex, the currentPlayingIndex will not change (unless currentPlayingIndex=players.length), but the currentPlayer will
                            if (indexOfLeavingPlayer === jsonData.game.currentPlayerIndex) {
                                jsonData.game.currentPlayerIndex %= Math.max(jsonData.inGame.length, 1);
                                jsonData.game.currentPlayer = jsonData.inGame[jsonData.game.currentPlayerIndex];
                            }
                            else if (indexOfLeavingPlayer < jsonData.game.currentPlayerIndex) // The index of the player who died is less than the currentPlayingIndex, the current player will not change, but the currentPlayingIndex will decrease by -1
                            {
                                jsonData.game.currentPlayerIndex--;
                            }
                        }
                    });

                    // If the total number of players is 1, end the game
                    if (jsonData.inGame.length === 1) {
                        io.sockets.to(jsonData.inGame[0]).emit("endGame", "Congratulations, you won!");
                        jsonData.inRoom.filter(id => !previousInGame.includes(id)).forEach(id => {
                            io.sockets.to(id).emit("announceEndGame", `Game Over! ${jsonData.usernames[jsonData.inGame[0]]} has won the game`);
                        });

                        // Update room info
                        jsonData.state = "Intermission";
                        jsonData.inGame = [];
                    }
                    else if (jsonData.inGame.length === 0) {
                        jsonData.inRoom.filter(id => !previousInGame.includes(id)).forEach(id => {
                            io.sockets.to(id).emit("announceEndGame", `Game Over! No one won the game.`);
                        });

                        jsonData.state = "Intermission";
                    }

                    // Update File
                    writeFile(`rooms/${socket.roomCode}.json`, JSON.stringify(jsonData), (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });

                    // Update Room
                    io.sockets.to(socket.roomCode).emit("updateRoom", jsonData);
                }
            }
        });
    });

    socket.on("turn", (newDirection) => {
        readFile(`rooms/${socket.roomCode}.json`, { encoding: "utf-8" }, (err, data) => {
            if (err || ![...data].toString().trim()) {
                console.log("turn error");
            }
            else {
                jsonData = JSON.parse(data);
                console.log(newDirection);

                // Update Heading
                jsonData.game.status[socket.id].facing = newDirection;

                //console.log(`${socket.id} is now facing towards ${newDirection}`);

                // Update File
                writeFile(`rooms/${socket.roomCode}.json`, JSON.stringify(jsonData), (err) => {
                    if (err) {
                        console.log(err);
                    }
                });

                // Update Clients in Room
                io.sockets.to(socket.roomCode).emit("updateRoom", jsonData);
            }
        })
    })

    socket.on("shoot", (posX, posY, heading) => {
        readFile(`rooms/${socket.roomCode}.json`, { encoding: "utf-8" }, (err, data) => {
            if (err || ![...data].toString().trim()) {
                console.log("shoot error");
            }
            else {
                let jsonData = JSON.parse(data);

                // If the user who requests to shoot is the currentPlayer, they have gun and ammo, and the position that they are deploying the bullet in is valid deploy a new bullet
                if (socket.id === jsonData.game.currentPlayer && jsonData.game.status[socket.id].ammo > 0 && jsonData.game.status[socket.id].gun === true && posX >= 0 && posX < jsonData.mapSize && posY >= 0 && posY < jsonData.mapSize) {
                    // Decrease Ammo Count by 1
                    jsonData.game.status[socket.id].ammo--;

                    // Add bullet to board
                    jsonData.game.firedBullets.push({
                        x: posX,
                        y: posY,
                        facing: heading
                    });

                    // Change the current player to the next player
                    jsonData.game.currentDoubleTurn += (jsonData.game.currentPlayerIndex + 1 === jsonData.inGame.length ? 1 : 0);

                    jsonData.game.currentPlayerIndex = (jsonData.game.currentPlayerIndex + 1) % jsonData.inGame.length;
                    jsonData.game.currentPlayer = jsonData.inGame[jsonData.game.currentPlayerIndex];

                    // Update Storm
                    jsonData.game.stormDistance = getStormDistance(jsonData.game.stormTransitionMap, jsonData.game.currentDoubleTurn);

                    // Damage Players in Storm
                    jsonData.inGame.forEach(item => {
                        let [playerPosX, playerPosY] = [jsonData.game.status[item].x, jsonData.game.status[item].y];

                        // Player is in storm, inflict damage
                        if (playerPosX < jsonData.game.stormDistance || playerPosX >= jsonData.mapSize - jsonData.game.stormDistance || playerPosY < jsonData.game.stormDistance || playerPosY >= jsonData.mapSize - jsonData.game.stormDistance) {
                            jsonData.game.status[item].hp--;
                        }
                    });

                    // Move bullets
                    let bulletList = jsonData.game.firedBullets;
                    for (let i = 0; i < bulletList.length; i++) {
                        let currentBullet = {};
                        Object.assign(currentBullet, bulletList[i]);

                        // Move the bullet
                        switch (currentBullet.facing) {
                            case "N":
                                currentBullet.y--;
                                break;
                            case "W":
                                currentBullet.x--;
                                break;
                            case "S":
                                currentBullet.y++;
                                break;
                            case "E":
                                currentBullet.x++;
                                break;
                        }

                        // Move the bullet if it will remain inside the map; otherwise, delete it
                        if (jsonData.game.walls.includes(JSON.stringify([jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y, currentBullet.x, currentBullet.y])) || jsonData.game.walls.includes(JSON.stringify([currentBullet.x, currentBullet.y, jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y]))) {
                            // The bullet hit a wall, delete the wall and the bullet
                            jsonData.game.walls = jsonData.game.walls.filter(item => item !== JSON.stringify([jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y, currentBullet.x, currentBullet.y]) && item !== JSON.stringify([currentBullet.x, currentBullet.y, jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y]));

                            // Bullet will hit a wall; delete it
                            jsonData.game.firedBullets.splice(i, 1);
                        }
                        else if (currentBullet.y < jsonData.mapSize && currentBullet.y >= 0 && currentBullet.x < jsonData.mapSize && currentBullet.x >= 0) {
                            jsonData.game.firedBullets[i].x = currentBullet.x;
                            jsonData.game.firedBullets[i].y = currentBullet.y;
                            // If player is hit by bullet, reduce HP
                            Object.entries(jsonData.game.status).forEach(item => {
                                if (item[1].x == currentBullet.x && item[1].y == currentBullet.y) {
                                    jsonData.game.firedBullets.splice(i, 1);
                                    jsonData.game.status[item[0]].hp--;
                                }
                            });
                        }
                        else {
                            // Bullet will go out of bounds; delete it
                            jsonData.game.firedBullets.splice(i, 1);
                        }
                    }

                    // Check for player deaths
                    let previousInGame = jsonData.inGame;
                    Object.entries(jsonData.game.status).forEach(item => {
                        // Kill the player if their hp is less than or equal to 0
                        if (jsonData.game.status[item[0]].hp <= 0) {
                            // Player has 0 hp. End their game
                            io.sockets.to(item[0]).emit("endGame", `You died. Game Over.`);

                            let indexOfLeavingPlayer = jsonData.inGame.indexOf(item[0]);

                            // Remove killed player from list of players in game
                            jsonData.inGame = jsonData.inGame.filter(id => id !== item[0]);
                            delete jsonData.game.status[item[0]];

                            // Since the player died, handle the changing of the turns

                            // The index of the player who died is greater than the currentPlayingIndex, there will be no effect
                            // The index of the player who died equals the currentPlayingIndex, the currentPlayingIndex will not change (unless currentPlayingIndex=players.length), but the currentPlayer will
                            if (indexOfLeavingPlayer === jsonData.game.currentPlayerIndex) {
                                jsonData.game.currentPlayerIndex %= Math.max(jsonData.inGame.length, 1);
                                jsonData.game.currentPlayer = jsonData.inGame[jsonData.game.currentPlayerIndex];
                            }
                            else if (indexOfLeavingPlayer < jsonData.game.currentPlayerIndex) // The index of the player who died is less than the currentPlayingIndex, the current player will not change, but the currentPlayingIndex will decrease by -1
                            {
                                jsonData.game.currentPlayerIndex--;
                            }
                        }
                    });

                    // If the total number of players is 1, end the game
                    if (jsonData.inGame.length === 1) {
                        io.sockets.to(jsonData.inGame[0]).emit("endGame", "Congratulations, you won!");
                        jsonData.inRoom.filter(id => !previousInGame.includes(id)).forEach(id => {
                            io.sockets.to(id).emit("announceEndGame", `Game Over! ${jsonData.usernames[jsonData.inGame[0]]} has won the game`);
                        });

                        // Update room info
                        jsonData.state = "Intermission";
                        jsonData.inGame = [];
                    }
                    else if (jsonData.inGame.length === 0) {
                        jsonData.inRoom.filter(id => !previousInGame.includes(id)).forEach(id => {
                            io.sockets.to(id).emit("announceEndGame", `Game Over! No one won the game.`);
                        });

                        jsonData.state = "Intermission";
                    }

                    // Update JSON file
                    writeFile(`rooms/${socket.roomCode}.json`, JSON.stringify(jsonData), (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });

                    // Update clients in room
                    io.sockets.to(socket.roomCode).emit("updateRoom", jsonData);
                }
            }
        });
    });

    socket.on("build", (posX1, posY1, posX2, posY2) => {
        readFile(`rooms/${socket.roomCode}.json`, {encoding: "utf-8"}, (err, data) => {
            if(err || ![...data].toString().trim())
            {
                console.log("build error");
            }
            else
            {
                let jsonData = JSON.parse(data);

                console.log(`${socket.id} requests to build`);
                // If the player requesting to build is the current player moving, there is no wall in the area that the player requests to build in, the area that the player requests to build in is valid (i.e. not the edge of the map), and the player has wood, make a wall
                if (socket.id === jsonData.game.currentPlayer && !jsonData.game.walls.includes(JSON.stringify([posX1, posY1, posX2, posY2])) && posX1 >= 0 && posY1 >= 0 && posX2 < jsonData.mapSize && posY2 < jsonData.mapSize && jsonData.game.status[socket.id].wood > 0)
                {
                    // Build the wall
                    jsonData.game.walls.push(JSON.stringify([posX1, posY1, posX2, posY2]));

                    // Decrease the user's wood amount
                    jsonData.game.status[socket.id].wood--;

                    // Change the current player to the next player
                    jsonData.game.currentDoubleTurn += (jsonData.game.currentPlayerIndex + 1 === jsonData.inGame.length ? 1 : 0);

                    jsonData.game.currentPlayerIndex = (jsonData.game.currentPlayerIndex + 1) % jsonData.inGame.length;
                    jsonData.game.currentPlayer = jsonData.inGame[jsonData.game.currentPlayerIndex];

                    // Update Storm
                    jsonData.game.stormDistance = getStormDistance(jsonData.game.stormTransitionMap, jsonData.game.currentDoubleTurn);

                    // Damage Players in Storm
                    jsonData.inGame.forEach(item => {
                        let [playerPosX, playerPosY] = [jsonData.game.status[item].x, jsonData.game.status[item].y];

                        // Player is in storm, inflict damage
                        if (playerPosX < jsonData.game.stormDistance || playerPosX >= jsonData.mapSize - jsonData.game.stormDistance || playerPosY < jsonData.game.stormDistance || playerPosY >= jsonData.mapSize - jsonData.game.stormDistance) {
                            jsonData.game.status[item].hp--;
                        }
                    });

                    // Move bullets
                    let bulletList = jsonData.game.firedBullets;
                    for (let i = 0; i < bulletList.length; i++) {
                        let currentBullet = {};
                        Object.assign(currentBullet, bulletList[i]);

                        // Move the bullet
                        switch (currentBullet.facing) {
                            case "N":
                                currentBullet.y--;
                                break;
                            case "W":
                                currentBullet.x--;
                                break;
                            case "S":
                                currentBullet.y++;
                                break;
                            case "E":
                                currentBullet.x++;
                                break;
                        }

                        // Move the bullet if it will remain inside the map; otherwise, delete it
                        if (jsonData.game.walls.includes(JSON.stringify([jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y, currentBullet.x, currentBullet.y])) || jsonData.game.walls.includes(JSON.stringify([currentBullet.x, currentBullet.y, jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y]))) {
                            // The bullet hit a wall, delete the wall and the bullet
                            jsonData.game.walls = jsonData.game.walls.filter(item => item !== JSON.stringify([jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y, currentBullet.x, currentBullet.y]) && item !== JSON.stringify([currentBullet.x, currentBullet.y, jsonData.game.firedBullets[i].x, jsonData.game.firedBullets[i].y]));

                            // Bullet will hit a wall; delete it
                            jsonData.game.firedBullets.splice(i, 1);
                        }
                        else if (currentBullet.y < jsonData.mapSize && currentBullet.y >= 0 && currentBullet.x < jsonData.mapSize && currentBullet.x >= 0) {
                            jsonData.game.firedBullets[i].x = currentBullet.x;
                            jsonData.game.firedBullets[i].y = currentBullet.y;
                            // If player is hit by bullet, reduce HP
                            Object.entries(jsonData.game.status).forEach(item => {
                                if (item[1].x == currentBullet.x && item[1].y == currentBullet.y) {
                                    jsonData.game.firedBullets.splice(i, 1);
                                    jsonData.game.status[item[0]].hp--;
                                }
                            });
                        }
                        else {
                            // Bullet will go out of bounds; delete it
                            jsonData.game.firedBullets.splice(i, 1);
                        }
                    }

                    // Check for player deaths
                    let previousInGame = jsonData.inGame;
                    Object.entries(jsonData.game.status).forEach(item => {
                        // Kill the player if their hp is less than or equal to 0
                        if (jsonData.game.status[item[0]].hp <= 0) {
                            // Player has 0 hp. End their game
                            io.sockets.to(item[0]).emit("endGame", `You died. Game Over.`);

                            let indexOfLeavingPlayer = jsonData.inGame.indexOf(item[0]);

                            // Remove killed player from list of players in game
                            jsonData.inGame = jsonData.inGame.filter(id => id !== item[0]);
                            delete jsonData.game.status[item[0]];

                            // Since the player died, handle the changing of the turns

                            // The index of the player who died is greater than the currentPlayingIndex, there will be no effect
                            // The index of the player who died equals the currentPlayingIndex, the currentPlayingIndex will not change (unless currentPlayingIndex=players.length), but the currentPlayer will
                            if (indexOfLeavingPlayer === jsonData.game.currentPlayerIndex) {
                                jsonData.game.currentPlayerIndex %= Math.max(jsonData.inGame.length, 1);
                                jsonData.game.currentPlayer = jsonData.inGame[jsonData.game.currentPlayerIndex];
                            }
                            else if (indexOfLeavingPlayer < jsonData.game.currentPlayerIndex) // The index of the player who died is less than the currentPlayingIndex, the current player will not change, but the currentPlayingIndex will decrease by -1
                            {
                                jsonData.game.currentPlayerIndex--;
                            }
                        }
                    });

                    // If the total number of players is 1, end the game
                    if (jsonData.inGame.length === 1) {
                        io.sockets.to(jsonData.inGame[0]).emit("endGame", "Congratulations, you won!");
                        jsonData.inRoom.filter(id => !previousInGame.includes(id)).forEach(id => {
                            io.sockets.to(id).emit("announceEndGame", `Game Over! ${jsonData.usernames[jsonData.inGame[0]]} has won the game`);
                        });

                        // Update room info
                        jsonData.state = "Intermission";
                        jsonData.inGame = [];
                    }
                    else if (jsonData.inGame.length === 0) {
                        jsonData.inRoom.filter(id => !previousInGame.includes(id)).forEach(id => {
                            io.sockets.to(id).emit("announceEndGame", `Game Over! No one won the game.`);
                        });

                        jsonData.state = "Intermission";
                    }

                    // Update JSON file
                    writeFile(`rooms/${socket.roomCode}.json`, JSON.stringify(jsonData), (err) => {
                        if (err) {
                            console.log(err);
                        }
                    });

                    // Update clients in room
                    io.sockets.to(socket.roomCode).emit("updateRoom", jsonData);
                }
            }
        });
    });

    //// Disconnecting

    socket.on("disconnecting", () => {
        console.log(`${socket.id} is leaving`);
        // Checking to see if the client has joined a room
        if (typeof socket.roomCode !== "undefined") {
            readFile(`rooms/${socket.roomCode}.json`, { encoding: "utf-8" }, (err, data) => {
                if (err || ![...data].toString().trim()) {
                    console.log("disconnecting error");
                }
                else {
                    let jsonData = JSON.parse(data);

                    // If length is smaller than 1, then the room will end up with 0 players; delete to save space
                    if (jsonData.inRoom.length <= 1) {
                        unlink(`rooms/${socket.roomCode}.json`, (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                    }
                    // If the host leaves, assign a new host
                    else if (jsonData.host === socket.id) {
                        let previousTotalPlayers = jsonData.inGame.length;
                        let indexOfLeavingPlayer = jsonData.inGame.indexOf(socket.id);
                        jsonData.inRoom = jsonData.inRoom.filter(item => item !== socket.id);
                        jsonData.inGame = jsonData.inGame.filter(item => item !== socket.id);
                        jsonData.host = jsonData.inRoom[0];
                        delete jsonData.usernames[socket.id];

                        // The player who left was in the game previously
                        if (previousTotalPlayers !== jsonData.inGame.length) {
                            // Delete their game status information
                            delete jsonData.game.status[socket.id];

                            // Handle the changing of turns

                            // The index of the player who left is greater than the currentPlayingIndex, there will be no effect
                            // The index of the player who left equals the currentPlayingIndex, the currentPlayingIndex will not change (unless currentPlayingIndex=players.length), but the currentPlayer will
                            if (indexOfLeavingPlayer === jsonData.game.currentPlayerIndex) {
                                jsonData.game.currentPlayerIndex %= jsonData.inGame.length;
                                jsonData.game.currentPlayer = jsonData.inGame[jsonData.game.currentPlayerIndex];
                            }
                            else if (indexOfLeavingPlayer < jsonData.game.currentPlayerIndex) // The index of the player who left is less than the currentPlayingIndex, the current player will not change, but the currentPlayingIndex will decrease by -1
                            {
                                jsonData.game.currentPlayerIndex--;
                            }

                            // If the total number of players is 1, end the game
                            if (jsonData.inGame.length == 1) {
                                io.sockets.to(jsonData.inGame[0]).emit("endGame", "Congratulations, you won! (The other player left the game)");
                                jsonData.inRoom.filter(id => id !== jsonData.inGame[0]).forEach(id => {
                                    io.sockets.to(id).emit("announceEndGame", `Game Over! ${jsonData.usernames[jsonData.inGame[0]]} has won the game`);
                                });

                                // Update room info
                                jsonData.state = "Intermission";
                                jsonData.inGame = [];
                            }
                        }

                        console.log(`${jsonData.host} is now the host of room ${socket.roomCode}.`);
                        writeFile(`rooms/${socket.roomCode}.json`, JSON.stringify(jsonData), (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                        // Update room info
                        socket.to(socket.roomCode).emit("updateRoom", jsonData);
                    }
                    // If a normal player leaves, remove them from the player list
                    else {
                        let previousTotalPlayers = jsonData.inGame.length;
                        let indexOfLeavingPlayer = jsonData.inGame.indexOf(socket.id);
                        jsonData.inRoom = jsonData.inRoom.filter(item => item !== socket.id);
                        jsonData.inGame = jsonData.inGame.filter(item => item !== socket.id);
                        delete jsonData.usernames[socket.id];

                        // The player who left was in the game previously
                        if (previousTotalPlayers !== jsonData.inGame.length) {
                            // Delete their game status information
                            delete jsonData.game.status[socket.id];

                            // Handle the changing of turns

                            // The index of the player who left is greater than the currentPlayingIndex, there will be no effect
                            // The index of the player who left equals the currentPlayingIndex, the currentPlayingIndex will not change (unless currentPlayingIndex=players.length), but the currentPlayer will
                            if (indexOfLeavingPlayer === jsonData.game.currentPlayerIndex) {
                                jsonData.game.currentPlayerIndex %= jsonData.inGame.length;
                                jsonData.game.currentPlayer = jsonData.inGame[jsonData.game.currentPlayerIndex];
                            }
                            else if (indexOfLeavingPlayer < jsonData.game.currentPlayerIndex) // The index of the player who left is less than the currentPlayingIndex, the current player will not change, but the currentPlayingIndex will decrease by -1
                            {
                                jsonData.game.currentPlayerIndex--;
                            }

                            // If the total number of players is 1, end the game
                            if (jsonData.inGame.length == 1) {
                                io.sockets.to(jsonData.inGame[0]).emit("endGame", "Congratulations, you won! (The other player left the game)");
                                jsonData.inRoom.filter(id => id !== jsonData.inGame[0]).forEach(id => {
                                    io.sockets.to(id).emit("announceEndGame", `Game Over! ${jsonData.usernames[jsonData.inGame[0]]} has won the game`);
                                });

                                // Update room info
                                jsonData.state = "Intermission";
                                jsonData.inGame = [];
                            }
                        }

                        console.log(`${socket.id} left room ${socket.roomCode}`);
                        writeFile(`rooms/${socket.roomCode}.json`, JSON.stringify(jsonData), (err) => {
                            if (err) {
                                console.log(err);
                            }
                        });
                        // Update room info
                        socket.to(socket.roomCode).emit("updateRoom", jsonData);
                    }

                }
            });
        };
    });
})

/// Listening to the port

httpServer.listen(PORT, () => {
    console.log(`localhost:${PORT}`);
})
