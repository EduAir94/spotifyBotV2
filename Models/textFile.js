var fs = require('fs');
var request = require('request');
var Account = require('./Account.js');
var Discord = require("discord.js");
var self;

function TextFile(bot,message) {
    self = this;
    self.message = message;
    self.bot = bot;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

var readFileFromURL = function(url,cb) {
    return new Promise(resolve => {
        var options = {
            url: url,
            method: 'GET'
        };
        request(options, (err, res, body) => {
            cb(err,res,body);
        })
    })
}

var splitOnce = function(str, delim) {
    var components = str.split(delim);
    var result = [components.shift()];
    if(components.length) {
        result.push(components.join(delim));
    }
    return result;
};

var checkAcc = function (account) {
    return new Promise(resolve => {
        account.checkAccount(function(accountDetails) {
            if(accountDetails) {
                resolve(accountDetails);
            } else {
                resolve('Error');
            }
        });
    });
}

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

TextFile.prototype.readText = async function() {
    if (!self.message.attachments || !self.message.attachments.first() || !self.message.attachments.first().url) {
        //this.message.reply("No Text File Attached");
    } else {
        self.message.reply("Reading Text File");
        var file = self.message.attachments.first().url;
        readFileFromURL(file, async function(err,res,body) {
            if (!err && body) {
                var accounts = body.split("\r\n");
                var email;
                var password;
                var account;
                for (let index = 0; index < accounts.length; index++) {
                    account = splitOnce(accounts[index],':');
                    email = account[0];
                    password = account[1];
                    console.log(email);
                    if(email && validateEmail(email)) {
                        var country = "Unkown";
                        var subscription = "Unkown";
                        var renovationDate = "Unkown";
                        var accountUpload = new Account(email, password, country, subscription, renovationDate);
                        var detailsAcc = await checkAcc(accountUpload);
                        if (detailsAcc != 'Bad') {
                            var embed = buildAccEmbed(detailsAcc);
                            self.message.reply(embed);
                        }
                    }
                };
            }
        });
    }
}

module.exports = TextFile;