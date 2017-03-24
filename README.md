# buhoi-client

Client side part of [buhoi](https://github.com/titarenko/buhoi) framework.

## Purpose

Provide loading of [stateless functional components](http://frontendinsights.com/stateless-functional-components/) depending on route, with support of [webpack](https://webpack.js.org/) [hot module replacement](https://webpack.js.org/concepts/hot-module-replacement/).

## Example

```js
// index.js

const buhoi = require('buhoi-client')

buhoi.start({
	createContext: () => require.context('./pages', true, /\.jsx$/),
	acceptHotUpdate: module.hot && module.hot.accept,
	defaultRoute: '/greetings',
})
```

```jsx
// pages/greetings/index.jsx

const { combineReducers } = require('redux')
const { actions: { navigateTo } } = require('buhoi-client')

module.exports = Greetings
module.exports.reducer = combineReducers({ someText: someTextReducer })

function Greetings ({ someText, route, dispatch }) {
	return <div>
		<h1 onClick={() => dispatch(navigateTo('/other-page?a=1'))}>Hi!</h1>
		<h1 onClick={() => dispatch(navigateTo({ entity: 'other-page', query: { a: 2 }))}>Hola!</h1>
		<input type="text" onInput={e => dispatch(setSomeText(e.target.value))} value={someText} />
		<p>Change this, save file, and observe following text unchanged: {someText}</p>
	</div>
}

function someTextReducer (state = '', action) {
	switch (action.type) {
		case 'SET_SOME_TEXT': return action.text
		default: return state
	}
}

function setSomeText (text) {
	return { type: 'SET_SOME_TEXT', text }
}
```

```jsx
// entities/other-page/index.jsx

module.exports = function ({ route }) {
	return <h1>Param A is {route.query.a}</h1>
}
```

## Concept

* client application consists of pages
* each page is a stateless functional component with dedicated reducer (although reducer is optional)
* application state has two parts: persistent (`app`) and changing (`page` and `route` as page ID)
* whenever route changes, previous page state is lost, new page loaded and rendered, receiving complete application state (plus `dispatch`) as props

## API Reference

### start(options)

Function, starts client application, accepting following options.

#### createContext

Requied: **yes**

Function, must return webpack [`require.context`](https://webpack.js.org/guides/dependency-management/#require-context) instance. Is used by router to require and render component according to route.

#### acceptHotUpdate

Required: no

Function, must be falsey, or equal to `module.hot.accept`, provided by webpack. Simply **put `module.hot && module.hot.accept` here** if you want to enable hot reload.

#### defaultRoute

Requred: **yes**

String or `{ entity, action, id, query }` object, representing default route.

As example, route-string `/books/edit/1?mode=extended` corresponds to route-object
```js
{
	entity: 'books',
	action: 'edit',
	id: '1',
	query: { mode: 'extended' }
}
```

#### loginRoute

Required: no

String or `{ entity, action, id, query }` object, representing login route. Is used by default route reducer in case if any REST action returns 401 (not authenticated) or 403 (forbidden).

#### routeReducer

Required: no

Custom route reducer. In most cases you do not need to override default routing behaviour, but, if you need, it can be done by providing route reducer.

#### appReducer

Required: no

Reducer for persistent part of application state (`app`). As example, `app` reducer can handle authentication-related actions, returing `{ user }` state.

#### middleware

Required: no

Array of middleware functions. As example, you could put here [redux-thunk](https://github.com/gaearon/redux-thunk), also you could pass [redux-logger](https://github.com/evgenyrodionov/redux-logger) middleware in `development` environment.

#### containerDomNode

Required: no

`DOMNode` used for rendering of virtual node, returned by page component. By default, it's element with ID "root".

### scope

Object, represents dictionary of scope-related functions.

#### createDispatch(scope, dispatch)

Function, creates scoped dispatch function. Scoped means that each action dispatched by it will contain `scope` property. 

#### createReducer(scope, reducer)

Function, creates scoped reducer function. Scoped means that reducer will process actions of given scope, ignoring others.

### actions

Object, represents dictionary of actions.

#### navigateTo(route[, silent])

Function, creates route change action. If `silent` is `true`, then URL change will be prevented.

#### changeQuery(keyValues[, replace])

Functon, creates route query change action. If `replace` is `true`, then query will be replaced by `keyValues`, otherwise it will be extended by `keyValues`. Note, you can pass `{ param: undefined }` to get rid of `param` query parameter.

You must provide `redux-thunk` middleware to use this action.

#### read(operationName, url[, qs])

Function, creates read action. Whenever it's dispatched:

- `GET` request is started using given `url` and `qs` (query string object)
- ``${operationName}_STARTED`` is fired with `request` property (reference to request promise)
- once request succeeded, ``${operationName}_SUCCEEDED`` is fired with `result` property (reference to response body)
- in case of error, ``{$operatioName}_FAILED`` is dispatched with `error` property (in most cases it will be of type `RestRequestError`)

You must provide `redux-thunk` middleware to use this action.

#### write(operationName, url, body)

Function, creates write action. Whenever it's dispatched:

- `POST` request is started using given `url` and `body`
- ``${operationName}_STARTED`` is fired with `request` property (reference to request promise)
- once request succeeded, ``${operationName}_SUCCEEDED`` is fired with `result` property (reference to response body)
- in case of error, ``{$operatioName}_FAILED`` is dispatched with `error` property (in most cases it will be of type `RestRequestError`)

You must provide `redux-thunk` middleware to use this action.

#### remove(operationName, url)

Function, creates remove action. Whenever it's dispatched:

- `DELETE` request is started using given `url`
- ``${operationName}_STARTED`` is fired with `request` property (reference to request promise)
- once request succeeded, ``${operationName}_SUCCEEDED`` is fired
- in case of error, ``{$operatioName}_FAILED`` is dispatched with `error` property (in most cases it will be of type `RestRequestError`)

You must provide `redux-thunk` middleware to use this action.

### RestRequestError

Error, represents REST request error, consisting of `statusCode` and `body` properties, corresponding to ones from response.

## Motivation

- bored of complex bootstrap, requiring lots of prior knowledge
- bored of stateful OOP-based approaches, requiring obscure patching for hot reload or isomorphic rendering
- bored of components built on top of complex APIs, gathering in complex hierarchies
- excited about delivering more per unit of time using clear and straightforward tooling
- want to understand the stack from bottom to top

## License

MIT