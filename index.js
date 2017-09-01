const app = require('koa.io')()
app.use(require('koa-static')('./public/build'))
const router = require('koa-router')()
const send = require('koa-send')
const serve = require('koa-static')
const cors = require('koa-cors')
const bodyParser = require('koa-body')()

const sessions = {}

router.get('/list_votes/:session', function *(next) {
	const session = yield sessions[this.params.session]
	if (!session)
		this.body = {error: 404, description: 'No session found'}
	else
		this.body = session
})

router.post('/create_session', function *(next) {
	const sessionKey = Object.keys(sessions).length
	sessions[sessionKey] = yield {votes: [], users: []}
	this.body = {session: sessionKey}
})

router.post('/clear_session', function *(next) {
	const sessionKey = this.request.body.session
	sessions[sessionKey].votes = yield []
	this.body = {status: 200}
})

router.post('/join_session', function *(next) {
	const {session, user} = this.request.body
	const sessionObject = sessions[session]
	if (!sessionObject.users.includes(user))
		sessions[session].users.push(user)
	this.body = {status: 200}
})

app.io.route('vote', function* (next, voteData) {
	const { session, user, value } = voteData
	const sessionObject = sessions[session]
	if (sessionObject) {
		const vote = sessionObject.votes.find(v => v.user === user)
		if (vote)
			sessionObject.votes.splice(sessionObject.votes.indexOf(vote), 1)
		sessionObject.votes.push({user, value})
		app.io.emit('vote', voteData)
	}
})

app.on('error', err => console.error('server error', err))

app
	.use(cors())
	.use(bodyParser)
	.use(router.routes())
	.use(router.allowedMethods())
	.use(serve(__dirname + '/public/public'))
	.use(function* () {
		yield send(this, __dirname + '/index.html')
	})
	.listen(3001)

app.io.use(function* (next) {
  yield* next
})