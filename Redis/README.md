# BasketScore Chat App 

This repository contains code for a BsketScore chat application built using the following web technologies:

- [Redis](https://redis.io/)
- [Node.js](https://nodejs.org/en/)
- [Express.js](http://expressjs.com/)
- [Socket.IO](http://socket.io/)

## Setting up database

Before running the application, you need to get database ready. To do that follow next steps:

- First you need to start redis server on a local PC. 

- Second, open Redis client in CMD on a local PC and execute next set of commands:

```
lpush games "Zvezda-vs-Partizan" "OKKJunior-vs-OKKonstantin" "Radnicki-vs-Megalex" "Paok-vs-Real"
```
```
set score-left 0
```
```
set score-right 0
```

## Starting the application

ONLY ON INITIAL START: Navigate to the folder and run:

```
npm install
```

To start the server, run:

```
npm start
```

The server should start at port 8080 (default). Navigate to (http://localhost:8080).


## Updating database

As an administrator of database, you should do 3 things:

- *Finish live game and start next game in line* 

To do that use command:
```
lpop games 
```

- *Add new upcoming game* 

To do that use command:
```
rpush games "team1-vs-team2"  
```
...where "team1" and "team2" are optional names of basketball teams.

- *Change the score of live game in realtime* 

To increase the score of the team on the left use command :
```
incrby score_left n
```

To increase the score of the team on the right use command :
```
incrby score_right n

```
...where "n" is the number of points, and it is up to you to choose it.
