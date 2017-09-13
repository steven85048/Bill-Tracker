# Bill-Tracker

Application to increase the ease in which the most recently proposed and updated bills can be accessed by the public, allowing the user to select bills to add to their profile to receive a notification when the bill is updated.

The backend is built with ExpressJS, which includes a scheduler that receives the most recently updated bills from the Propublica API and various RESTful endpoints that handles various user operations, including login and bill adding.
In addition, a socket.io connection is created every time a user has a session with the server, guaranteeing that a tracked bill updates in real time as bills are updated in the backend. Updated and new bills are stored in MongoDB.

TO RUN:
** The database connection and API Keys are removed for security purposes, so add them in if necessary **
(a) Download NodeJS if you haven't done that already
(b) cd to the root path with the index.js
(c) npm install - to download necessary dependencies
(d) node index.js - to start server on local machine
(e) localhost:8080/browse - to route to first page


== A globally accessible version can be accessed at: https://blooming-sierra-11165.herokuapp.com/ ==
