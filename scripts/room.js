// Initializing Socket
const socket = io("/");

// Declaration Statements

/// Socket id
let socketId;

/// Get username
let username = localStorage.getItem("username") || "Player";
localStorage.setItem("username", username);

/// Getting room code
let roomCode = window.location.href.slice(-4);

/// Declaring a storage for the room information
let roomInfo;

/// Getting main elements
let mainElements = document.querySelectorAll("body > main");

/// Getting lobby elements
let [lobbyRoomName, lobbyRoomCode, startButton, startInfoBox, currentPlayerNameHTML, hitPointsHTML, woodAmountHTML, ammoAmountHTML, hasGunHTML, gameCanvas, endScreenMessage1, endScreenMessage2] = ["lobbyRoomName", "lobbyRoomCode", "startButton", "startInfoBox", "currentPlayerName", "hitPoints", "woodAmount", "ammoAmount", "hasGun", "gameCanvas", "endScreenMessage1", "endScreenMessage2"].map(item => document.getElementById(item));

/// Getting resources
let [GRASS_TEXTURE, STORM_TEXTURE, WOOD_TEXTURE, AMMO_TEXTURE, GUN_TEXTURE] = ["grass.png", "storm.png", "wood.svg", "ammo.svg", "gun.svg"].map(item => getResource(item));

/// Getting Canvas 2D Rendering Context
const ctx = gameCanvas.getContext("2d");

const CANVAS_SCALING = 720;

ctx.canvas.width = 0.8 * CANVAS_SCALING * window.innerWidth / window.innerHeight;
ctx.canvas.height = CANVAS_SCALING;

//Clear Function
ctx.clearAll = () => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
};

ctx.scale(CANVAS_SCALING / 5, CANVAS_SCALING / 5);
ctx.translate(ctx.canvas.width / 2 / (CANVAS_SCALING / 5), ctx.canvas.height / 2 / (CANVAS_SCALING / 5));

