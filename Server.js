/** @typedef {import("./Account").Account} Account */
const { HTTPServer } = require("./HTTPServer");
const { WSServer } = require("./WSServer");

module.exports.Server = class Server {
    /** @type {Account} */
    account;
    httpServer;
    wsServer;

    // scrollingText = "";

    constructor(account, httpServerFolder, port = 8080, wssPort = 8000) {
        if(typeof(account) != "object")
            throw new Error("Cannot create an server without a correct account");
        this.account = account;
        
        this.httpServer = new HTTPServer(httpServerFolder, port, 
                                (text)=>{this.setScrollingTextCallback(text)}, 
                                (cash)=>{this.giveCashCallback(cash)},
                                (goal)=>{this.updateProfitGoal(goal)});

        this.httpServer.reloadConfigCallback = () => {this.reloadConfigCallback()};
        this.httpServer.reloadMessagesCallback = () => {this.reloadMessagesCallback()};

        this.wsServer = new WSServer(wssPort);
        this.wsServer.leaderboard = account.leaderboard;
    }

    /**
     * 
     * @param {() => void} HTTPCallback 
     * @param {() => void} WSCallback 
     */
    launch(HTTPCallback, WSCallback) {
        this.httpServer.launch(HTTPCallback);
        this.wsServer.launch(WSCallback);
    }

    setScrollingTextCallback(scrollingText) {
        // this.scrollingText = scrollingText;
        console.log(`scrolling text!! ${scrollingText}`);
        this.wsServer.sendScrollingText(scrollingText);
    }

    giveCashCallback(cashToGive) {
        console.log(`New cash ${cashToGive}`);

        this.account.cash += cashToGive;
        this.account.givenCash += cashToGive;
    }

    updateProfitGoal(newGoal) {
        console.log(`New goal ${newGoal}`);

        this.account.profitGoal = newGoal;
    }

    reloadConfigCallback() {
        this.account.loadConfig();
    }

    reloadMessagesCallback() {
        this.account.twitchBot.loadMessages();
    }
}