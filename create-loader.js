module.exports = create

function create (createContext) {
	let context = createContext()

	return { load, subscribe }

	function load (name) {
		return context(name)
	}

	function subscribe (updateHandler) {
		if (!module.hot) {
			return
		}
		module.hot.accept(context.id, function () {
			context = createContext()
			updateHandler()
		})
	}
}