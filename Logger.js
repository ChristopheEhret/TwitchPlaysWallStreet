const fs = require('fs');
const { getCurrentDateString } = require('./Saver');

module.exports.Logger = class Logger {
    logFolderPath = "";
    
    constructor(logFolderPath) {
        if(logFolderPath == undefined)
            throw new Error("Cannot create a Logger without a logFolderPath");

        
        this.logFolderPath = logFolderPath;
        while(this.logFolderPath[this.logFolderPath.length - 1] == '/')
            this.logFolderPath = this.logFolderPath.slice(0, -1);
    }

    currentOrderLog = "";
    currentAccountLog = "";

    orderCount = 0;
    logOrder(order, completed = true) {
        this.currentOrderLog += `${order.username} ${order.symbol} ${order.sideBuy}`;

        if(order.price.valid) {
            this.currentOrderLog += ` ${order.price.valid} ${order.price.price}`;
        } else {
            this.currentOrderLog += ` ${order.price.valid} 0`;
        }
        
        this.currentOrderLog += ` ${completed}\n`;
        this.orderCount ++;
    }

    doLogAccount = false;
    logAccount(account) {
        let accountLog = `${account.equity} ${account.cash} ${account.givenCash}`;
        if(accountLog != this.currentAccountLog) {
            this.currentAccountLog = accountLog;
            this.doLogAccount = true;
        }
    }

    flush() {
        let date = Date.now();

        if(this.orderCount > 0) {
            let orderFilePath = this.logFolderPath + `/orders/log_orders_${getCurrentDateString()}.log`;

            this.currentOrderLog = `# ${date} ${this.orderCount}\n` + this.currentOrderLog;
            fs.appendFileSync(orderFilePath, this.currentOrderLog);

            this.currentOrderLog = "";
            this.orderCount = 0;
        }

        if(this.doLogAccount) {
            let accountFilePath = this.logFolderPath + `/account/log_account_${getCurrentDateString()}.log`;

            let accountLog = `# ${date} ` + this.currentAccountLog + "\n";
            fs.appendFileSync(accountFilePath, accountLog);

            this.doLogAccount = false;
        }
    }

    reset() {
        this.orderCount = 0;
        this.currentOrderLog = "";
        this.doLogAccount = false;
        this.currentAccountLog = "";
    }
}