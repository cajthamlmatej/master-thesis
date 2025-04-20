# Remote communication

When the material is presented and [shared with other](../../../usage/player/watching) the player blocks can communicate across the platform.
Result of it is a way to share data with the presenter which can send more information to others.

:::warning
Remote communication works just in the player mode.
:::

## Introduction

The communication is always made by one block with specified ID and shared across the same block in remote players.
The presenter can accept communication only if it is loaded on the current presented slide. 
When on other slide it will not recieve any message.

The server is just a way to manage the realtime communication.
The real "managing" of messages happens on the presenters web app.
The block on presenter slide can decide if its valid message, if it should be send to other and more. 

## Directions

There are just two ways the block can communicate and they are decided by the role of player in the current player.

**Presenter:**

Block in the slide of presenter can just send message to **all other connected viewers**.

In practice this means that the block decides if the message is valid and sends it to all others.
This can be used in advance to store other users choices and reveal them at the same time (for quizzes and more).

**Viewer:**

Block in the slide of viewer can just send message to the **presenter**.

## Content

The messages are simple string values.
The presenter also recieves ID of the socket of the user which sent the message, so it can store it.

## Usage

How to use remote communication in Materalist.

### Block in source

Any block can call a method `sendMessage` which sends a message to the presenter or to all other viewers depending on the role of the player.

Any block can recieve a message and react to it using `@BlockEventListener(BlockEvent.MESSAGE)` decorator.

It is a good practice to wait with block rendering until the player is ready and connected to the server.
This is how to do it:

```typescript
override render(): HTMLElement {
    const element = document.createElement("div");

    // ...

    (async () => {
        if(!(await this.isInPlayerRoom())) {
            return; // The block is not in the player room or something went wrong.
        }

        this.initialize(); // A method that will initialize the block.
    })()

    return element;
}
```

### Custom block using plugins

Plugin can listen to a event `pluginRemoteMessage` which is called when a message is sent to the plugin block.
Then the plugin can react to it (and read its state using `isPresenter` method).

The plugin can send message to other blocks using `sendRemoteMessage` method on specific block.

The plugin can communicate with its block using its `sendMessage` method.