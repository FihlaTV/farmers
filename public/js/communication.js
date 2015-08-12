define(function () {

    // check authorization
    var checkLogin = function (callback) {
        $.ajax({
            url: "/admin/currentAdmin",
            type: "GET",
            success: function (data) {
                return callback(null, data);
            },
            error: function (data) {
                return callback(data);
            }
        });
    };

    return {
        checkLogin: checkLogin
    }
});