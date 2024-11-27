/** @typedef {import("./Account").Account} Account */
/** @typedef {import("./StockPrice").StockPrice} StockPrice */
const WebSocket = require("ws");

module.exports.WSServer = class WSServer {

    /** @type {Number} */
    port;

    /** @type {WebSocket.Server} */
    wsServer;

    /** @type {Set<WebSocket>} */
    wsConnections = new Set();

    /** @type {String} */
    scrollingText = 'ඞ';
    // OU 
    // scrollingText;

    leaderboard;

    /**
     * @param {Number} port
     */
    constructor(port) {
        this.port = port;
    }

    /**
     * 
     * @param {() => void} callback 
     */
    launch(callback) {
        this.wsServer = new WebSocket.Server({ port: this.port}, callback);
        this.wsServer.on("connection", (ws) => {this.onConnection(ws);});
    }

    /**
     * @param {WebSocket} wsConnection 
     */
    onConnection(wsConnection) {
        // @ts-ignore
        console.log("New WebSocket connection : " + wsConnection._socket.remoteAddress + " is connected!");
        
        this.wsConnections.add(wsConnection);
        wsConnection.onclose = (event) => {
            this.wsConnections.delete(wsConnection);
            // @ts-ignore
            console.log("Connection ended with : " + wsConnection._socket.remoteAddress);            
        };

        wsConnection.send(JSON.stringify({  type: "scrollingText",
                                            content: this.scrollingText }));

        wsConnection.send(JSON.stringify({  type: "leaderboard",
                                            content: JSON.stringify(this.leaderboard) }));        
    }

    /**
     * 
     * @param {Account} account 
     */
    sendPositionsList(account) {
        let positionsList = [];

        for(let sym in account.positions)
            positionsList.push(account.positions[sym].getSendObject());

        this.sendToAll("positionsList", JSON.stringify(positionsList));
        // Je crois pas que ce soit nécessaire mais on sait jamais
        positionsList = null;
    }

    /**
     * 
     * @param {Account} account 
     */
    sendLeaderboard(account) {
        // this.leaderboard = {
        //     ...account.leaderboard
        // }

        this.sendToAll("leaderboard", JSON.stringify(this.leaderboard));
    }

    /**
     * 
     * @param {Account} account 
     */
    sendAccountInfos(account) {
        // let lastProfitStr = JSON.stringify(account.lastProfits);
        let infos = {
            cash: account.cash,
            given_cash: account.givenCash,
            equity: account.equity,
            cashInStocks: account.cashInStocks,
            profit: account.profit,
            profitRatio: account.profitRatio,
            lastProfits: account.lastProfits,
            isMarketOpened: account.getMarketOpened(),
            profitGoal: account.profitGoal
        }

        this.sendToAll("accountInfos", JSON.stringify(infos));
        // Je crois pas que ce soit nécessaire mais on sait jamais
        infos = null;
    }

    sendScrollingText(text) {
        this.scrollingText = text;

        this.sendToAll("scrollingText", this.scrollingText);
    }

    /**
     * 
     * @param {Object[]} trendingSymbols 
     */
    async sendTrendingSymbols(trendingSymbols) {
        let sendList = [];
        
        for(let i = 0; i < trendingSymbols.length; i++) {
            let price = trendingSymbols[i].price;

            await price.promise;

            sendList.push({
                symbol: trendingSymbols[i].symbol,
                price: price.price,
                change: price.change,
                changeRatio: price.changeRatio
            });
        }

        this.sendToAll("trendingSymbols", JSON.stringify(sendList));
        // TODO: check fuites mémoire?
    }

    sendOrder(order, profit) {
        let sendObject = {
            sideBuy: order.sideBuy,
            symbol: order.symbol,
            username: order.username,
            price: order.price.price,
            profit: profit
        };

        this.sendToAll("order", JSON.stringify(sendObject));
        sendObject = null;
    }

    sendToAll(type, content) {
        for(let c of this.wsConnections) {
            if(c.readyState == WebSocket.OPEN) {
                c.send(JSON.stringify({ type: type,
                                        content: content }));
            } else {
                this.wsConnections.delete(c);
            }
        }
    }
}