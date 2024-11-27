//@ts-check

const { StockPrice } = require("./StockPrice");
const { TwitchOrder } = require("./TwitchOrder");
const { TwitchBot } = require("./TwitchBot");
const { Position } = require("./Position");
const { Saver } = require("./Saver");
const { Logger } = require("./Logger");
const { Server } = require("./Server");
const fs = require("fs");
const { WSServer } = require("./WSServer");
const heapdump = require('heapdump');

const yahooFinance = require("yahoo-finance2").default;
const Alpaca = require('@alpacahq/alpaca-trade-api');

// TODO : faire le market open + ajouter ligne pour faire la coupe entre ajd et les jours d'avant (/!\ save)
// const yahooFinance = require("yahoo-finance2").default;

// TODO : utilser JSDocs partout !! https://jsdoc.app/tags-type.html https://jsdoc.app/tags-param.html 

class Account {
    /** @type {TwitchOrder[]} */
    orders = []
    /** @type {Object.<string, StockPrice>} */
    prices = {}

    /** @type {Object.<string, Position>} */
    positions = {}

    /** @type {Object.<string, Object>} */
    leaderboard = {};
    leaderboardChanged = true;
    // ranks = {};

    givenCash = 1000;
    cash = this.givenCash;

    cashInStocks = 0;
    equity = this.cash;
    profit = 0;
    profitRatio = 0;
    profitGoal = 10000;

    /** @type {Object[]} */
    lastProfits = [];
    maxLastProfitsSize = 390;
    profitUpdateInterval = 60000; // In ms
    lastProfitUpdate = 0;

    /** @type {Object[]} */
    trendingSymbols = [];

    // Market data object??
    isMarketOpened = false;
    forceOpen = false;

    nextOpen = "";
    nextClose = "";

    /** @type {Saver} */
    saver;
    /** @type {Logger} */
    logger;
    /** @type {Server} */
    server;
    /** @type {Alpaca.default} */
    alpacaAccount;
    
    constructor() {
        // let keys = JSON.parse(fs.readFileSync("./not_secret_keys.json").toString());
        this.loadConfig();
        let keys = this.config.keys;
        
        let alpacaCreds = {
            keyId: 'PKLQ3C5G8I93R440XCHU',
            secretKey: keys.alpaca,
            paper: true,
            usePolygon: false
        };

        // @ts-ignore  
        this.alpacaAccount = new Alpaca(alpacaCreds);

        this.alpacaAccount.getAccount().then(() => {
            console.log("Connected to Alpaca!");
        });

        // Init Saver
        this.saver = new Saver("./saves");
        // Get last save
        this.saver.load(this);
        this.updateData();

        // Init Logger
        this.logger = new Logger("./logs");

        // Init twitch bot
        this.twitchBot = new TwitchBot(this, keys.twitch, this.config.channel);

        // Set HTTP server
        this.server = new Server(this, "HTTPServerFiles");
        this.server.launch( () => {console.log("Server HTTP lancé!!")}, 
                            () => {console.log("Server WebSocket lancé!!")});

        // Begin loop?? => ou alors dans app plutôt

        // TODO : initialiser une fonction callback qui sera lancée quand tous les éléments du compte sont chargés (save + updateData, bot twitch, serv HTTP)

        // TODO : faire ça dans une fonction genre "launchUpdate" 
        this.updateMarketOpen();
    }

    loadConfig() {
        this.config = JSON.parse(fs.readFileSync("./config.json").toString());
        this.forceOpen = this.config.forceOpen;
    }

    async updateMarketOpen() {
        let oldMarketOpen = this.isMarketOpened;

        // this.alpacaAccount.get

        await this.alpacaAccount.getClock().then((clk) => {
            this.isMarketOpened = clk.is_open;
            this.nextOpen = new Date(clk.next_open).toLocaleString("en-US", {timeZone: "America/New_York", year: '2-digit', month: '2-digit', day: '2-digit',  hour: '2-digit', minute:'2-digit'});
            this.nextClose = new Date(clk.next_close).toLocaleString("en-US", {timeZone: "America/New_York", year: '2-digit', month: '2-digit', day: '2-digit',  hour: '2-digit', minute:'2-digit'});
        }).catch((error) => {
            console.log("Error on updateMarketOpen : " + JSON.stringify(error));
        });

        if(oldMarketOpen != this.isMarketOpened) {
            console.log(`Market is now ${this.isMarketOpened ? "open" : "closed"}`);
            this.twitchBot.say("#" + this.config.channel, `Market is now ${this.isMarketOpened ? "open" : "closed"}`);
        }


        setTimeout(() => {this.updateMarketOpen()}, 60000);
    }

    getMarketOpened() {
        return this.isMarketOpened || this.forceOpen;
    }

    // TODO : connect => returns promise => resolved when all components are connected

