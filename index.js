const botconfig = require ("./botconfig.json");
const token = botconfig.token;
const Discord = require("discord.js");
const bot = new Discord.Client();
const mongoose = require('mongoose');
const { Permissions } = require('discord.js');
mongoose.connect('mongodb://localhost/spotifyDB', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
});

const permissions = new Permissions([
	'MANAGE_CHANNELS',
	'EMBED_LINKS',
	'ATTACH_FILES',
	'READ_MESSAGE_HISTORY',
	'MANAGE_ROLES',
]);

bot.login(token);
var OnReady = require('./Models/onReady.js');
var TextFile = require('./Models/textFile.js');
var Account = require('./Models/Account.js');
var messageLoad;
global.INTERVAL_STOCK = 20000;

process.on('unhandledRejection', (reason) => {
    console.log('Error Unhandled')
    console.log(reason);
})
  
process.on('uncaughtException', (reason) => {
    console.error('There was an uncaught error')
    console.log(reason);
})
console.log("STARTING APP");
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("DB OPENED::");
	var Schema = mongoose.Schema;

	var AccountSchema = new Schema({
        email:  { type: String, unique: true },
        password: String,
        country: String,
        subscription: String,
        status: { type: Boolean, default: true },
        renovationDate: { type: String, default: 'External' },
        date: { type: Date, default: Date.now },
        token: {type: String},
        address: {type: String},
        canInvite: {type: Boolean}
    },{ strict: false });

	global.AccountModel = mongoose.model('Accounts', AccountSchema);

    var onReady = new OnReady(bot);
    onReady.startBot();

    bot.on("message", message => {
        let prefix = botconfig.prefix;
        let messageArray = message.content.split(" ");
        let cmd = messageArray[0];
        console.log("CMD EXECUTED::", cmd, `${prefix}CMD`);
        if (message.channel.type != 'dm') {
            if(message.member.hasPermission('ADMINISTRATOR')) {
                var textFile = new TextFile(bot,message);
                textFile.readText();
                if(cmd == `${prefix}spotify` || cmd == `${prefix}s`) {
                    message.reply('Searching for an account').then(messageLoad =>{
                        Account.prototype.getAccount(message,messageLoad);
                    })
                }
            }
        }
    })
})



