function Login(payload, type) {
    if (type == "admin") {
        return LoginByAdmin(payload);
    } else {
        return LoginByUser(payload);
    }
}

/**
 * 登录处理
 * @param {*} payload
 * @returns
 */
function LoginByAdmin(payload) {
    console.log("start to login with admin ~~~");
    console.log(payload)
    // 验证验证码
    var captcha = Process(
        "xiang.helper.CaptchaValidate",
        payload.captcha.id,
        payload.captcha.code
    );

    if (captcha !== true) {
        throw new Exception("验证码不正确!", 400);
    }
    var account = payload.mobile;
    if (!account) {
        account = payload.email;
    }
    var user = Process("models.admin.user.get", {
        wheres: [
            { column: "mobile", value: account },
            { column: "status", value: "启用" },
            {
                method: "orwhere",
                column: "email",
                value: account,
            },
        ],
        limit: 1,
    });
    if (!user || !user.length) {
        throw new Exception("用户不存在", 400);
    }
    // 验证密码
    // var password_validate = Process(
    //   "xiang.helper.PasswordValidate",
    //   payload.password,
    //   user[0].password
    // );
    // if (password_validate !== true) {
    //  throw new Exception("密码不正确!", 400);
    // }

    // 增加token等信息
    const session_id = payload.sid;
    var jwt = Process(
        "xiang.helper.JWTMake",
        user[0].id,
        { user_name: user[0].name },
        {
            timeout: 28800,
            sid: session_id,
        }
    );

    Process("session.set", "user", user[0], 28800);
    Process("session.set", "token", jwt.token, 28800);
    Process("session.set", "user_id", user[0].id, 28800);

    delete user[0].password;
    // const user_id = Process("session.Get", "user_id");

    return {
        sid: session_id,
        user: user[0],
        menus: Process("flows.menu"),
        token: jwt.token,
        expires_at: jwt.expires_at,
    };
}

function ReqSMSCode(phone) {
    log.Trace("phone:%v", phone);
    // save into session
    // phone: 18229950130 
    // phone_cnt: send sms count in a day. default value 6
    let phone_cnt = phone + "_cnt"

    let cnt = Process("session.Get", phone_cnt)

    if (isNaN(cnt)) {
        cnt = 1;
    } else if (cnt == null) {
        cnt = 1;
        Process("session.set", phone_cnt, cnt, 60);
    }
    console.log("cnt", cnt);
    log.Info("%v send sms %v time(s)!", phone, cnt);

    log.Info("smscode", "123");
    Process("session.set", phone, "123", 300);
    if (cnt + 1 > 6) {
        throw new Exception(phone + "已超过当天发次的次数，请明天再试!", 400);
    }
    Process("session.set", phone_cnt, cnt + 1);
    // invoke api to sent out sms code to phone
    // 18229950130: $sms_code
    // redis {18229950130: $sms_code , phone_cnt: 1 }
    return "123";
}

function LoginByUser(payload) {
    console.log("start to login with user ~~~");
    console.log(payload)
    // 验证验证码
    let smscode = payload.sms.code
    //TODO compare smscode with value in redis
    let flag = smscode == "123";
    if (!flag) {
        throw new Exception("验证码不正确!", 400);
    }
    var account = payload.mobile;

    var user = Process("models.admin.user.get", {
        wheres: [
            { column: "mobile", value: account },
            { column: "status", value: "启用" },
            {
                method: "orwhere",
                column: "email",
                value: account,
            },
        ],
        limit: 1,
    });
    if (!user || !user.length) {
        throw new Exception("用户不存在", 400);
    }
    // 验证密码
    // var password_validate = Process(
    //   "xiang.helper.PasswordValidate",
    //   payload.password,
    //   user[0].password
    // );
    // if (password_validate !== true) {
    //  throw new Exception("密码不正确!", 400);
    // }

    // 增加token等信息
    const session_id = Process("utils.str.uuid"); // payload.sid;
    var jwt = Process(
        "utils.jwt.Make",
        user[0].id,
        { user_name: user[0].name },
        {
            timeout: 28800,
            sid: session_id,
        }
    );
    // Process("session.set", "user", user[0], 28800);
    // Process("session.set", "token", jwt.token, 28800);
    // Process("session.set", "user_id", user[0].id, 28800);
    delete user[0].password;

    return {
        sid: session_id,
        user: user[0],
        //  menus: Process("flows.menu"),
        token: jwt.token,
        expires_at: jwt.expires_at,
    };
}
