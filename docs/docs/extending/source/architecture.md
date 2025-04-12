# Architecture

The project is split into several different parts (also projects) and each of them has its own architecture.
This document will describe the architecture of each part and how they are connected to each other.

## Homepage

The homepage is a simple static website for promoting the project.
It communicates with [Server](#server) to get the example materials.
It's build with [Vue.js](https://vuejs.org/) and [Vite](https://vitejs.dev/).

You can extend the homepage by adding [new language](./adding-language.md) or changing the content.

## Documentation

The documentation (this website) is a static website for documenting the project.
It doesn't communicate with any other part of the project.
It's build with [Docusaurus](https://docusaurus.io/).

You can extend the documentation by adding your own pages or sections in the code.

## Server

The server is a backend application for the Materalist.
It communicates with the database and provides an API for the client.
It also manages the WebSocket connection for the editor and player for collaborative editing and interactive materials.

The server is written in [NestJS](https://nestjs.com/) and uses [mongoose](https://mongoosejs.com/) for the database connection.
It uses [MongoDB](https://www.mongodb.com/) as the database.

The server is responsible for managing the materials, users, and their permissions.
It also provides the API for the client to export the materials.

For more information about extending the server, see [Extending the server](./server.md).

## Client

The client is a web application for using the Materalist.
It communicates with [Server](#server) to get all the data.

The application is primarily accessed after authentication.
But accessing a material when someone else shared it with you is also possible.

It is written in [Vue.js](https://vuejs.org/) and [Vite](https://vitejs.dev/).
The main part of the application is its editor and player for the materials.
The editor has complex rendering and allows to make the materials interactive.

For more information about extending the client, see [Extending the client](./client.md).