# Security

Security in Materalist is a multi-faceted topic. This document will cover the basics of security.
The main things to consider is that we can't trust your code. We can't trust your plugins. We can't trust your data. We can't trust your users.

We have to assume that everything is untrusted. This means that we have to be careful about what we allow to run in the browser where the user's sensitive data is.

All plugins are installed with user's consent and by their own choice.
Even with that, we have to limit what the plugins can do.

The first defense against untrusted code is to run it in a separate process.
We do it in several ways.
The [Philosophy](philosophy.md) of Materalist's plugins is to run them in a browser.
Because plugins are just pieces of JavaScript code we took the approach of running them in a separate context.

## Running untrusted code

We use a [WebAssembly](https://webassembly.org/) sandbox to run the plugins in a separate view that theoretically can't access anything outside of allocated memory.
Using this approach forced us to think about how we expose the API to the plugins.
We overall decided to use JavaScript and bind the API to the WebAssembly context.
So we can easily define the API and expose it to the plugins.
The main communication is done with safe messages that are passed between the main process and the plugin process.
For this we use [emscripten](https://emscripten.org/) to compile the code to WebAssembly and expose the API to the plugins.

If the API doesn't expose anything sensitive, then the plugins can't do anything bad.
Using this we can also limit to what Browser APIs the plugins can access and what they can do with them.
Because the code from WebAssembly is running in a separate context, the calculation is done in a separate thread and the main thread is not blocked.
Thus the application is always responsive and the plugins can do their own thing.

For all available API, consult the [API documentation](api.md).

## Iframe sandboxing

Some plugins may need to show some UI for the user.
We tought about creating a separate API for creating some binding but we decided to not use any custom rendering engine and use the browser's own rendering engine - HTML and CSS.

The major browser engines are very good at rendering HTML and CSS and also very good at security.
In web browsers, you can run untrusted code in a sandboxed iframe.
They are separated from the main page and can't access anything outside of the iframe.
The only thing that can be accessed is the postMessage API.
Which can be used to communicate between the main page and the iframe.

The code then can access all the browser APIs and the DOM.
One major downfall is that this approach has problems with CORS and the same-origin policy.
Defaultly the iframe has `null` origin.
Which is not a problem for majority of the plugins.

For example we use this approach for the [Editor panel](editor/panel.md) or for [Custom blocks](editor/custom-blocks.md).