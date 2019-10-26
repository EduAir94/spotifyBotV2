var Account = require('./Account.js');
var self;

function OnReady(bot) {
    self = this;
    self.bot = bot;
}

var setStatus = async function() {
    var stock = await Account.prototype.stock();
    self.bot.user.setPresence({ game: { name: `Stock: ${stock}` }, status: 'online' });
}

OnReady.prototype.startBot = function() {
    console.log("TRYING TO START BOT");
    self.bot.on("ready",async() => {
        console.log('Starting Bot');
        setStatus();
        setInterval(async function(){ 
            setStatus();
        }, INTERVAL_STOCK);
    })
}

module.exports = OnReady;
