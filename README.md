# buhoi-client

Client side part of [buhoi](https://github.com/titarenko/buhoi) framework.

## Purpose

Provide loading of [stateless functional components](http://frontendinsights.com/stateless-functional-components/) depending on route, with support of [webpack](https://webpack.js.org/) [hot module replacement](https://webpack.js.org/concepts/hot-module-replacement/).

## Example

```js

// index.js

const buhoi = require('buhoi-client')

buhoi.start({
	createContext: () => require.context('./entities', true, /\.jsx$/),
	defaultRoute: { collection: 'greetings' },
	reducers: [assign],
	acceptHotUpdate: module.hot && module.hot.accept,
})

function assign (state, action) {
	if (action.type == 'ASSIGN') {
		return { ...state, page: { [action.key]: action.value } }
	}
}
```

```jsx

// entities/greetings/list.jsx

const { navigateTo } = require('buhoi-client')

module.exports = function ({ route, dispatch, someText }) {
	return <div>
		<h1 onClick={() => dispatch(navigateTo('/params?a=1'))}>Hi!</h1>
		<h1 onClick={() => dispatch(navigateTo({ collection: 'params', query: { a: 2 }))}>Hola!</h1>
		<input type="text" onInput={e => dispatch(assign('someText', e.target.value))} value={someText} />
		<p>Change this, save file, and observe following text unchanged: {someText}</p>
	</div>
}

function assign (key, value) {
	return { type: "ASSIGN", key, value }
}
```

```jsx

// entities/params/list.jsx

module.exports = function ({ route }) {
	return <h1>Param A is {route.query.a}</h1>
}
```

## Reference

As you could notice from example, `buhoi-client` provides you with two functions: `start` and `navigateTo`.

### start(options)

Starts routing, accepting following options:

| name | type | required | description |
| --- | --- | --- | --- |
| createContext | function | yes | must return webpack [`require.context` instance](https://webpack.js.org/guides/dependency-management/#require-context): router will use it to require and render component according to route |
| defaultRoute | URL string or route object | yes | default route |
| reducers | array of functions | no | reducers in terms of [redux](http://redux.js.org/docs/introduction/CoreConcepts.html), order matters |
| acceptHotUpdate | function | no | simply put `module.hot && module.hot.accept` here if you are interested in webpack HMR |

Route object consists of: collection (string), action (string), id (string) and query (query string in object form). For example, URL `/books/1/edit?mode=extended` corresponds to route `{ collection: 'books', id: '1', action: 'edit', query: { mode: 'extended' } }`.

Reducers array is used to create single reducer for redux store by employing following approach: next state is equal to first non-falsey output from any of reducers from aforementioned array, iterated in natural order. 

### navigateTo(route[, silent])

Navigates to given route (specified as route object, or URL string). Silent mode (boolean) prevents URL change in browser.

## Behavior

### Routing

Determine component according to rules:

- if there is no route (URL is `/`), then navigate to default route
- if there is no action (URL is `/collection`), then load and render `collection/list.jsx`
- if there is action (URL is `/collection/id/action`), then load and render `collection/action.jsx`
- if there is dash (`-`) in place of id (URL is `/collection/-/action`), then assume id is `undefined`

Listen to [`popstate`](https://developer.mozilla.org/en-US/docs/Web/Events/popstate), call `navigateTo` silently.
Use [`pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method) when `navigateTo` is called (unless silent).

Do not forget to assign empty object to `page` property of state to prevent interference between successive pages.

### Loading

Simply call `context.require('collection/action.jsx')`.

### Rendering

Not much complicated, call `component({ route, dispatch, ...page })`, where `dispatch` is method of redux store, and both `route` and `page` are properties of object, returned by `getState` method of store. Then pass the result (virtual DOM) to `render` method of [inferno](https://github.com/infernojs/inferno).

Do the same when state or components (HMR) change.

## Motivation

- bored of complex bootstrap, requiring lots of prior knowledge
- bored of stateful OOP-based approaches, requiring obscure patching for hot reload or isomorphic rendering
- bored of components built on top of complex APIs, gathering in complex hierarchies
- excited about delivering more per unit of time using clear and straightforward tooling
- want to understand the stack from bottom to top

## License

MIT