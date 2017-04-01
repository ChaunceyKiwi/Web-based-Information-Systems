## Usage
npm install && node populate.js && npm start

## API
* POST /api/room
	* request a new room
	* res: 200, {location: <path to the new room, e.g. ”/room/41532”>, roomId}
	* res: 401 (“user should set a nickname first”)

* POST /createUser (set-Cookie will be disable with an ‘api’ prefix)
	* add a new username {username: \<USERNAME\>}
	* res: 200, {userId, members}
	* res: 403 (“occupied username”)

* GET /room/:roomId
	* go into a room
	* res: 200 { roomId, members }
	* res: 401 (“user should set a nickname first”)
	* socket.io: server --”addUserToRoom”--> client { userId, roomId}

* DELETE /room/exit
	* user exits the room it is in
	* res: 200 {members} (return members in the game center)
	* socket.io: server --”deleteUserFromRoom”--> client  { userId, roomId}

* POST /api/chat
	* {message: <message content>}
	* socket.io:server --”addMessageToRoom”--> client { username, roomId, message}


## TODO-List:

1. Store the host information in database or solve it in an alternative way (to decide who to draw and who to guess)
2. Replace sqlite with mySQL
