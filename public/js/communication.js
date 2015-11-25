define(function () {

    // check authorization
    var checkLogin = function (callback) {
        $.ajax({
            url: "/authorized",
            type: "GET",
            success: function (data) {
                return callback(null, data);
            },
            error: function (err) {
                return callback(err);
            }
        });
    };

    return {
        checkLogin: checkLogin
    }
});