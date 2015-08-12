/**
 * Created by User on 02.06.2015.
 */

var SessionHandler = require('./sessions');

var Admin = function(db){
    var Admin = db.model('admin');
    var session = new SessionHandler(db);

    this.logIn = function(req, res, next) {
        var body = req.body;
        var err;

        if (!body || !body.login || !body.pass) {
            err = new Error('Invalid input parameters');
            err.status = 400;
            return next(err);
        } else {
            Admin.findOne({login: body.login, pass: body.pass}, function (err, resultUser) {
                if (err) {
                    return next(err);
                }

                if (!resultUser) {
                    res.status(403).send({error: "Wrong login or password"});
                } else {
                    session.register(req, res, resultUser, true);
                }
            });
        }
    };

    this.logOut = function (req, res, next){
        session.kill(req, res, next);
    };

    this.checkLogIn =function(req, res, next){
        var userId = req.session.uId;

        Admin.findOne({_id: userId}, function(err, result){
            if (err){
                return next(err);
            }

            if (!result){
                err = new Error('User not found');
                err.status = 400;
                return next(err);
            }

            res.status(200).send(result);

        });
    }

};

module.exports = Admin;