    async update() {
        try {
            // Make orders
            await this.makeOrders();
            // Save 
            this.saver.save(this);
            // Update account positions + account equity + profit

            await this.updateData();
            this.logger.logAccount(this);
            this.logger.flush();

            this.server.wsServer.sendPositionsList(this);
            this.server.wsServer.sendAccountInfos(this);
            if(this.leaderboardChanged)
                this.updateLeaderBoard()
            
            // await this.server.wsServer.sendTrendingSymbols(this.trendingSymbols);
        } catch(error) {
            console.log(`Catched error ${new Date()}`);
            console.log(error);
            // TODO : reset (don't forget logger reset)
        }

        for(let price in this.prices)
            this.prices[price].resetUpdate();

        //this.updateTrendingSymobls();
        setTimeout(() => {this.launchPriceUpdate()}, 800);
        // TODO : à faire dans le launchPriceUpdate
        setTimeout(() => {this.update()}, 1000);

        // console.log(this.positions);
    }

    async updateData() {
        let equity = this.cash;
        let cashInStocks = 0;
                
        for(let i in this.positions) {
            await this.positions[i].update();
            equity += this.positions[i].totalPrice;
            cashInStocks += this.positions[i].totalPrice;
        }

        this.equity = equity;
        this.cashInStocks = cashInStocks;

        this.profit = this.equity - this.givenCash;
        this.profitRatio = (this.profit/this.givenCash) * 100;

        if(typeof this.profitRatio != 'number' || isNaN(this.profitRatio))
            this.profitRatio = 0;

        if(!this.getMarketOpened())
            return;

        let now = Date.now();
        if(now - this.lastProfitUpdate > this.profitUpdateInterval || this.lastProfits.length <= 0) {
            this.lastProfits.push({profit: this.profit.toFixed(2), date: now});
            if(this.lastProfits.length > this.maxLastProfitsSize) {
                this.lastProfits = this.lastProfits.splice(1);
            }
            
            this.lastProfitUpdate = now;
        } else {
            this.lastProfits[this.lastProfits.length - 1].profit = this.profit.toFixed(2);
        }
    }

    /**
     * 
     * @param {boolean} sideBuy 
     * @param {string} symbol 
     * @param {string} username 
     * @param {string} targetChannel 
     */
    placeOrder(sideBuy, symbol, username, targetChannel) {
        if(!this.getMarketOpened()) {
            this.twitchBot.say(targetChannel, `@${username} : Cannot place order : Market is closed. Next open : ${this.nextOpen}`);
            return;
        }

        if(sideBuy == undefined || symbol == undefined)
            new Error("Cannot place an order without a symbol, a price and a side");

        if(this.prices[symbol] == undefined) {
            this.prices[symbol] = new StockPrice(symbol, this.alpacaAccount);
        }

        this.prices[symbol].useCount++;
        let newOrder = new TwitchOrder(sideBuy, symbol, username, targetChannel, this.prices[symbol]);
        this.orders.push(newOrder);

        // console.log(`new order ${newOrder}`);
    }

    async makeOrders() {
        let ordersInMaking = this.orders;
        this.orders = [];

        for(let orderIndex in ordersInMaking) {
            let order = ordersInMaking[orderIndex];
            order.price.update();

            // Pose des ralentissements si l'order a été placé entre laucnhPriceUpdate et update !!
            await order.price.promise;

            let profit = undefined;

            if(!order.price.valid) {
                // Log that the price is not valid
                this.logger.logOrder(order, false);

                console.log("Could not buy " + order.symbol + " : not a valid symbol");
                this.twitchBot.say(order.targetChannel, `${order.username} : ${order.symbol} is not a valid symbol.`);
            } else {
                let price = order.price.price;
                let symbol = order.symbol;
                let position = this.positions[symbol];

                let orderCompleted = false;
                if(order.sideBuy) {
                    if(position == undefined || position.qty >= 0) {
                        if(this.cash > price) {
                            this.cash -= price;
    
                            if(position == undefined) {
                                // TODO
                                this.positions[symbol] = (position = new Position(symbol, order.price));
                            }
                            
                            position.qty++;
                            position.costs.push(price);
                            orderCompleted = true;
                        } else {
                            console.log("Could not buy " + order.symbol + " not enough cash");
                            this.twitchBot.say(order.targetChannel, `@${order.username} : Could not ${order.sideBuy?"buy":"sell"} ${order.symbol} : Not enough cash.`);
                        }
                    } else {
                        throw new Error(order.symbol + " has been short sold !!!");
                    }
                } else {
                    if(position == undefined || position.qty <= 0) {
                        console.log("Could not sell " + order.symbol + " : short selling is not allowed");
                        this.twitchBot.say(order.targetChannel, `@${order.username} : Could not ${order.sideBuy?"buy":"sell"} ${order.symbol} : Impossible to short sell a stock (for now).`);
                    } else {
                        this.cash += price;
    
                        position.qty--;
                        profit = price - position.costs[position.costs.length - 1];

                        if(this.leaderboard[order.username] == undefined)
                            this.leaderboard[order.username] = {profit: 0, rank: 0};

                        this.leaderboard[order.username].profit += profit;
                        this.leaderboardChanged = true;

                        position.costs = position.costs.slice(0, -1);
                        
                        if(position.qty <= 0) {
                            position.price.useCount--;
                            delete this.positions[symbol];
                        }
    
                        orderCompleted = true;
                    }
                }
                
                if(orderCompleted) {
                    console.log("Order completed :");
                    console.log(`@${order.username}; ${order.symbol} : ${order.price}; Side buy : ${order.sideBuy};`);
                    // Logs key elements of the order's price
                    console.log(`Price : ${order.price.price}; useCount : ${order.price.useCount}; valid : ${order.price.valid}; Symbol : ${order.price.symbol};`);
    
                    // this.twitchBot.say("#negeko", "aaaaaaaa");

                    this.twitchBot.say(order.targetChannel, `@${order.username} : Order completed; ${order.sideBuy?"bought":"sold"} ${order.symbol} @ ${order.price.price.toFixed(2)}`);

                    // TODO
                    //addAction(order, price);

                    this.logger.logOrder(order, true);

                    // TODO : le faire après (au cas où reset)
                    this.server.wsServer.sendOrder(order, profit);
                } else {
                    this.logger.logOrder(order, false);
                }
                // TODO
                //appendLog(order, price, createOrder, true);
            }

            order.price.useCount--;
        }
    }

