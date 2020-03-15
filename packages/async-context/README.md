# @unional/async-context

[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][downloads-url]
[![Bundle size][bundlephobia-image]][bundlephobia-url]

[![Codecov][codecov-image]][codecov-url]
[![Codacy Grade Badge][codacy-grade]][codacy-grade-url]
[![Codacy Coverage Badge][codacy-coverage]][codacy-coverage-url]

Secure, type safe, asynchronous context for functional programming.

It is common to pass in a context object containing dependencies used by the function.
In some cases, the dependencies need to be loaded asynchronously. For example,

- code is imported and loaded dynamically
- some async work needs to be done before the dependency is available
- need to wait for user configuration

When your code is invoked by other code where you cannot control its timing,
you need a mechanism to wait for the dependencies.

## Installation

```sh
npm install @unional/async-context
# or
yarn add @unional/async-context
```

## Usage

```ts
import { AsyncContext } from '@unional/async-context'

const context = new AsyncContext({ config: 'async value' })
const context = new AsyncContext(Promise.resolve({ config: 'async value' }))
const context = new AsyncContext(() => ({ config: 'async value' }))
const context = new AsyncContext(async () => ({ config: 'async value' }))

await context.get() // => { config: 'async value' }
```

The handler is not executed until the first `context.get()` is called.

### Initialze

You can create an `AsyncContext` and initialize it later.

```ts
import { AsyncContext } from '@unional/async-context'

export const context = new AsyncContext<{ key: string }>()

// in another file
import { context } from './context'

context.initialize({ key: 'secret key' })
context.initialize(Promise.resolve({ key: 'secret key' }))
context.initialize(() => ({ key: 'secret key' }))
context.initialize(() => Promise.resolve({ key: 'secret key' }))
```

The handler is not executed until the first `context.get()` is called.

You can either initialize the context in the constructor,
or by calling `initialize()` once.
This prevents the context to be modified.

Note that the data it contains are not frozen.
If you want to protect them from tampering,
use an immutable library such as [`immutable`](https://immutable-js.github.io/immutable-js/).

### Extend

You can extends a new context with new or replaced properties.

```ts
import { AsyncContext } from '@unional/async-context'

const ctx = new AsyncContext({ a: 1, b: 'b' })

const newCtx = ctx.extend({ b: 2, c: 3 })
const newCtx = ctx.extend(Promise.resolve({ b: 2, c: 3 }))
const newCtx = ctx.extend(() => ({ b: 2, c: 3 }))
const newCtx = ctx.extend(async () => ({ b: 2, c: 3 }))

await newCtx.get() // => { a: 1, b: 2, c: 3 }
```

[bundlephobia-image]: https://img.shields.io/bundlephobia/minzip/@unional/async-context.svg
[bundlephobia-url]: https://bundlephobia.com/result?p=@unional/async-context
[codacy-grade]: https://api.codacy.com/project/badge/Grade/707f89609508442486050d207ec5bd78
[codacy-grade-url]: https://www.codacy.com/app/homawong/async-fp?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=unional/async-fp&amp;utm_campaign=Badge_Grade
[codacy-coverage]: https://api.codacy.com/project/badge/Coverage/707f89609508442486050d207ec5bd78
[codacy-coverage-url]: https://www.codacy.com/manual/homawong/async-fp?utm_source=github.com&utm_medium=referral&utm_content=unional/async-fp&utm_campaign=Badge_Coverage
[codecov-image]: https://codecov.io/gh/unional/async-fp/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/unional/async-fp
[downloads-image]: https://img.shields.io/npm/dm/@unional/async-context.svg?style=flat
[downloads-url]: https://npmjs.org/package/@unional/async-context
[github-nodejs]: https://github.com/unional/async-fp/workflows/Node%20CI/badge.svg
[github-action-url]: https://github.com/unional/async-fp/actions
[npm-image]: https://img.shields.io/npm/v/@unional/async-context.svg?style=flat
[npm-url]: https://npmjs.org/package/@unional/async-context