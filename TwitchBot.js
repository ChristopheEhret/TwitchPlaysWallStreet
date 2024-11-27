/** @typedef {import("./Account").Account} Account */
const tmi = require("tmi.js")
const fs = require("fs");

// TODO : config file
const prefix = '!';

// TODO : config file that can be reloaded
// const messages = 

module.exports.TwitchBot = class TwitchBot {
    commands = {
        "BUY": (...args) => {this.buy(...args)},
        "SELL": (...args) => {this.sell(...args)},
        "MARKET": (...args) => {this.marketState(...args)},
        "RANK": (...args) => {this.rank(...args)},
    }


    constructor(account, passwd, channel) {
        this.loadMessages();

        let opts = {
            identity: {
                // TODO : config file
                username: "thebotofwallstreet",
                password: passwd
            },
            channels: [
                // TODO : config file
                channel
            ]
        };
        
        this.twitchClient = tmi.client(opts);

        this.twitchClient.on('connected', (addr, port) => { this.onConnected(addr, port); });
        this.twitchClient.on('message', (target, context, msg, self) => { this.onMessage(target, context, msg, self); });

        this.twitchClient.connect();

        /** @type {Account} */
        this.account = account;
        this.channel = channel;
    }

    onConnected(addr, port) {
        console.log(`Twitch bot connected to ${addr}:${port}`);

        this.twitchClient.say("#" + this.channel, "Hello World");
    }

    onMessage(target, context, msg, self) {
        
        if(self) {
            console.log(`[${(new Date()).toLocaleString()}] SELF : ${msg}`);
            return;
        }

        console.log(`[${(new Date()).toLocaleString()}] ${context.username} : ${msg}`);

        // TODO : ajouter stat au logger

        if(msg[0] != prefix)
            return;

        msg = msg.slice(1);
        let cmd = msg.toUpperCase().split(" ");

        let cmdFunction = this.commands[cmd[0]]
        let message = this.messages[cmd[0]]

        if(cmdFunction != undefined)
            cmdFunction(target, cmd, context)
        else if(message != undefined)
            this.say(target, message)
        else
            console.log("Unknown command : " + cmd[0])

        // if(cmd.length != 2)
        //     return;

        // let sideBuy = (cmd[0] == "BUY");
        // if(!sideBuy && cmd[0] != "SELL")
        //     return;

        // this.account.placeOrder(sideBuy, cmd[1], context.username, target);
    }

    say(target, msg) {
        this.twitchClient.say(target, msg);
    }

    buy(target, cmd, context) {
        if(cmd.length != 2)
            return;

        this.account.placeOrder(true, cmd[1], context.username, target);
    }

    sell(target, cmd, context) {
        if(cmd.length != 2)
            return;

        this.account.placeOrder(false, cmd[1], context.username, target);
    }

    // say if market is closed with the nextOpen or opened with the nextClose
    marketState(target, cmd, context) {
        if(!this.account.getMarketOpened())
            this.say(target, "Market is closed, next open : " + this.account.nextOpen);
        else
            this.say(target, "Market is open, next close : " + this.account.nextClose);
    }

    rank(target, cmd, context) {
        if(this.account.leaderboard[context.username] == undefined) {
            this.say(target, "You are not in the leaderboard yet! Close a position with !sell to make or lose money and get on the leaderboard!");
        } else {
            let profitStr = `${this.account.leaderboard[context.username].profit>=0?"+":""}${this.account.leaderboard[context.username].profit.toFixed(2)}$`;
            this.say(target, `You are ranked #${this.account.leaderboard[context.username].rank}. Profit : ${profitStr}`);
        }
    }

    loadMessages() {
        this.messages = JSON.parse(fs.readFileSync("./messages.json").toString());
    }
}