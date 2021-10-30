const fetch = require('node-fetch');
require('dotenv').config();

const catchAsyncErrors = fn => (
	(req, res, next) => {
		const routePromise = fn(req, res, next);
		if (routePromise.catch) {
		routePromise.catch(err => next(err));
		}
	}
);


function Utils(req, debug) {
	this.token = req.cookies.token;
	if(debug) console.log("Got token");
	this.debug = debug;
}

Utils.prototype.init = async function() {
	this.login_method = this.getLoginMethod();
	if(this.login_method == "discord") {
		this.user_data = await this.getUserData();
		this.user_guilds = await this.getUserGuilds();
		this.has_joined = await this.hasJoined();
		if(this.has_joined) {
			this.guild_user_data = await this.getGuildUserData();
			this.guild_roles = await this.getGuildRoles();
			this.user_roles = await this.getUserRoles();
			this.highest_role = await this.getHighestUserRole();			
		}
	}
}

Utils.prototype.getLoginMethod = function() {
	if(this.token == undefined) return "none";
	else if(this.token == "guest") return "guest";
	else return "discord";
}
Utils.prototype.getUserData = async function() {
	const data = await fetch("https://discordapp.com/api/users/@me", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${this.token}`
		}
	})
	json = await data.json();
	if(this.debug) console.log("Got user data: " + json);
	return json;
}
Utils.prototype.getGuildUserData = async function() {
	const data = await fetch(`https://discordapp.com/api/guilds/818951190721200158/members/${this.user_data.id}`, {
		method: "GET",
		headers: {
			Authorization: `Bot ${process.env.BOT_TOKEN}`
		}
	})
	json = await data.json();
	if(this.debug) console.log("Got guild user data: " + json);
	return json;
}
Utils.prototype.getGuildRoles = async function() {
	const data = await fetch("https://discordapp.com/api/guilds/818951190721200158/roles", {
		method: "GET",
		headers: {
			Authorization: `Bot ${process.env.BOT_TOKEN}`
		}
	})
	json = await data.json();
	if(this.debug) console.log("Got guild roles: " + json);
	return json;
}
Utils.prototype.getUserRoles = async function() {
	var roles_ids = {};
	var roles_names = {};
	var user_roles = {};
	this.guild_roles.forEach(role => {
		roles_ids[role.id] = role;
		roles_names[role.name] = role;
	});
	this.guild_user_data.roles.forEach(role => {
		user_roles[roles_ids[role].name] = roles_ids[role];
	});
	if(this.debug) console.log("Got user roles: " + json);
	return user_roles;
}
Utils.prototype.getHighestUserRole = async function() {
	highest_role = "User";
	if("Trial Mod" in this.user_roles) highest_role = "Trial Mod";
	else if("Mod" in this.user_roles) highest_role = "Mod";
	else if("Admin" in this.user_roles) highest_role = "Admin";
	else if("Owner" in this.user_roles) highest_role = "Owner";
	if(this.debug) console.info("Got highest role")
	return highest_role;
}
Utils.prototype.getUserGuilds = async function() {
	const data = await fetch(`https://discordapp.com/api/users/@me/guilds`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${this.token}`
		}
	})
	json = await data.json();
	if(this.debug) console.log("Got user guilds: " + json);
	return json;
}
Utils.prototype.hasJoined = async function() {
	joined = false;
	this.user_guilds.forEach(guild => { 
		if(guild.id == "818951190721200158") joined = true; 
	});
	if(this.debug) console.info("Got joined");
	return joined;
}

module.exports = {
	catchAsync: catchAsyncErrors,
	utils: Utils
};