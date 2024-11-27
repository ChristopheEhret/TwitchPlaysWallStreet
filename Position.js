// module.exports.Position = function Position(symbol, price) {
//     if(symbol == undefined || price == undefined)
//         new Error("Cannot declare a Position without a symbol, a price and a side");

//     this.symbol = symbol;
//     this.price = price;
//     this.price.useCount++;

//     this.qty = 0;
//     this.currentPrice = 0;
//     this.totalPrice = 0;
//     this.costs = [];
//     this.cost_basis = 0;
//     this.profit = 0;
//     this.profitRatio = 0;

//     this.lastPrice = undefined;
//     this.priceRising = undefined;

//     this.update = updatePosition;
// }

// async function updatePosition() {
//     this.price.update();
//     await this.price.promise;

//     if(!this.price.valid)
//         throw new Error("Invalid position : " + this.price.reason + "; symbol " + this.price.symbol);

//     this.currentPrice = this.price.price;
//     this.totalPrice = this.price.price * this.qty;

//     this.cost_basis = 0;
//     this.costs.forEach((cost) => {this.cost_basis += cost;});

//     this.profit = this.totalPrice - this.cost_basis;
//     this.profitRatio = (this.profit / this.cost_basis) * 100;

//     if(this.lastPrice != undefined) {
//         this.priceRising = (this.currentPrice >= this.lastPrice);
//     }

//     this.lastPrice = this.currentPrice;
// }

module.exports.Position = class Position {
    constructor (symbol, price) {
        if(symbol == undefined || price == undefined)
            new Error("Cannot declare a Position without a symbol and a price");

        this.symbol = symbol;
        this.price = price;
        this.price.useCount++;

        this.qty = 0;
        this.currentPrice = 0;
        this.totalPrice = 0;
        this.costs = [];
        this.totalCost = 0;
        this.profit = 0;
        this.profitRatio = 0;

        this.is_up = false;
        this.is_down = false;

        // TODO : le laisser au client
        // this.lastPrice = undefined;
        // this.priceRising = undefined;
    }

    async update() {
        this.price.update();
        await this.price.promise;

        if(!this.price.valid) 
            throw new Error("Invalid position : " + this.price.reason + "; symbol " + this.price.symbol);

        this.currentPrice = this.price.price;
        this.totalPrice = this.currentPrice * this.qty;

        this.totalCost = 0;
        this.costs.forEach((cost) => {this.totalCost += cost;});

        this.profit = this.totalPrice - this.totalCost;
        this.profitRatio = (this.profit / this.totalCost) * 100;

        this.is_up = this.price.is_up;
        this.is_down = this.price.is_down;
    }

    getSaveObject() {
        let saveObject = {
            symbol: this.symbol,
            costs: [...this.costs],
            qty: this.qty
        }

        return saveObject;
    }

    getSendObject() {
        let sendObject = {
            symbol: this.symbol,
            price: this.currentPrice,
            qty: this.qty,
            profit: this.profitRatio,
            is_up: this.is_up,
            is_down: this.is_down
        }

        return sendObject;
    }
}