    launchPriceUpdate() {
        for(let price in this.prices)
            if(this.prices[price].useCount < 0) {
                throw new Error(`Price useCount is negative!!; symbol : ${this.prices[price].symbol}`);
            } else if(this.prices[price].useCount == 0) {
                delete this.prices[price];
            } else {
                this.prices[price].update();
            }
    }

    getSaveObject() {
        let saveObject = {
            cash: this.cash,
            givenCash: this.givenCash,
            lastProfits: this.lastProfits,
            profitGoal: this.profitGoal
        }
        saveObject.positions = []

        for(let i in this.positions) {
            saveObject.positions.push(this.positions[i].getSaveObject());
        }

        saveObject.leaderboard = {
            ...this.leaderboard
        };

        return saveObject;
    }

    loadSaveObject(saveObject) {
        this.cash = saveObject.cash;
        this.givenCash = saveObject.givenCash;

        if(saveObject.profitGoal != undefined)
            this.profitGoal = saveObject.profitGoal;

        for(let i in saveObject.positions) {
            let pos = saveObject.positions[i];
            // pos.symbol = pos.symbol.toUpperCase();

            let price = new StockPrice(pos.symbol, this.alpacaAccount);
            this.prices[pos.symbol] = price;

            let position = new Position(pos.symbol, price);
            // Mettre ça dans une fonction de Position
            position.qty = pos.qty;
            position.costs = pos.costs;
            this.positions[pos.symbol] = position;
        }

        if(saveObject.lastProfits) {
            this.lastProfits = saveObject.lastProfits;
        }

        if(saveObject.leaderboard) {
            this.leaderboard = {
                ...saveObject.leaderboard
            };
        }
    }
    
    updateTrendingSymobls() {
        yahooFinance.trendingSymbols("US", {count: 10}).then((symbols) => {
            for(let i = 0; i < this.trendingSymbols.length; i++) {
                this.trendingSymbols[i].price.useCount--;
                // TODO : sûrement inutile et très dangereux
                delete this.trendingSymbols[i];
            }

            this.trendingSymbols = [];
            for(let i = 0; i < symbols.quotes.length && this.trendingSymbols.length < 5; i++) {
                let symbol = symbols.quotes[i].symbol;

                if(this.prices[symbol] == undefined) {
                    this.prices[symbol] = new StockPrice(symbol, this.alpacaAccount);
                }
        
                this.prices[symbol].useCount++;
                this.prices[symbol].update();
                this.trendingSymbols.push({
                    symbol: symbol,
                    price: this.prices[symbol]
                });
            }
        }).catch((err) => {
            console.log(`Error getting trending symbols : ${err}`);
        });
    }

    updateLeaderBoard() {
        this.leaderboardChanged = false;
        let leaderboardSortedArray = [];
        for(let user in this.leaderboard) {
            leaderboardSortedArray.push(user);
        }

        leaderboardSortedArray.sort((a, b) => {
            return this.leaderboard[b].profit - this.leaderboard[a].profit;
        });
        
        // this.ranks = {};
        for(let i = 0; i < leaderboardSortedArray.length; i++) {
            this.leaderboard[leaderboardSortedArray[i]].rank = i + 1;
        }

        this.server.wsServer.sendLeaderboard(this);
    }

    makeSnapshot() {
        heapdump.writeSnapshot(`./heapdump-${Date.now()}.heapsnapshot`);
    }
}

module.exports.Account = Account;

let account = new Account();
account.update();