window.addEventListener("resize", (ev) => {
    if (roomInfo?.inGame?.includes(socketId || "") && roomInfo?.state === "Game") {
        // Draw Canvas

        ctx.canvas.width = 0.8 * CANVAS_SCALING * window.innerWidth / window.innerHeight;
        ctx.canvas.height = CANVAS_SCALING;

        //ctx.clearAll();

        ctx.scale(CANVAS_SCALING / 5, CANVAS_SCALING / 5);
        ctx.translate(ctx.canvas.width / 2 / (CANVAS_SCALING / 5) - roomInfo.game.status[socketId].x - 0.5, ctx.canvas.height / 2 / (CANVAS_SCALING / 5) - roomInfo.game.status[socketId].y - 0.5);

        // Map

        /// Ground and Items
        for (let i = 0; i < roomInfo.mapSize; i++) {
            for (let j = 0; j < roomInfo.mapSize; j++) {
                currentTile = roomInfo.game.map[`${i},${j}`];
                ctx.drawImage(GRASS_TEXTURE, i, j, 1, 1);

                if (currentTile.hasWood) {
                    ctx.drawImage(WOOD_TEXTURE, i + 0.25, j + (1 - 0.5 * WOOD_TEXTURE.height / WOOD_TEXTURE.width) / 2, 0.5, 0.5 * WOOD_TEXTURE.height / WOOD_TEXTURE.width);
                }
                if (currentTile.hasAmmo) {
                    ctx.drawImage(AMMO_TEXTURE, i + 0.45, j + (1 - 0.1 * AMMO_TEXTURE.height / AMMO_TEXTURE.width) / 2, 0.1, 0.1 * AMMO_TEXTURE.height / AMMO_TEXTURE.width);
                }
                if (currentTile.hasGun) {
                    ctx.drawImage(GUN_TEXTURE, i + 0.25, j + (1 - 0.5 * GUN_TEXTURE.height / GUN_TEXTURE.width) / 2, 0.5, 0.5 * GUN_TEXTURE.height / GUN_TEXTURE.width);
                }
            }
        }

        // Bullets
        let bulletList = roomInfo.game.firedBullets;
        for (let i = 0; i < bulletList.length; i++) {
            let currentBullet = bulletList[i];
            switch (currentBullet.facing) {
                case "N":
                    ctx.drawImage(AMMO_TEXTURE, currentBullet.x + 0.35, currentBullet.y + (1 - 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width) / 2, 0.3, 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width);
                    break;
                case "W":
                    ctx.save();
                    ctx.translate(currentBullet.x + 0.5, currentBullet.y + 0.5);
                    ctx.rotate(- Math.PI / 2);
                    ctx.translate(- currentBullet.x - 0.5, - currentBullet.y - 0.5);

                    ctx.drawImage(AMMO_TEXTURE, currentBullet.x + 0.35, currentBullet.y + (1 - 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width) / 2, 0.3, 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width);
                    ctx.restore();
                    break;
                case "S":
                    ctx.save();
                    ctx.translate(currentBullet.x + 0.5, currentBullet.y + 0.5);
                    ctx.rotate(Math.PI);
                    ctx.translate(- currentBullet.x - 0.5, - currentBullet.y - 0.5);


                    ctx.drawImage(AMMO_TEXTURE, currentBullet.x + 0.35, currentBullet.y + (1 - 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width) / 2, 0.3, 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width);
                    ctx.restore();
                    break;
                case "E":
                    ctx.save();
                    ctx.translate(currentBullet.x + 0.5, currentBullet.y + 0.5);
                    ctx.rotate(Math.PI / 2);
                    ctx.translate(- currentBullet.x - 0.5, - currentBullet.y - 0.5);


                    ctx.drawImage(AMMO_TEXTURE, currentBullet.x + 0.35, currentBullet.y + (1 - 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width) / 2, 0.3, 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width);
                    ctx.restore();
                    break;
            }
        }

        // Players

        Object.entries(roomInfo.game.status).forEach(item => {
            // Body
            ctx.fillStyle = (item[0] === socketId ? "rgb(20, 120, 255)" : "rgb(255, 20, 80)");
            ctx.beginPath();
            ctx.arc(item[1].x + 0.5, item[1].y + 0.5, 0.25, 0, 2 * Math.PI);
            ctx.fill();

            // Eyes
            ctx.fillStyle = "black";
            ctx.beginPath();
            switch (item[1].facing) {
                case "N":
                    ctx.arc(item[1].x + 0.42, item[1].y + 0.35, 0.03, 0, 2 * Math.PI);
                    ctx.arc(item[1].x + 0.58, item[1].y + 0.35, 0.03, 0, 2 * Math.PI);
                    break;
                case "S":
                    ctx.arc(item[1].x + 0.42, item[1].y + 0.65, 0.03, 0, 2 * Math.PI);
                    ctx.arc(item[1].x + 0.58, item[1].y + 0.65, 0.03, 0, 2 * Math.PI);
                    break;
                case "W":
                    ctx.arc(item[1].x + 0.35, item[1].y + 0.42, 0.03, 0, 2 * Math.PI);
                    ctx.arc(item[1].x + 0.35, item[1].y + 0.58, 0.03, 0, 2 * Math.PI);
                    break;
                case "E":
                    ctx.arc(item[1].x + 0.65, item[1].y + 0.42, 0.03, 0, 2 * Math.PI);
                    ctx.arc(item[1].x + 0.65, item[1].y + 0.58, 0.03, 0, 2 * Math.PI);
                    break;
            }
            ctx.fill();

            // Name
            ctx.fillStyle = "black";
            ctx.font = "0.25px 'Lexend', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(roomInfo.usernames[item[0]], item[1].x + 0.5, item[1].y + 0.15, 1.5);
        });

        // Walls

        roomInfo.game.walls.forEach(item => {
            // Each wall takes on the format [coord1x, coord1y, coord2x, coord2y]
            // where coord1x <= coord2x and coord1y <= coord2y

            let wallCoords = JSON.parse(item);

            // Wall is horizontal
            ctx.fillStyle = "#4E310B";
            ctx.beginPath()
            if (wallCoords[0] === wallCoords[2]) {
                ctx.rect(wallCoords[0] - 0.1, wallCoords[1] + 0.9, 1.2, 0.2);
            }
            else if (wallCoords[1] === wallCoords[3]) // Wall is vertical
            {
                ctx.rect(wallCoords[0] + 0.9, wallCoords[1] - 0.1, 0.2, 1.2);
            }
            ctx.closePath();
            ctx.fill();
        });

        // Storm

        ctx.globalAlpha = 0.4;
        for (let i = 0; i < roomInfo.mapSize; i++) {
            for (let j = 0; j < roomInfo.mapSize; j++) {
                // If the tile is in the storm, draw storm
                if (i < roomInfo.game.stormDistance || i >= roomInfo.mapSize - roomInfo.game.stormDistance || j < roomInfo.game.stormDistance || j >= roomInfo.mapSize - roomInfo.game.stormDistance) {
                    ctx.drawImage(STORM_TEXTURE, i, j, 1, 1);
                }
            }
        }
        ctx.globalAlpha = 1;
    }
})

