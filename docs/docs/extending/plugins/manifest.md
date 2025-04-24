# Manifest

Manifest is a JSON file that describes the plugin and its capabilities. It is used by the plugin manager to load and manage plugins.
It exists to define what the specific plugin release can do and what it can access.

Some capabilities are marked as critical and for user to be able to use the plugin, they must be granted access to those capabilities.

## Fields

### `manifest`

The current version of the manifest is `1`.
In future the version will be different and this documentation will be updated accordingly.
Has to be a number.

### `allowedOrigins` (critical)

A list of allowed origins for the plugin. 
This is used to restrict access to the plugin from other origins.
This is checked in [Fetch API](./api#fetch).
Has to be a list of strings, where the string is valid origin.
Valid origin is a string that starts with `http://` or `https://` and ends with a valid domain name.

## Example

```json
{
  "manifest": 1,
  "allowedOrigins": [
    "http://localhost:3000",
    "https://example.com"
  ]
}
```