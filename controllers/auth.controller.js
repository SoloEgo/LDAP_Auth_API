const config = require("../config/auth.config")
const db = require("../models")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const { authenticate } = require('ldap-authentication');
const ldapConfig = require("../config/ldap.config");
const authConfig = require("../config/auth.config")

const User = db.user

exports.signin = async (req, res) => {
    //getting credintails
    let login = req.body.login
    let password = req.body.password

    //options to get topUser of LDAP
    let options = {
        ldapOpts: {
            url: ldapConfig.URL,
        },
        userDn: ldapConfig.USERDN,
        userPassword: ldapConfig.USERPASSWORD,
        userSearchBase: ldapConfig.USERSEARCHBASE,
        usernameAttribute: ldapConfig.USERNAMEATTRIBUTE,
        username: login,
    }

    //start checking user via LDAP
    try {
        let user = await authenticate(options)
        let checkOptions = {
            ldapOpts: {
                url: ldapConfig.URL,
            },
            userDn: user.dn,
            userPassword: password,
            userSearchBase: ldapConfig.USERSEARCHBASE,
            usernameAttribute: ldapConfig.USERNAMEATTRIBUTE,
            username: login,
            attributes: []
        }
        try {
            let userCheck = await authenticate(checkOptions)
            let userName = userCheck.name
            userPhoto = new Buffer.from(userCheck.thumbnailPhoto).toString('base64');
            User.findOne({
                login: login
            }).exec(async (err, user) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }
                if (!user) {  // if user signIn for first time
                    const user = new User({
                        login: login,
                        firstDateSingIn: Math.floor(new Date().getTime() / 1000),
                        lastDateSingIn: Math.floor(new Date().getTime() / 1000)
                    });
                    user.save(err => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }
                    });
                } else { // if user already been in app then update last login date
                    let nowTime = Math.floor(new Date().getTime() / 1000)
                    let doc = await User.findOneAndUpdate({ login: login }, { lastDateSingIn: nowTime }, {
                        new: true
                    })
                }
            });

            //setting token for user
            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: authConfig.tokenExpire
            });

            // it's all ok sending result to front
            res.status(200).send({
                userFound: true,
                id: user._id,
                token: token,
                userName: userName,
                userPhoto: userPhoto
            });

        } catch (error) {
            //console.log('error -> ',error)
            res.status(404).send({
                userFound: false
            });
        }

    } catch (error) {
        //console.log('error -> ', error)
        res.status(404).send({
            userFound: false
        });
    }
}

exports.checkToken = async (req, res) => {
    res.status(200).send({
        authorized: true
    })
}