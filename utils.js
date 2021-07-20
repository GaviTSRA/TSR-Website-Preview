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

function isLoggedIn(req) {
	if(req.cookies.token == undefined) return false;
	else return true;
}

function getToken(req) {
	//console.log("Got token");
	return req.cookies.token;
}

async function getUserData(req) {
	if(!isLoggedIn(req)) return undefined;
	const data = await fetch("https://discordapp.com/api/users/@me", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${getToken(req)}`
		}
	})
	json = await data.json();
	//console.log("Got user data: " + json);
	return json;
}

async function getGuildUserData(req) {
	user_data = await getUserData(req);
	const data = await fetch(`https://discordapp.com/api/guilds/818951190721200158/members/${user_data.id}`, {
		method: "GET",
		headers: {
			Authorization: `Bot ${process.env.BOT_TOKEN}`
		}
	})
	json = await data.json();
	//console.log("Got guild user data: " + json);
	return json;
}

async function getGuildRoles(req) {
	const data = await fetch("https://discordapp.com/api/guilds/818951190721200158/roles", {
		method: "GET",
		headers: {
			Authorization: `Bot ${process.env.BOT_TOKEN}`
		}
	})
	json = await data.json();
	//console.log("Got guild roles: " + json);
	return json;
}

async function getUserRoles(req) {
	var roles_ids = {};
	var roles_names = {};
	var user_roles = {};
	guild_roles = await getGuildRoles(req);
	guild_roles.forEach(role => {
		roles_ids[role.id] = role;
		roles_names[role.name] = role;
	});
	guild_user_data = await getGuildUserData(req);
	guild_user_data.roles.forEach(role => {
		user_roles[roles_ids[role].name] = roles_ids[role];
	});
	//console.log("Got user roles: " + json);
	return user_roles;
}

async function getHighestUserRole(req) {
	user_roles = await getUserRoles(req);
	highest_role = "User";
	if("Trial Mod" in user_roles) highest_role = "Trial Mod";
	else if("Mod" in user_roles) highest_role = "Mod";
	else if("Admin" in user_roles) highest_role = "Admin";
	else if("Owner" in user_roles) highest_role = "Owner";
	//console.info("Got highest role")
	return highest_role;
}

async function getUserGuilds(req) {
	const data = await fetch(`https://discordapp.com/api/users/@me/guilds`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${await getToken(req)}`
		}
	})
	json = await data.json();
	//console.log("Got user guilds: " + json);
	return json;
}



module.exports = {
	catchAsync: catchAsyncErrors,
    isLoggedIn: isLoggedIn,
    getToken: getToken,
	getUserData: getUserData,
	getGuildUserData: getGuildUserData,
	getGuildRoles: getGuildRoles,
	getUserRoles: getUserRoles,
	getHighestUserRole: getHighestUserRole,
	getUserGuilds: getUserGuilds
};