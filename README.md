# order management app in nodejs

This is CRUD app built using nodejs + express + handlebars + mongodb. 

Sendgird for emails - https://www.npmjs.com/package/@sendgrid/mail

AWS S3 for file storage - https://www.npmjs.com/package/aws-sdk

There are three personas.

* Admin 
  * Add, edit, and delete menu as well as items in a menu
  * See list of pending orders, and mark them as delivered
  * Manage users - add/remove billing clerks

* Billing Clerk
  * See list of pending orders, and mark them as delivered
  * Create orders for walk-in cusotmers

* Customer
  * See menu and add items to cart
  * See shopping cart summary and then place order
  * See order status, as well as a history of all their past orders


# Setup

## Requirements

* Node v12.0 or higher (Latest LTS: https://nodejs.org/en/)
* Mongo DB community edition (https://www.mongodb.com/try/download/community)

## Common Setup

Clone the repository and install the dependancies 


    git clone https://github.com/vaishnav-thirumoorthy/order-management-nodejs.git

    cd order-management-nodejs

    npm install

## Setup and start MongoDB(dev environment)

This will be required only for dev environment/local testing. Download MongoDB and unzip the contents. Create a new folder next to it called mongobd-data (or any other name). This folder will contain all the data stored in the db

MongoDB local server has to be started before initialising connection from the app. Open terminal and run the following command to start mongodb server

    <path>/bin/mongod --dbpath=<data_folder_path>

The first `<path>` is the path to the unzipped mongodb community edition folder. `<data_folder_path>` is the path to the folder that was created. Replace path with their respective path values

If the mongodb server folder is placed in /Users/<yourusername> directory and if the new folder is created as `mongodb-data`, then the command will look 

    /Users/<yourusername>/<mongodb_server_folder>/bin/mongod --dbpath=/Users/<yourusername>/mongodb-data

## Set env variables

The port and DB connection URI are to be defined in a .env file. Make sure `dotenv` package is installed. If not, install it globally using 

    npm install -g dotenv

Create a .env file in the root folder and set the port and DB connection URL

    PORT = 3000 (or any port only for local)
    DOMAIN = http://localhost:3000 (only for local testing)
    DB_URI = mongodb://127.0.0.1:27017/<db_name> (enter any name for the database instead of <db_name>. Your database will be created with this name)

In case of deploying this application to heroku, mongo db has to be deployed separately since heroku as deprecated 'mlab'.
In such cases, create a Mongo DB cluster using Atlas (https://www.mongodb.com/cloud/atlas) and set the DB_URI connection string accordingly.

Other env variables to be configured

    SENDGRID_API_KEY = SG.xxxxxxxxxxxxxxxx
    FROM_EMAIL = email configured in sendgrid
    DOMAIN = host value after application is deployed (in case of heroku https://x.herokuapp.com - x is the host)
    AWS_SECRET_ACCESS_KEY = xxxxxxxxxxxxxxxxx
    AWS_ACCESS_KEY_ID = xxxxxxxxxxxxx
    AWS_BUCKET = bucket-name (where the objects are to be pushed)
    AWS_REGION = region
    DEFAULT_IMAGE_S3 = object url of an image from the configured bucket (this is to serve as a static/placeholder image)



When the app is run for the first time, an administrator will be created automatically. Check `Utils > initialize.js` for the admin credentials.

Once db path and db name are set and the db server is started, open another terminal and navigate to the project's root folder

    cd order-management-nodejs

Start the app

    npm run start
   
If the app should be opened in development mode (with hot relaod), use

    npm run dev
    
This will run the app with nodemon. If nodemon is not installed, install it globally using 

    npm install -g nodemon 
    
Once the app is started, mongodb connection will be established and a log statement `MongoDB Connected` will be printed to the console.

The app will be accessible in `http://localhost:PORT/` where the PORT number is set in the .env file

# REST API

REST APIs are available for Agents, Menu and Menu Item entities. 

APIs require Authorization and auth type is basic (Username(email address) and password).

API documentation is available here - https://documenter.getpostman.com/view/14930696/TzCS5RGX
