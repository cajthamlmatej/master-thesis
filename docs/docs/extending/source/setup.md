# Setup

You can setup your own local development environment to test the application and your changes.

There are two main ways to run the application:

- **Docker**: This is the recommended way to run the application. It uses Docker Compose to run the application in a containerized environment.
- **Local**: You setup different services locally and run the application in your local environment. You need to correctly setup the environment variables and connections for the application to run.

## Environment variables

Enviroment variables for the project as whole are in root folder of the project in `.env` file.
These variables changes the domain names and ports of the application.

You need to setup special environment variables for server. Here is example of `.env` (which you need to create in server folder) file for server:

```bash
## DATABASE
DATABASE_URL="<setup manually or will be provided by docker-compose>"

## AUTHENTICATION
SALT_ROUNDS=15
JWT_SECRET=""

## SMTP
SMTP_HOST=""
SMTP_PORT=465
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="Materalist"

## FRONTEND
FRONTEND_DOMAIN="<http://localhost:5173/ or will be provided by docker-compose>"
FRONTEND_DOMAIN_AUTHENTICATION="en/authentication"
FRONTEND_DOMAIN_AUTHENTICATION_VALIDATE="en/authentication/activate/{{token}}"
FRONTEND_DOMAIN_PLAYER="en/player"
```


## Docker

### Prerequisites

You need to have the following installed on your machine:
- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 1.29.2 or higher)
- [Git](https://git-scm.com/downloads) (optional, but recommended)


### Running, uploading and using the application

For uploading and just using the application you dont have to do much.

1. **Clone the repository**: run command `git clone <url-of-repo>` to clone the repository to your local machine. You can also download the repository as a zip file and extract it to your local machine.
2. **Start the docker containers**: run command `docker-compose up -d` to start the docker containers. This will start the application in the background.
3. **Access the application**: if everything went well, you can access following URLs in your browser:
    - [http://localhost:4000](http://localhost:4000) - the application (frontend)
    - [http://localhost:4001](http://localhost:4001) - the homepage
    - [http://localhost:4002](http://localhost:4002) - the documentation
    - [http://localhost:4003](http://localhost:4003) - the server (backend)

:::warning

Thumbnail generation doesnt work in local dev mode, only in production mode (uploaded to real domain).

:::

### Uploading the application

If you want to upload the application to a real domain, you need to do the following:

1. **Move the application to a server**: you can use any server that supports Docker and Docker Compose. You can use a VPS, a cloud server, or a local server. Make sure you have access to the server and can run Docker commands on it. Follow the instructions above.
2. **Change the environment variables**: you need to change the environment variables in the `.env` file to match your server configuration - on what domains all things will be running.
3. **Setup reverse proxy**: you need to setup a reverse proxy to route the requests to the correct containers. You can use Nginx or Traefik for this.  You need to change the domain names to match your server configuration.
4. **Rebuild the containers**: run command `docker-compose up -d --build` to rebuild the containers with the new environment variables. This will start the application in the background.
5. **Access the app**: you can access the application using the domain names you configured in the reverse proxy.

### Local development with Docker

If you want to run the application locally with Docker, you can do the following:

1. **Clone the repository**: run command `git clone <url-of-repo>` to clone the repository to your local machine. You can also download the repository as a zip file and extract it to your local machine.
2. **Start the docker containers**: run command `docker-compose -f docker-compose.dev.yml up -d` to start the docker containers. This will start the application in the background. **Make sure its the dev version of docker-compose file.**
3. **Access the application**: if everything went well, you can access following URLs in your browser:
    - [http://localhost:4000](http://localhost:4000) - the application (frontend)
    - [http://localhost:4001](http://localhost:4001) - the homepage
    - [http://localhost:4002](http://localhost:4002) - the documentation
    - [http://localhost:4003](http://localhost:4003) - the server (backend)

## Local

### Prerequisites

You need to have the following installed on your machine:

- [Node.js](https://nodejs.org/en/download/) (version 16 or higher)
- [npm](https://www.npmjs.com/get-npm) (version 8 or higher)

You need to have a database running locally.
You need to setup it by yourself or use something like [MongoDB Atlas](https://www.mongodb.com/atlas/database).

### Installing dependencies

You need to install the dependencies for the project. You can do this by running the following command in every folder (client,s erver, docs, homepage) of the project:

```bash
npm install
```

### Running the application

You can run the application locally by running every project in its own folder.

#### Client

You can run the client by running the following command in the `client` folder:

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

#### Server

You can run the server by running the following command in the `server` folder:

```bash
npm run start
```

The server will be available at [http://localhost:2020](http://localhost:2020).

#### Homepage

You can run the homepage by running the following command in the `homepage` folder:

```bash
npm run dev
```

The homepage will be available at [http://localhost:4021](http://localhost:4021).

#### Documentation

You can run the documentation by running the following command in the `docs` folder:

```bash
npm run start
```

The documentation will be available at [http://localhost:3000](http://localhost:3000).