const yahooFinance = require("yahoo-finance2").default;
const Alpaca = require('@alpacahq/alpaca-trade-api');

module.exports.StockPrice = class StockPrice {
    useCount = 0;

    /**@type {string} */
    symbol = "";
    price = 0;
    change = 0;
    changeRatio = 0;

    // promise = new Promise((resolve, reject) => {resolve();});
    updating = false;
    valid = false;

    is_up = false;
    is_down = false;

    alpacaAccount;

    constructor(symbol, alpacaAccount) {
        if(symbol == undefined)
            throw new Error("Cannot declare a StockPrice without a symbol");

        this.symbol = symbol;
        this.alpacaAccount = alpacaAccount;
        // this.update();
    }

    update() {
        if(this.updating)
            return;

        this.updating = true;  

        // this.promise = yahooFinance.quote(
        //     this.symbol,
        // ).then((quote) => {
        //     this.price = quote.regularMarketPrice;
        //     this.change = quote.regularMarketChange;
        //     this.changeRatio = quote.regularMarketChangePercent;
        //     this.is_up = (quote.regularMarketChange > 0);
        //     this.is_down = (quote.regularMarketChange < 0);

        this.promise = this.alpacaAccount.getSnapshot(this.symbol).then((snapshot) => {
            this.price = snapshot.LatestTrade.Price;
            this.day_begin_price = snapshot.DailyBar.OpenPrice;

            this.change = this.price - this.day_begin_price;
            this.changeRatio = this.change / this.day_begin_price;
            this.is_up = (this.change > 0);
            this.is_down = (this.change < 0);

            if(typeof this.price == 'number' && !isNaN(this.price)) {
                this.valid = true;
            } else {
                this.valid = false;
                this.reason = `quote.price.regularMarketPrice is not a number : ${this.price}`;
                this.price = undefined;
            }
        }
        ).catch((err) => {
            this.valid = false;
            console.log(`Error @ ${new Date()}`);
            console.log(err);
        });
    }

    resetUpdate() {
        this.updating = false;
    }
}