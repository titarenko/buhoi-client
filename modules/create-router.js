const urlParse = require('url-parse')
const queryString = require('querystring')

module.exports = create

function create ({ store, loader, defaultRoute }) {
	if (!defaultRoute) {
		throw new Error('Missing parameter: defaultRoute.')
	}

	return { getRootComponent, navigateTo }

	function getRootComponent () {
		const { user, route, page } = store.getState()

		if (!route) {
			navigateTo(defaultRoute)
			return
		}

		const componentName = `./${route.collection}/${route.action || 'list'}.jsx`
		try {
			const component = loader.load(componentName)
			return component({ ...page, user, route })
		} catch (e) {
			const isNotFound = e.message == `Cannot find module '${componentName}'.`
			if (isNotFound && !isEqualRoutes(route, defaultRoute)) {
				navigateTo(defaultRoute)
			} else {
				throw e
			}
		}
	}

	function navigateTo (route, silent) {
		if (!route) {
			throw new Error('Missing parameter: route.')
		}

		if (!silent) {
			window.history.pushState(
				null,
				document.title,
				typeof route == 'string'
					? route
					: stringifyRoute(route)
			)
		}
		store.dispatch({
			type: 'NAVIGATE_TO',
			route: typeof route == 'string'
				? parseRoute(route)
				: route,
		})
	}
}

function parseRoute (url) {
	const parsed = urlParse(url, true)
	const tokens = parsed.pathname.slice(1).split('/')

	const collection = tokens[0]
	const id = tokens[1] == '-' ? undefined : tokens[1]
	const action = tokens[2] || (id ? 'edit' : 'list')

	return {
		collection,
		id,
		action,
		query: parsed.query,
	}
}

function stringifyRoute ({ collection, id, action, query }) {
	return '/' + [
		[collection, id || action ? '-' : null, action].filter(x => x).join('/'),
		query ? queryString.stringify(query) : null,
	].filter(x => x).join('?')
}

function isEqualRoutes (lhs, rhs) {
	return lhs.collection == rhs.collection
		&& lhs.action == rhs.action
		&& lhs.id == rhs.id
}