/// Change the screen that is being shown
function showScreen(topOffset) {
    mainElements.forEach(item => {
        item.style.display = "none";
    });

    let windowElement = document.querySelector(`body > div.window`);

    windowElement.classList.add("windowTransitioning");
    windowElement.style.top = `${topOffset}vh`;

    setTimeout(() => {
        windowElement.classList.remove("windowTransitioning");
    }, 1000)
}

// Initialize client on server side
socket.emit("joinRoom", roomCode, username);

// Room Join Rejected
socket.on("rejectJoinRoom", (errCode) => {
    window.location.href = `/error/${errCode}`;
});

// Room Join Accepted
socket.on("acceptJoinRoom", (roomJsonData, newSocketId) => {
    lobbyRoomName.innerText = roomJsonData.roomName;
    lobbyRoomCode.innerText = roomCode;
    startInfoBox.innerText = (roomJsonData.state == "Intermission" ? "The game will start once the host presses the start button." : "There is a round that is currently going on. Please wait for it to finish.");

    socketId = newSocketId;

    roomInfo = roomJsonData;

    console.log((socketId === roomJsonData.host ? "block" : "none"));

    document.querySelector("main.lobby > button#startButton").style.display = (socketId === roomJsonData.host && roomJsonData.inRoom.length > 1 ? "block" : "none");
});

