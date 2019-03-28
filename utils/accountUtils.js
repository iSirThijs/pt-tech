const mongoose = require('mongoose');
const argon2 = require('argon2');

// Define schema and model for mongoose
const userSchema = new mongoose.Schema({
	firstname: String,
	lastname: String,
	username: String,
	email: String,
	hash: String
});

const User = mongoose.model('User', userSchema);


exports.add = function(userInfo) {
	return new Promise(function(resolve, reject) {
		mongoose.connect(process.env.MONGODB, { useNewUrlParser: true });
		const db = mongoose.connection;

		db.on('error', () => reject(false));
		db.once('open', async function () {
			let newUser = new User({
				firstname: userInfo.firstname,
				lastname: userInfo.lastname,
				username: userInfo.username,
				email: userInfo.email,
				hash: await argon2.hash(userInfo.password)
			});

			newUser.save( function(err) {
				if (err) reject(false);
				else resolve(true);
			});
		});
	});
};

exports.login = function(username, password) {
	return new Promise(function(resolve, reject) {
		mongoose.connect(process.env.MONGODB, { useNewUrlParser: true });
		const db = mongoose.connection;

		db.on('error', () => reject(false));
		db.once('open', async function() {
			let data = await User.find({ username: username});
			let user = data && data[0];

			if (user) {
				let match = await argon2.verify(user.hash, password);
				resolve(match);
			} else {
				reject(false);
			}
		});
	});
};