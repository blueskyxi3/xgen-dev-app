function Chat(path, params, query, payload, headers) {
	query = query || {}
	token = query.token || ''
	token = token[0] || ''
	token = token.replace('Bearer ', '')
	if (token == '' || token.length == 0) {
		throw new Exception('No token provided', 403)
	}

	let data = Process('utils.jwt.Verify', token)
	return { __sid: data.sid, __global: data.data }
}

/**
 * 自定义接口鉴权
 * @param  {...any} args
 */
function User(path, params, query, payload, headers) {
	log.Trace("[guard.User] path: %v", path);
	log.Trace("[guard.User] params: %v", params);
	log.Trace("[guard.User] query: %v", query);
	log.Trace("[guard.User] payload: %v", payload);
	log.Trace("[guard.User] headers: %v", headers);
	let tokenstring = headers["Authorization"][0]
	let prefix = "Bearer "
	let jwt = tokenstring.substring(prefix.length);
	console.log("jwt->", jwt)
	let jwtClaims = Process(
		"utils.jwt.Verify",
		jwt
	);
	console.log("jwtClaims--->", jwtClaims)

	let timestamp = jwtClaims["exp"];
	let currentTime = Math.floor(Date.now() / 1000); // 当前时间的时间戳，以秒为单位

	const remainingSeconds = timestamp - currentTime;
	log.debug("remainingSeconds===>", remainingSeconds); // 输出剩余秒数

	// Set Session
	Process("session.SetMany", { user_id: jwtClaims["id"], user: jwtClaims["data"], remain_time: remainingSeconds }, remainingSeconds, jwtClaims.sid);
	// Process("session.set", "user", jwtClaims["data"], 28800);
	// Process("session.set", "user_id", jwtClaims["id"], 28800);

	/* query = query || {};
	if (query.error) {
		throw new Exception("没有权限", 403);
	} */
}
