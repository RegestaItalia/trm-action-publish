# @esm2cjs/normalize-url

This is a fork of https://github.com/sindresorhus/normalize-url, but automatically patched to support ESM **and** CommonJS, unlike the original repository.

## Install

You can use an npm alias to install this package under the original name:

```
npm i normalize-url@npm:@esm2cjs/normalize-url
```

```jsonc
// package.json
"dependencies": {
    "normalize-url": "npm:@esm2cjs/normalize-url"
}
```

but `npm` might dedupe this incorrectly when other packages depend on the replaced package. If you can, prefer using the scoped package directly:

```
npm i @esm2cjs/normalize-url
```

```jsonc
// package.json
"dependencies": {
    "@esm2cjs/normalize-url": "^ver.si.on"
}
```

## Usage

```js
// Using ESM import syntax
import normalizeUrl from "@esm2cjs/normalize-url";

// Using CommonJS require()
const normalizeUrl = require("@esm2cjs/normalize-url").default;
```

> **Note:**
> Because the original module uses `export default`, you need to append `.default` to the `require()` call.

For more details, please see the original [repository](https://github.com/sindresorhus/normalize-url).

## Sponsoring

To support my efforts in maintaining the ESM/CommonJS hybrid, please sponsor [here](https://github.com/sponsors/AlCalzone).

To support the original author of the module, please sponsor [here](https://github.com/sindresorhus/normalize-url).
