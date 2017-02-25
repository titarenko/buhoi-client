const isEqual = require('lodash.isequal')
const { navigateTo } = require('./actions')

module.exports = create

function create ({ store, loader, defaultRoute }) {
	if (!defaultRoute) {
		throw new Error('Missing parameter: defaultRoute.')
	}

	window.onpopstate = ev => store.dispatch(navigateTo(ev.state, true))

	return { getRootComponent }

	function getRootComponent () {
		const state = store.getState()
		const { route, page } = state

		if (!route) {
			store.dispatch(navigateTo(defaultRoute))
			return
		}

		const componentName = `./${route.collection}/${route.action || 'list'}.jsx`
		try {
			const component = loader.load(componentName)
			return component({ ...page, app: state, dispatch: store.dispatch })
		} catch (e) {
			const isNotFound = e.message == `Cannot find module '${componentName}'.`
			if (isNotFound && !isEqual(route, defaultRoute)) {
				store.dispatch(navigateTo(defaultRoute))
			} else {
				throw e
			}
		}
	}
}