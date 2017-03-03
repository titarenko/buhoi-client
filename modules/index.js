const navigation = require('./navigation')
const loader = require('./loader')
const store = require('./store')

const { navigateTo } = navigation
const isEqual = require('lodash.isequal')
const { render } = require('inferno')

const { combineReducers } = require('redux')
const { createScopedReducer, createScopedDispatch } = require('./utils')

module.exports = {
	start,
	navigateTo,

	combineReducers,

	createScopedReducer,
	createScopedDispatch,

	request: require('./request'),
	rest: require('./rest'),
}

function start ({ container, createContext, acceptHotUpdate, appReducer = (state = null, action) => state, defaultRoute }) {
	const root = container || document.getElementById('root')

	const loaderInstance = loader.create({ createContext, acceptHotUpdate })
	const storeInstance = store.create({ appReducer })

	storeInstance.subscribe(() => setTimeout(renderRootComponent, 0))
	loaderInstance.subscribe(() => storeInstance.dispatch(navigateTo(storeInstance.getState().route)))

	navigation.start(storeInstance.dispatch)

	function renderRootComponent () {
		const { app, route, page } = storeInstance.getState()
		try {
			const component = loaderInstance.load(`./${route.entity}/${route.action || 'index'}.jsx`)
			storeInstance.setComponentReducer(component.reducer)
			const dom = component({
				app,
				route,
				...page,
				dispatch: storeInstance.dispatch,
				navigateTo: location => navigateTo(location || defaultRoute),
			})
			if (dom) {
				render(dom, root)
			}
		} catch (e) {
			if (e instanceof loader.NotFoundError && !isSameRoute(route, defaultRoute)) {
				storeInstance.dispatch(navigateTo(defaultRoute))
			} else {
				throw e
			}
		}
	}
}

function isSameRoute (lhs, rhs) {
	return lhs.entity == rhs.entity
		&& (lhs.action || null) == (rhs.action || null)
		&& lhs.id == rhs.id
		&& isEqual(lhs.query || null, rhs.query || null)
}