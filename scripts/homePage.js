// Initializing Socket.io client
const socket = io("/");
let socketId;

// Getting a reference to the inputs and buttons

/// Join Room

const [roomCodeInput, roomJoinUsername, roomJoinButton] = ["roomCode", "usernameRoomJoin", "roomJoinButton"].map(item => document.getElementById(item));

roomJoinUsername.value = localStorage.getItem("username") || null;

/// Create Room

const [roomCreateUsername, roomName, roomCreateButton] = ["usernameRoomCreate", "roomName", "roomCreateButton"].map(item => document.getElementById(item));

roomCreateUsername.value = localStorage.getItem("username") || null;

// Checking to see if there is a socket id stored in session storage
/*console.log(localStorage.getItem("socketId"));
if(typeof localStorage.getItem("socketId") !== "undefined" && localStorage.getItem("socketId") != null)
{
    // User has previous socket id, use this socket id
    socketId = localStorage.getItem("socketId");
    socket.emit("setSocketId", localStorage.getItem("socketId"));
}
else
{
    // User does not have previous socket id, get a new one
    socket.emit("getSocketId");
}

// Handle socket id return
socket.on("sendSocketId", (newSocketId) => {
    console.log(newSocketId);
    socketId = newSocketId;
    localStorage.setItem("socketId", newSocketId);
});*/

// Handle room join and room create

roomJoinButton.addEventListener("click", _=>{
    console.log(`Room Code: ${roomCodeInput.value}, Name: ${roomJoinUsername.value}`);
    localStorage.setItem("username", roomJoinUsername.value || localStorage.getItem("username") || "Player");
    window.location.href = `/rooms/${roomCodeInput.value}`;
});

roomCreateButton.addEventListener("click", _=>{
    console.log(`Name: ${roomCreateUsername.value}`);
    localStorage.setItem("username", roomCreateUsername.value || localStorage.getItem("username") || "Player");
    socket.emit("createRoom", roomName.value || "New Room", +mapSize.value || 10);
})

socket.on("redirectToRoom", (roomCode) => {
    window.location.href = `/rooms/${roomCode}`;
});