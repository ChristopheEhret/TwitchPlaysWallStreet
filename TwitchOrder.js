module.exports.TwitchOrder = class TwitchOrder {
    constructor(sideBuy, symbol, username, targetChannel, price) {
        if(sideBuy == undefined || symbol == undefined || price == undefined)
            new Error("Cannot declare a TwitchOrder without a symbol, a price and a side");

        this.sideBuy = sideBuy;
        this.symbol = symbol;
        this.username = username;
        this.targetChannel = targetChannel; 
        this.price = price;
    }
}