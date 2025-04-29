# Translating

All of projects parts use custom translation system.
It's based on key-value pairs and for better readability uses JSON format, which allows to nest keys.
You can add your own translations by creating new language in specific project.

## Key resolution

All dots (`.`) in the key are represented as nested keys in JSON.
For example, if i want to use `app.title`, the translation file should look like this:

```json
{
  "app": {
    "title": "My App"
  }
}
```

But something like this will also work:

```json
{
  "app.title": "My App"
}
```

## Adding new language

In all projects the translation system should be saved in `src/translation` folder.
There you can find `Translation.ts` where in `languages` you can add your own language.
You have to import the specified file from `src/translation/data` folder.
For `code` and `identifier` use the language code from [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) standard.

Then you can start translating.
Copy the `en.json` file and rename it to your language code.
Translate the keys and values and it's done.