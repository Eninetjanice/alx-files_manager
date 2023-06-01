# 0x04. Files manager

This project is a summary of our back-end trimester as ALX Software Engineering students: authentication, NodeJS, MongoDB, Redis, pagination and background processing.

## Objectives
The objective is to build a simple platform to upload and view files:

- User authentication via a token
- List all files
- Upload a new file
- Change permission of a file
- View a file
- Generate thumbnails for images

Of course, this kind of service already exists in the real life - it’s a learning purpose to assemble each piece and build a full product.

<center><h3>Repository Contents by Project Task</h3> </center>

## Tools
The following tools were used for the project.
- MongoDB
- NodeJs
- ExpressJs
- Redis
- Kue

## Setup
To set up the project, 
### Step 1: Clone the Repository 
```
git clone https://github.com/EninetJanice/alx-files_manager.git
```
### Step 2: Navigate to the Repository
```
cd alx-files_manager/
```
### Step 3: Download the dependencies
Once you have the **package.json** ready, run:
```
npm install
```
### Step 4: Start up your redis server
```
redis-server &
```
### Step 5: Ensure your redis is listening on the default port
```
redis-cli ping
```
### Step 6: Start up your Node server
```
npm run start-server

| Tasks | Files | Description |
| ----- | ----- | ------ |
| 0: Authors/README File | [AUTHORS](https://github.com/Eninetjanice/alx-files_manager/blob/master/AUTHORS) | Project authors |
| 1: utils/redis.js | [Redis utils](https://github.com/Eninetjanice/alx-files_manager/blob/master/utils/redis.js)
