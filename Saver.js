const fs = require("fs");

function getCurrentDateString() {
    let date = new Date();
    return date.getUTCFullYear() + "-" + date.getUTCMonth() + "-" + date.getUTCDate();
}
module.exports.getCurrentDateString = getCurrentDateString;

module.exports.Saver = class Saver {
    saveFolderPath = "";

    constructor(saveFolderPath) {
        if(saveFolderPath == undefined)
            throw new Error("Cannot create a Saver without a saveFolderPath");

        
        this.saveFolderPath = saveFolderPath;
        while(this.saveFolderPath[this.saveFolderPath.length - 1] == '/')
            this.saveFolderPath = this.saveFolderPath.slice(0, -1);
    }

    // TODO
    // resetAndLoad(account) {
    //     account.reset();
    //     this.load(account);
    // }

    load(account) {
        let rawSaveData = fs.readFileSync(this.saveFolderPath + "/save.json");
        let saveObject = JSON.parse(rawSaveData.toString());

        account.loadSaveObject(saveObject);
    }

    save(account) {
        let accountSaveObject = account.getSaveObject();

        let filePath = this.saveFolderPath + "/save.json"; 
        let backupPath = this.saveFolderPath + "/backups/save_backup" + getCurrentDateString() + ".json";
        fs.writeFileSync(filePath, JSON.stringify(accountSaveObject));
        fs.writeFileSync(backupPath, JSON.stringify(accountSaveObject));
    }
}