// Room Update
socket.on("updateRoom", (roomJsonData) => {
    lobbyRoomName.innerText = roomJsonData.roomName;
    lobbyRoomCode.innerText = roomCode;
    startInfoBox.innerText = (roomJsonData.state == "Intermission" ? "The game will start once the host presses the start button." : "There is a round that is currently going on. Please wait for it to finish.");

    roomInfo = roomJsonData;

    console.log(`UPDATED - ${socketId}`);

    document.querySelector("main.lobby > button#startButton").style.display = (socketId === roomJsonData.host && roomJsonData.inRoom.length > 1 ? "block" : "none");

    // User is currently playing, update game info
    if (roomJsonData.inGame.includes(socketId)) {
        // Setting the current player
        currentPlayerNameHTML.innerText = roomJsonData.usernames[roomJsonData.game.currentPlayer];

        // Setting the user status
        let gameStats = roomJsonData.game.status[socketId];

        hitPointsHTML.textContent = gameStats.hp;
        woodAmountHTML.textContent = gameStats.wood;
        ammoAmountHTML.textContent = gameStats.ammo;
        hasGunHTML.textContent = (gameStats.gun ? "Yes" : "No");

        console.table({ x: gameStats.x, y: gameStats.y });

        // Draw Canvas

        ctx.canvas.width = 0.8 * CANVAS_SCALING * window.innerWidth / window.innerHeight;
        ctx.canvas.height = CANVAS_SCALING;

        //ctx.clearAll();

        ctx.scale(CANVAS_SCALING / 5, CANVAS_SCALING / 5);
        ctx.translate(ctx.canvas.width / 2 / (CANVAS_SCALING / 5) - roomJsonData.game.status[socketId].x - 0.5, ctx.canvas.height / 2 / (CANVAS_SCALING / 5) - roomJsonData.game.status[socketId].y - 0.5);

        // Map

        /// Ground and Items
        for (let i = 0; i < roomJsonData.mapSize; i++) {
            for (let j = 0; j < roomJsonData.mapSize; j++) {
                currentTile = roomJsonData.game.map[`${i},${j}`];
                ctx.drawImage(GRASS_TEXTURE, i, j, 1, 1);

                if (currentTile.hasWood) {
                    ctx.drawImage(WOOD_TEXTURE, i + 0.25, j + (1 - 0.5 * WOOD_TEXTURE.height / WOOD_TEXTURE.width) / 2, 0.5, 0.5 * WOOD_TEXTURE.height / WOOD_TEXTURE.width);
                }
                if (currentTile.hasAmmo) {
                    ctx.drawImage(AMMO_TEXTURE, i + 0.45, j + (1 - 0.1 * AMMO_TEXTURE.height / AMMO_TEXTURE.width) / 2, 0.1, 0.1 * AMMO_TEXTURE.height / AMMO_TEXTURE.width);
                }
                if (currentTile.hasGun) {
                    ctx.drawImage(GUN_TEXTURE, i + 0.25, j + (1 - 0.5 * GUN_TEXTURE.height / GUN_TEXTURE.width) / 2, 0.5, 0.5 * GUN_TEXTURE.height / GUN_TEXTURE.width);
                }
            }
        }

        // Bullets
        let bulletList = roomJsonData.game.firedBullets;
        for (let i = 0; i < bulletList.length; i++) {
            let currentBullet = bulletList[i];
            switch (currentBullet.facing) {
                case "N":
                    ctx.drawImage(AMMO_TEXTURE, currentBullet.x + 0.35, currentBullet.y + (1 - 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width) / 2, 0.3, 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width);
                    break;
                case "W":
                    ctx.save();
                    ctx.translate(currentBullet.x + 0.5, currentBullet.y + 0.5);
                    ctx.rotate(- Math.PI / 2);
                    ctx.translate(- currentBullet.x - 0.5, - currentBullet.y - 0.5);

                    ctx.drawImage(AMMO_TEXTURE, currentBullet.x + 0.35, currentBullet.y + (1 - 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width) / 2, 0.3, 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width);
                    ctx.restore();
                    break;
                case "S":
                    ctx.save();
                    ctx.translate(currentBullet.x + 0.5, currentBullet.y + 0.5);
                    ctx.rotate(Math.PI);
                    ctx.translate(- currentBullet.x - 0.5, - currentBullet.y - 0.5);


                    ctx.drawImage(AMMO_TEXTURE, currentBullet.x + 0.35, currentBullet.y + (1 - 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width) / 2, 0.3, 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width);
                    ctx.restore();
                    break;
                case "E":
                    ctx.save();
                    ctx.translate(currentBullet.x + 0.5, currentBullet.y + 0.5);
                    ctx.rotate(Math.PI / 2);
                    ctx.translate(- currentBullet.x - 0.5, - currentBullet.y - 0.5);


                    ctx.drawImage(AMMO_TEXTURE, currentBullet.x + 0.35, currentBullet.y + (1 - 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width) / 2, 0.3, 0.3 * AMMO_TEXTURE.height / AMMO_TEXTURE.width);
                    ctx.restore();
                    break;
            }
        }

        // Players

        Object.entries(roomJsonData.game.status).forEach(item => {
            // Body
            ctx.fillStyle = (item[0] === socketId ? "rgb(20, 120, 255)" : "rgb(255, 20, 80)");
            ctx.beginPath();
            ctx.arc(item[1].x + 0.5, item[1].y + 0.5, 0.25, 0, 2 * Math.PI);
            ctx.fill();

            // Eyes
            ctx.fillStyle = "black";
            ctx.beginPath();
            switch (item[1].facing) {
                case "N":
                    ctx.arc(item[1].x + 0.42, item[1].y + 0.35, 0.03, 0, 2 * Math.PI);
                    ctx.arc(item[1].x + 0.58, item[1].y + 0.35, 0.03, 0, 2 * Math.PI);
                    break;
                case "S":
                    ctx.arc(item[1].x + 0.42, item[1].y + 0.65, 0.03, 0, 2 * Math.PI);
                    ctx.arc(item[1].x + 0.58, item[1].y + 0.65, 0.03, 0, 2 * Math.PI);
                    break;
                case "W":
                    ctx.arc(item[1].x + 0.35, item[1].y + 0.42, 0.03, 0, 2 * Math.PI);
                    ctx.arc(item[1].x + 0.35, item[1].y + 0.58, 0.03, 0, 2 * Math.PI);
                    break;
                case "E":
                    ctx.arc(item[1].x + 0.65, item[1].y + 0.42, 0.03, 0, 2 * Math.PI);
                    ctx.arc(item[1].x + 0.65, item[1].y + 0.58, 0.03, 0, 2 * Math.PI);
                    break;
            }
            ctx.fill();

            // Name
            ctx.fillStyle = "black";
            ctx.font = "0.25px 'Lexend', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(roomJsonData.usernames[item[0]], item[1].x + 0.5, item[1].y + 0.15, 1.5);
        });

        // Walls

        roomJsonData.game.walls.forEach(item => {
            // Each wall takes on the format [coord1x, coord1y, coord2x, coord2y]
            // where coord1x <= coord2x and coord1y <= coord2y

            let wallCoords = JSON.parse(item);

            // Wall is horizontal
            ctx.fillStyle = "#4E310B";
            ctx.beginPath()
            if (wallCoords[0] === wallCoords[2]) {
                ctx.rect(wallCoords[0] - 0.1, wallCoords[1] + 0.9, 1.2, 0.2);
            }
            else if (wallCoords[1] === wallCoords[3]) // Wall is vertical
            {
                ctx.rect(wallCoords[0] + 0.9, wallCoords[1] - 0.1, 0.2, 1.2);
            }
            ctx.closePath();
            ctx.fill();
        });

        // Storm

        ctx.globalAlpha = 0.4;
        for (let i = 0; i < roomJsonData.mapSize; i++) {
            for (let j = 0; j < roomJsonData.mapSize; j++) {
                // If the tile is in the storm, draw storm
                if (i < roomJsonData.game.stormDistance || i >= roomJsonData.mapSize - roomJsonData.game.stormDistance || j < roomJsonData.game.stormDistance || j >= roomJsonData.mapSize - roomJsonData.game.stormDistance) {
                    ctx.drawImage(STORM_TEXTURE, i, j, 1, 1);
                }
            }
        }
        ctx.globalAlpha = 1;
    }
});

