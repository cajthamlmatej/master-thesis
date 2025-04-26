# Client

You can extend the client by adding new features or changing the existing ones.
Primarily you can add new plugin API, interactivity properties or new actions.

## Structure

The client is a Vue.js application and has a standard structure.
Editor and player component, which is not rendered by Vue.js, is located in `src/editor`.

## Debugging

In player you can debug the interactivity properties, variables and plugins by adding a query parameter `?debug=true` or `&debug=true` to the URL.