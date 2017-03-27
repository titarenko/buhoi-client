module.exports = { createReducer, createDispatch }

function createReducer (scope, reducer) {
	return (state, action) => state === undefined && action.scope == null || action.scope == scope
		? reducer(state, action)
		: state
}

function createDispatch (scope, dispatch) {
	return action => typeof action == 'function'
		? dispatch((thunkDispatch, ...thunkExtraArgs) => action(
			createDispatch(scope, thunkDispatch),
			...thunkExtraArgs
		))
		: dispatch({ ...action, scope })
}