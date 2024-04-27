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
	query = query || {};
	if (query.error) {
		throw new Exception("没有权限", 403);
	}
}
