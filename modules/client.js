const { render } = require('inferno')
const { createStore } = require('redux')

const createRouter = require('./create-router')
const createLoader = require('./create-loader')
const createReducer = require('./create-reducer')
const { navigateTo } = require('./actions')

const storeMiddleware = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()

module.exports = { start, navigateTo }

function start ({ createContext, acceptHotUpdate, reducers, defaultRoute, initialState, container }) {
	const root = container || document.getElementById('root')
	const store = createStore(createReducer({ reducers }), initialState, storeMiddleware)
	const loader = createLoader({ createContext, acceptHotUpdate })
	const router = createRouter({ store, loader, defaultRoute })

	const renderRootComponent = () => {
		const component = router.getRootComponent()
		if (component) {
			render(component, root)
		}
	}

	store.subscribe(() => setTimeout(renderRootComponent, 0))
	loader.subscribe(() => store.dispatch({ type: 'HOT_RELOAD' }))

	store.dispatch(navigateTo(`${location.pathname || ''}${location.search || ''}`))
}