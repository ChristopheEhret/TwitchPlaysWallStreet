//@ts-check

const express = require("express");
const http = require("http");

module.exports.HTTPServer = class HTTPServer {
    port = 0;

    /** @type {(text: string) => void} */
    scrollingTextCallback;
    /** @type {(cash: number) => void} */
    giveCashCallback;
    /** @type {(goal: number) => void} */
    profitGoalCallback;
    /** @type {() => void} */
    reloadConfigCallback;
    /** @type {() => void} */
    reloadMessagesCallback;
    filesFolder = "";

    app;
    
    /**
     * 
     * @param {string} filesFolder
     * @param {number} port 
     * @param {(text: string) => void} scrollingTextCallback 
     * @param {(cash: number) => void} giveCashCallback 
     * @param {(cash: number) => void} profitGoalCallback 
     */
    constructor(filesFolder, port, scrollingTextCallback, giveCashCallback, profitGoalCallback) {
        if(typeof(filesFolder) != "string")
            throw new Error("Cannot create a server with a filesFolder that is not a string");
        this.filesFolder = filesFolder;
        
        if(!Number.isInteger(port))
            throw new Error("Cannot create a server with a port that is not a number");
        this.port = port;

        this.scrollingTextCallback = scrollingTextCallback;
        this.giveCashCallback = giveCashCallback;
        this.profitGoalCallback = profitGoalCallback;

        this.app = express();
        this.app.use(express.urlencoded());
        // TODO when will use JSON
        // this.app.use(express.json());
        this.app.use(express.static(filesFolder));
        this.app.use("/back", express.static(filesFolder + "/back.html"));

        this.app.post("/give_cash", (req, res) => {
            let cash = Number(req.body.cash);
            if(!Number.isNaN(cash)) {
                this.giveCashCallback(cash);
            } else {
                // ERROR
            }
            res.redirect("/back");
        });

        this.app.post("/scrolling_text", (req, res) => {
            let text = req.body.text;
            this.scrollingTextCallback(text);
            res.redirect("/back");
        });

        this.app.post("/goal", (req, res) => {
            let goal = Number(req.body.goal);
            if(!Number.isNaN(goal)) {
                this.profitGoalCallback(goal);
            } else {
                // ERROR
            }
            res.redirect("/back");
        });

        this.app.post("/reloadConfig", (req, res) => {
            if(this.reloadConfigCallback) {
                this.reloadConfigCallback();
            }
            res.redirect("/back");
        });

        this.app.post("/reloadMessages", (req, res) => {
            if(this.reloadMessagesCallback) {
                this.reloadMessagesCallback();
            }
            res.redirect("/back");
        });
    }

    /**
     * 
     * @param {() => void} callback 
     */
    launch(callback) {
        this.app.listen(this.port, callback);
    }
}