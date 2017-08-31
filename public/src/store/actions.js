import { makeRequest } from './utils'

export const CREATE_SESSION = 'CREATE_SESSION'

export const RECEIVE_VOTE_LIST = 'RECEIVE_VOTE_LIST'
export const CLEAR_VOTE_LIST = 'CLEAR_VOTE_LIST'
export const VOTE = 'VOTE'

export const JOIN_SESSION = 'JOIN_SESSION'

export const SET_LOADING_STATE = 'SET_LOADING_STATE'
export const SET_SNACKBAR_STATE = 'SET_SNACKBAR_STATE'

function request() {
	return dispatch => {
		dispatch(setLoadingState(true))
		return makeRequest(...arguments)
			.then(data => {
				dispatch(setLoadingState(false))
				return data
			})
	}
}

export function createSession(user) {
	return dispatch =>
		dispatch(request('/create_session', null, {}, 'post'))
			.then(session => dispatch(joinSession(session.session, user)))
}

function receiveSessionId(session) {
	return {
		type: CREATE_SESSION,
		session
	}
}

export function clearSession(session) {
	return dispatch =>
		dispatch(request('/clear_session', null, {session}, 'post'))
			.then(_ => dispatch(clearVoteList([])))
}

function clearVoteList() {
	return {
		type: CLEAR_VOTE_LIST
	}
}

export function listVotes(session) {
	return dispatch =>
		dispatch(request('/list_votes', session))
			.then(votes => dispatch(receiveVoteList(votes)))
}

function receiveVoteList(votes) {
	return {
		type: RECEIVE_VOTE_LIST,
		votes
	}
}

export function vote(session, user, value) {
	return dispatch => 
		dispatch(request('/vote', null, {session, user, value}, 'post'))
			.then(data => {
				const message = data.error ?
					`Voting failed` :
					`Voted!`
				dispatch(voted(user, value))
				dispatch(setSnackbarState(true, message))
			})
}

function voted(user, value) {
	return {
		type: VOTE,
		vote: {user, value}
	}
}

export function joinSession(session, user) {
	return dispatch =>
		dispatch(request('/join_session', null, {session, user}, 'post'))
			.then(_ => {
				const message = `joined session "${session}" with user ${user}`
				dispatch(setSnackbarState(true, message))
				dispatch(receiveSessionId({session}))
				dispatch(listVotes(session))
				history.replaceState(null, null, `?session=${session}`)
			})
}

export function setLoadingState(isLoading) {
	return {
		type: SET_LOADING_STATE,
		isLoading
	}
}

export function setSnackbarState(isVisible, message) {
	return {
		type: SET_SNACKBAR_STATE,
		isVisible,
		message
	}
}