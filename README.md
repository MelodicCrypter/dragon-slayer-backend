# Clean REST API | Node App #

Below are all the endpoints of this application and the technologies used in building the application.
For this use-case, the app enables a user to create, edit, retrieve, or even delete a verse.
But this REST API can be used in any type of application. From to-do's to notes, etc.

### Tech Stack ###
- NodeJS
- Bcrypt
- JWT
- MongoDB & Mongoose
- CORS
- HPP
- Helmet
- Hapi/JOI
- Lodash
- NodeMailer

<br>

### Public Endpoints ###
##### *No authentication at all* #####

 - /user => registering a user
 - /verify => verifying user's account using verifyToken
 - /login => the login process, responsible for authToken and refreshToken
 - /reset/request => for requesting a reset link and resetToken
 - /reset => when the user resets his/her password

### Semi-Public Endpoints ###
##### *No authentication but refresh token is required* #####

 - /token => request for new authToken using refreshToken
 - /logout => logs out the user using refreshToken


### Private or Protected Endpoints ###
##### *Authentication is required* #####

 - /add => add a verse or text
 - /verses => get all verses or texts
 - /verse/:id => GET gets specific verse or text
 - /verse/:id => PATCH updates specific verse or text
 - /verse/:id => DELETE deletes specific verse or text
 - /user/me => user's info or profile

<br>

### You can use this to quickly start your own API server ###
- just create a MongoDB database then hook it up here
- create your own .env files for all the tokens and email configs
- then just decide what kind of application you're going to build, for this use-case I created an API for bible verses
