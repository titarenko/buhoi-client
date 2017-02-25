const { render } = require('inferno')
const { createStore, applyMiddleware } = require('redux')

const reduxThunk = require('redux-thunk').default
const reduxDevtools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()

const createRouter = require('./create-router')
const createLoader = require('./create-loader')
const createReducer = require('./create-reducer')

const { hotReload, navigateTo } = require('./actions')

module.exports = { start, navigateTo }

function start ({
	createContext,
	acceptHotUpdate,

	appReducers,
	pageReducers,

	defaultRoute,

	initialState,

	container,
}) {
	const root = container || document.getElementById('root')
	const reducer = createReducer({ appReducers, pageReducers })
	const middleware = applyMiddleware.apply(null, [reduxThunk, reduxDevtools].filter(Boolean))
	const store = createStore(reducer, initialState, middleware)
	const loader = createLoader({ createContext, acceptHotUpdate })
	const router = createRouter({ store, loader, defaultRoute })

	const renderRootComponent = () => {
		const component = router.getRootComponent()
		if (component) {
			render(component, root)
		}
	}

	store.subscribe(() => setTimeout(renderRootComponent, 0))
	loader.subscribe(() => store.dispatch(hotReload()))

	const currentUrl = `${location.pathname || ''}${location.search || ''}`
	store.dispatch(navigateTo(currentUrl))
}