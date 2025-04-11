# API

This section describes available API methods for plugins.
Specific code for specific area is not covered here, but rather in the respective sections.
See the [Editor API](./editor/api) for the editor API.
See the [Plugin API](./player/api) for the plugin API.

The following API are available for all plugins in all contexts.
You can find all API and their documentation in the [Types](pathname:///files/types.d.ts).

All API are available in the `api` object which is injected by the code runner (see [Security](./security) for more details).

## `log`

**Signature**: `log(message: string): void`

Log a message to the console. This is useful for debugging and development purposes.

**Arguments**:
- `message` (string): The message to log.

**Example**:
```javascript
api.log('Hello, world!');
```

This will log "Hello, world!" to the console.

## `fetch`

**Signature**: `fetch(url: string, options?: { method?: string, headers?: { [key: string]: string }, body?: string }): Promise<string>`

Fetch a resource from the given URL. This is useful for loading external resources such as images, scripts, or data files.
To be able to call this function on specific origin, you need to add the origin to the `allowedOrigins` in the plugin manifest. 
See [Plugin Manifest](./manifest) for more details.

**Arguments**:
- `url` (string): The URL of the resource to fetch.
- `options` (object, optional): An object containing options for the fetch request.
    - `method` (string, optional): The HTTP method to use (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`). Defaults to `GET`.
    - `headers` (object, optional): An object containing custom headers to include in the request. Key-value pairs of header names and values, both as strings.
    - `body` (string, optional): The body of the request. Does not work with `GET` requests.

**Returns**: A promise that resolves to the response body as a string.
You can use [`JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) to parse the response body as JSON.

**Example**:
```javascript
const loadConversionRates = () => {
    const URL = `https://www.cnb.cz/cs/financni-trhy/devizovy-trh/kurzy-devizoveho-trhu/kurzy-devizoveho-trhu/denni_kurz.txt`;

    const response = await api.fetch(URL, {
        method: 'GET'
    });

    const lines = response.split('\n').slice(2, -1);
    const rates = lines.map(line => {
        const [currency, rate] = line.split('|').slice(1, 3);
        return { currency, rate };
    });

    return rates;
};
```

## `language`

**Signature**: `language: string`

The current language of the editor. This is useful for localization and internationalization purposes.
You can use this to determine the current language and adjust your plugin's behavior accordingly.

Current languages are:
- `en` - English
- `cs` - Czech

**Example**:
```javascript
console.log(`Current language: ${api.language}`);
```

## `plugin`

**Signature**: `plugin: string`

The identifier of the plugin. This is useful for identifying the plugin in the editor and for debugging purposes.

**Example**:
```javascript
console.log(`Plugin identifier: ${api.plugin}`);
```

## `cache`

Object for caching API.
All saved values are stored temporarily in memory and are not persistent across sessions and sometimes not even across any two calls of the plugin.
This is useful for caching data that is expensive to fetch or compute, such as API responses or complex calculations.

### `cache.get`

**Signature**: `cache.get(key: string): string | null`

Access a value from the cache. If the key does not exist, it returns `null`.

**Example**:
```javascript
const value = api.cache.get('myKey');
if (value) {
    console.log(`Value from cache: ${value}`);
} else {
    console.log('Key does not exist in cache.');
}
```

### `cache.set`

**Signature**: `cache.set(key: string, value: string): void`

Cache a value with the given key. If the key already exists, it will be overwritten.

***Example**:
```javascript
const value = 'myValue';
api.cache.set('myKey', value);
console.log(`Value cached: ${value}`);

const cachedValue = api.cache.get('myKey');
if (cachedValue) {
    console.log(`Cached value: ${cachedValue}`);
} else {
    console.log('Key does not exist in cache.');
}
```

### `cache.remove`

**Signature**: `cache.remove(key: string): void`

Remove a value from the cache. If the key does not exist, nothing happens.

**Example**:
```javascript
const value = 'myValue';
api.cache.set('myKey', value);
console.log(`Value cached: ${api.cache.get('myKey')}`);

api.cache.remove('myKey');
console.log(`Value after removal: ${api.cache.get('myKey')}`);
```