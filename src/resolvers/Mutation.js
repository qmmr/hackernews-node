const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

const post = function(parent, { url, description }, context, info) {
	const userId = getUserId(context)
	const data = {
		url,
		description,
		postedBy: {
			connect: { id: userId }
		}
	}

	return context.db.mutation.createLink({ data }, info)
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

// eslint-disable-next-line
const login = async function login(parent, args, context, info) {
	const user = await context.db.query.user({ where: { email: args.email } })
	if (!user) {
		throw new Error(`Could not find user with email: ${args.email}`)
	}

	const valid = await bcrypt.compare(args.password, user.password)
	if (!valid) {
		throw new Error('Invalid password')
	}

	const token = jwt.sign({ userId: user.id }, APP_SECRET)

	return {
		token,
		user
	}
}

const vote = async function vote(parent, args, context, info) {
	const userId = getUserId(context)
	const { linkId } = args
	const linkExists = await context.db.exists.Vote({
		user: { id: userId },
		link: { id: linkId }
	})

	if (linkExists) {
		throw new Error(`Already voted for link: ${linkId}`)
	}

	return context.db.mutation.createVote(
		{
			data: {
				user: { connect: { id: userId } },
				link: { connect: { id: linkId } }
			}
		},
		info
	)
}

module.exports = { post, signup, login, vote }
