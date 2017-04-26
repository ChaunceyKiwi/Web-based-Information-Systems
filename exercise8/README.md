# Version of Node.js 
* v6.9.4

# Requirements Checklist
## Auth

* Finished - There is a /login page which, when submitting the form and the authentication is successful, responds with a 301, a Location header redirecting to /playlists and Set-Cookie header containing a session cookie if the username and password are valid (but if using AJAX, respond with a 200, and programmatically redirect to /playlists yourself), or a 401 if the username and password if the username and password are invalid. It must work with the username and passwords mentioned earlier. (2 marks)

* Finished - Users and permissions are setup in populateDb.js. (2 marks)

* Finished - Respond with 403 if user does not have permission to the playlist specified for APIs PUT /api/playlists/:id or POST /api/playlists/:id and DELETE /api/playlists/:id. (1 marks)

* Finished - GET /api/playlists only shows the playlists the user has permissions to see. (2 marks)

* Finished - A modal that allows you to add users to playlists. (1 mark)

* Finished - A GET /api/users that lists all the users in the system. (1 mark)

* Finished - A POST /api/playlists/:id/users for adding users to playlists. (1 mark)

* Finished - Redirect to /login if attempting to navigate to /, /playlists, /library, or /search when not authenticated (2 marks)

* Finished - Passwords are hashed using bcrypt. (1 mark)

## Real Time

* Finished - When one user is viewing a playlist, and another user adds a song to a playlist, that song must show up in the UI immediately. (3 marks)

* Finished - When one user is viewing a playlist, and another user deletes a song from that playlist, that song must disappear from the UI immediately. (3 marks)

* Finished - Requests doing real-time are authorized. (1 marks)

## Bonus

* Finished - Newly created playlists get added to Users_Playlists so that the user has permissions to edit that playlist.