// Handle game start

startButton.addEventListener("click", (ev) => {
    socket.emit("requestStartGame", roomCode, socketId);
    startButton.blur();
});

socket.on("startGame", () => {
    showScreen(-200);
});

// Handle game end

socket.on("endGame", (reason) => {
    console.log(reason);
    endScreenMessage1.innerText = reason;
    endScreenMessage2.innerText = reason;
    showScreen(-300);
    setTimeout(() => {
        document.querySelector(`body > div.window`).style.top = "0vh";
        setTimeout(() => {
            showScreen(-100);
        }, 5000);
    }, 5000);
});

socket.on("announceEndGame", (message) => {
    console.log(message);
    endScreenMessage1.innerText = message;
    endScreenMessage2.innerText = message;
    showScreen(0);
    setTimeout(() => {
        showScreen(-100);
    }, 10000);
});





// Handle key presses

window.addEventListener("keydown", (ev) => {
    ev.preventDefault();
    console.log(ev.code);
    console.log(roomInfo.inGame.includes(socketId));
    console.log(roomInfo.state === "Game");

    if (roomInfo.inGame.includes(socketId) && roomInfo.state === "Game") {
        let [oldX, oldY, heading] = [roomInfo.game.status[socketId].x, roomInfo.game.status[socketId].y, roomInfo.game.status[socketId].facing];
        switch (ev.code) {
            case "KeyW":
                socket.emit("move", oldX, oldY - 1, "N"); // Move Up
                break;
            case "KeyA":
                socket.emit("move", oldX - 1, oldY, "W"); // Move Left
                break;
            case "KeyS":
                socket.emit("move", oldX, oldY + 1, "S"); // Move Down
                break;
            case "KeyD":
                socket.emit("move", oldX + 1, oldY, "E"); // Move Right
                break;
            case "ArrowUp": // Face Up (North)
                socket.emit("turn", "N");
                break;
            case "ArrowLeft": // Face Left (West)
                socket.emit("turn", "W");
                break;
            case "ArrowDown": // Face Down (South)
                socket.emit("turn", "S");
                break;
            case "ArrowRight": // Face Right (East)
                socket.emit("turn", "E");
                break;
            case "Enter": // Skip Turn
                socket.emit("skip");
                break;
            case "Space": // Shoot
                socket.emit("shoot", oldX, oldY, heading);
                break;
            case "KeyB": // Build
                switch (heading) {
                    case "N":
                        socket.emit("build", oldX, oldY - 1, oldX, oldY);
                        break;
                    case "W":
                        socket.emit("build", oldX - 1, oldY, oldX, oldY);
                        break;
                    case "S":
                        socket.emit("build", oldX, oldY, oldX, oldY + 1);
                        break;
                    case "E":
                        socket.emit("build", oldX, oldY, oldX + 1, oldY);
                        break;
                }
                break;
        }
    }
});