# Philosophy

This document will cover the basics of plugins and how they work in Materalist.
For security, see the [Security document](./security).

Plugins are a way to extend the functionality of Materalist and add new features to it.
They are a way to customize the application and make it your own.

The plugins are separated from the codebase and are loaded at runtime.
This means that you can add new features to Materalist without modifying the codebase.

In Materalist a plugin is a piece of external code that can be loaded into the application and used to extend its functionality.
One plugin can have multiple releases, which are different versions of the same plugin.

Users can load plugins from the plugin store and use them in their materials.
The installed plugin is always linked to the release version that was installed.

## Why are plugins a thing?

We wanted to create a application that will last for a long time and be extensible.
We want the user (teachers, students and other users) to be able to grow the application and add new features to it by themselves.
Teaching and other areas of life are changing and we want to be able to adapt to those changes.
Some users may not want to create interactive materials, but they would like to have some better way of creating graphs or other things.
And they can do that by creating a plugin for it.

We were also sceptical about the idea what harm could a plugin do to the application.
The side of security is addressed in the [Security document](./security).

The following chapters will cover what we vision as a good plugin and what we think is a bad plugin.

## What plugins can do

We support that the plugins can do following things:

- Create new types of blocks (see [Custom blocks](./editor/custom-blocks)) which can be used in the editor and in the player. For example a new diagram, a new type of quiz, a new type of text, etc.
- Make life of the user easier by adding new features and tools to the editor, which can make the process of creating materials faster and or productive. For example a new way of positioning of blocks, repeated actions and more.
- Creating interactive things in the player. For example a new way of displaying the material, going through the material and more.
- Creating a new way of importing and exporting materials. For example importing materials to and from other applications, formats and more.

## What plugins can't do

We don't vision and probably won't support the following things:

- Changing the way of the editor. The editor is a very complex piece of software and we don't want to change the way it works. We want to keep it as simple as possible and we don't want to add more complexity to it.
- Changing design of the application, editor or player. This could lead to a very bad user experience and we don't want to do that. 
- Making a graphical editor. Materalist was not made for doing design.
- Making a studying information system. We don't want to store any personal data of the users and we don't want to be responsible for that.
- Making a testing system. Teaching is not about testing.