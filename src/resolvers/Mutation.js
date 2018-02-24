const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const APP_SECRET = require('../utils')

const post = function(parent, args, context, info) {
	const { url, description } = args

	return context.db.mutation.createLink({ data: { url, description } }, info)
}

// eslint-disable-next-line
const signup = async function signup(parent, args, context, info) {
	const password = await bcrypt.hash(args.password, 10)
	const user = await context.db.mutation.createUser({
		data: { ...args, password }
	})
	const token = jwt.sign({ userId: user.id }, APP_SECRET)

	return { token, user }
}

module.exports = { post, signup }
