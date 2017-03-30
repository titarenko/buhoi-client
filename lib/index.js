const loader = require('./loader')
const store = require('./store')
const page = require('./page')

const navigation = require('./navigation')
const restApi = require('./rest-api')
const scope = require('./scope')

module.exports = {
	start,
	scope,
	actions: {
		...navigation.actions,
		...restApi.actions,
	},
	RestRequestError: restApi.RestRequestError,
}

function start ({
	createContext,
	acceptHotUpdate,

	defaultRoute,
	loginRoute,

	routeReducer,
	appReducer,

	middleware,
	containerDomNode,
}) {
	if (loginRoute) {
		if (!middleware) {
			middleware = []
		}
		middleware.push(restApi.errorInterceptor((action, dispatch) => {
			if (action.error.statusCode == 401 || action.error.statusCode == 403) {
				dispatch(navigation.actions.navigateTo(loginRoute))
			}
		}))
	}

	const storeInstance = store.create({
		routeReducer: routeReducer || navigation.createRouteReducer({ defaultRoute }),
		appReducer,
		middleware,
	})
	const loaderInstance = loader.create({ createContext, acceptHotUpdate })

	storeInstance.subscribe(() => setTimeout(renderPage, 0))
	loaderInstance.subscribe(() => storeInstance.dispatch({ type: 'HOT_RELOAD' }))

	navigation.start(storeInstance.dispatch)

	function renderPage () {
		page.render({
			storeInstance,
			loaderInstance,
			containerDomNode: containerDomNode || document.getElementById('root'),
		})
	}
}