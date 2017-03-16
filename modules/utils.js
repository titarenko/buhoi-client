module.exports = { createScopedReducer, createScopedDispatch }

function createScopedReducer (scope, reducer) {
	return (state, action) => state === undefined || action.scope == scope
		? reducer(state, action)
		: state
}

function createScopedDispatch (scope, dispatch) {
	return action => typeof action == 'function'
		? dispatch((thunkDispatch, ...thunkExtraArgs) => action(
			createScopedDispatch(scope, thunkDispatch),
			...thunkExtraArgs
		))
		: dispatch({ ...action, scope })
}