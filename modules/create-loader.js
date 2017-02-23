module.exports = create

function create ({ createContext, acceptHotUpdate }) {
	let context = createContext()

	return { load, subscribe }

	function load (name) {
		return context(name)
	}

	function subscribe (updateHandler) {
		if (!acceptHotUpdate) {
			return
		}
		acceptHotUpdate(context.id, function () {
			context = createContext()
			updateHandler()
		})
	}
}