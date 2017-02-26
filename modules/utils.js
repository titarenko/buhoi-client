module.exports = {
	createScopedReducer: (reducer, scope) =>
		(state, action) => state === undefined || action.scope == scope
			? reducer(state, action)
			: state,
}