# ForgetMeNote 

ForgetMeNote is a social media application 

Friends : User Can follow ,unfollow , unfriend,block,accept friends request and reject

Event: User can create event and according to visibility

Feed/Post: User can create post or feed and according to visibility

Like:user can like on post and event of other and self

Comment: user can comment on post and event of other and self

Group:user can create group with take his frieds

Split Group: user can create Split group with take his frieds

Chats : For this used socket IO:

Amazone Product : With the help of PA API  from the amazon:

Payment for split Group:

Wishlist:User can create his wishlist

Mute/Unmute:Group Admin  and individuals user can mute or unmute notification


User Details: Users can access and view detailed information about other users on the platform. This could include profiles with personal information, posts, followers, and other relevant user data.

----

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)).

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v20.0.8

    $ npm --version
    9.6.3

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $npm install -g npm@latest
    
Verify the update: After the installation is complete, you can verify that npm has been updated by checking its version. 
You can do this by running.

   $npm -v

## Install

    $ https://github.com/lemosys-server-team/Nebor-Discover-module.git
    $ cd discover
    $ npm install



## Running the project in dev mode

    $ npm start
    
## Running the project in prod mode

`$ pm2 start ./bin/www`

## Project Requirements

  Before you begin, ensure you meet the following project requirements:

- $ node --version : v19.9.0
- $ npm --version  : 9.6.3
- $ MySql --version  : 2.18.1,
- Mysql Database: You'll need PostgreSQL installed and configured. Database credentials can be found in the `.env` 
  file. And I have used these credentials in the `config/db` file,which you can see.
- Port: The server is configured to run on port 4000.

## Project Structure

The project follows a standard directory structure for a Node.js application:

- `app.js`: The main entry point of the application.
  - **Description**: `app.js` serves as the main entry point of your Node.js application. It typically handles the configuration of your Express.js application, including middleware setup, route definitions, and server initialization.
  - **Purpose**: This file is where you set up the core structure of your web application. It defines routes, middleware functions, and other configurations required to run your server. It's often the central hub for configuring and launching your application.

- `bin/www`: The script for starting the application.
  - **Description**: `bin/www` is a script that is responsible for starting the application's server. It usually creates an HTTP server using Node.js's built-in `http` or `https` module and listens for incoming requests.
  - **Purpose**: This script abstracts the server setup and allows you to encapsulate server-specific logic. It provides a convenient way to start and manage your application's server. It's commonly used to specify the port on which the server will listen and handle any necessary server-related configurations.

These two files work together to run your Node.js web application. `app.js` defines the core of your application, while `bin/www` is responsible for starting the server and handling server-related configurations.


## Troubleshooting Common Errors

During the development of this project, 
you may encounter some common errors. 
Below, we've listed a few of these errors and provided potential solutions:

1. **Error: `Cannot find module 'module-name'`**:
   - **Cause**: This error occurs when Node.js can't find a required module.
   - **Solution**: Ensure that you've installed all project dependencies using `npm install` or `yarn install`. 
                   Also, check for typos in the module name and the `require` statement.

   - Check Module Name and Path:
Ensure that the module name and path specified in the require statement are correct.
Verify that the module name is spelled correctly and matches the name of the installed package or the path to your custom module file.
Install Missing Dependencies:

If you're trying to require a third-party package, make sure you've installed it as a dependency in your project. You can do this by running:

`$ npm install module-name`

2. **Error: `Port already in use`**:
   - **Cause**: This error happens when the port you're trying to use is already in use by another process.
   - **Solution**: Either terminate the process using the port or choose a different port for your Node.js application. You can change the port in your server configuration (e.g., in `bin/www` or `app.js`).

3. **Error: `EADDRINUSE: address already in use`**:
   - **Cause**: Similar to the "Port already in use" error, this error indicates that the chosen port is already in use.
   - **Solution**: Change the port in your server configuration or find and terminate the process using the port.


