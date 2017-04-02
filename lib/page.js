const { render } = require('inferno')
const { isSame } = require('./route')
const { actions: { navigateTo } } = require('./navigation')

module.exports = { render: queueRender }

let currentRender = null

function queueRender (params) {
	if (currentRender) {
		clearTimeout(currentRender)
	}
	currentRender = setTimeout(() => {
		renderPage(params)
		currentRender = null
	}, 10)
}

function renderPage ({ storeInstance, loaderInstance, containerDomNode }) {
	const { route, app, page, version } = storeInstance.getState()

	const routeIsSame = isSame(route, route.previous, true)
	const isPageStateReset = version.clean && version.dirty < version.clean

	const component = loaderInstance.load(`./${route.entity}/${route.action || 'index'}.jsx`)
	if (!component) {
		storeInstance.dispatch(navigateTo())
		return
	}

	storeInstance.setComponentReducer(component.reducer)

	if (!routeIsSame && !isPageStateReset) {
		storeInstance.dispatch({ type: 'RESET_PAGE_STATE' })
		return
	}

	const virtualNode = component({
		route,
		app,
		...page,
		dispatch: storeInstance.dispatch,
	})

	if (virtualNode) {
		requestAnimationFrame(() => render(virtualNode, containerDomNode))
	}
}