class LeaderboardManager {
    leaderboardElem;

    constructor(leaderboardElemName = "leaderboard") {
        this.leaderboardElem = document.getElementById(leaderboardElemName);
    }

    updateEntry(username, leaderboard, entry, rank = -1) {
        let maxLen = 34;
        // TODO : fonction !!!
        let profitStr = `${leaderboard[username].profit >= 0?"+":""}${leaderboard[username].profit.toFixed(2)}$`;
            
        /** @type {string} */
        let usernameStr = username;
        if(profitStr.length + usernameStr.length > maxLen)
            usernameStr = usernameStr.substring(0, maxLen - profitStr.length - 3) + "...";

        if(rank != -1)
            entry.querySelector(".inner_leaderboard.rank").innerHTML = `#${rank}`;
        entry.querySelector(".inner_leaderboard.username").innerHTML = usernameStr;
        if(leaderboard[username].profit > 0) {
            entry.querySelector(".inner_leaderboard.profit").innerHTML = `<span style="color: ${green_color}">${profitStr}</span>`;
        } else if(leaderboard[username].profit < 0) {
            entry.querySelector(".inner_leaderboard.profit").innerHTML = `<span style="color: ${red_color}">${profitStr}</span>`;
        } else {
            entry.querySelector(".inner_leaderboard.profit").innerHTML = profitStr;
        }
    }

    updateLeaderboard(leaderboard) {
        let leaderboardSortedArray = [];
        for(let username in leaderboard) {
            leaderboardSortedArray.push([username, leaderboard[username].rank]);
        }

        leaderboardSortedArray.sort((a, b) => {
            return a[1] - b[1];
        });

        let entries = this.leaderboardElem.querySelectorAll(".leaderboard_entry");
        if(entries.length != 8) {
            console.error("Leaderboard entries count is not 8");
        }

        
        for(let i = 0; i < leaderboardSortedArray.length && i < 3; i++) {
            // TODO : fonction !!!
            // let profitStr = `${leaderboardSortedArray[i][1] >= 0?"+":""}${leaderboardSortedArray[i][1].toFixed(2)}$`;
            
            // /** @type {string} */
            // let usernameStr = leaderboardSortedArray[i][0];
            // if(profitStr.length + usernameStr.length > maxLen)
            //     usernameStr = usernameStr.substring(0, maxLen - profitStr.length - 3) + "...";

            // entries[i+1].querySelector(".inner_leaderboard.username").innerHTML = usernameStr;
            // if(leaderboardSortedArray[i][1] > 0) {
            //     entries[i+1].querySelector(".inner_leaderboard.profit").innerHTML = `<span style="color: ${green_color}">${profitStr}</span>`;
            // } else if(leaderboardSortedArray[i][1] < 0) {
            //     entries[i+1].querySelector(".inner_leaderboard.profit").innerHTML = `<span style="color: ${red_color}">${profitStr}</span>`;
            // } else {
            //     entries[i+1].querySelector(".inner_leaderboard.profit").innerHTML = profitStr;
            // }

            this.updateEntry(leaderboardSortedArray[i][0], leaderboard, entries[i+1])
        }
        
        let num = Math.min(3, leaderboardSortedArray.length - 3);
        if(num > 0) {
            let beg = leaderboardSortedArray.length - num;
            for(let i = beg; i < leaderboardSortedArray.length; i++) {
                // TODO : fonction !!!
                // let profitStr = `${leaderboardSortedArray[i][1] >= 0?"+":""}${leaderboardSortedArray[i][1].toFixed(2)}$`;
                
                // /** @type {string} */
                // let usernameStr = leaderboardSortedArray[i][0];
                // if(profitStr.length + usernameStr.length > maxLen)
                //     usernameStr = usernameStr.substring(0, maxLen - profitStr.length - 3) + "...";

                // entries[5 + (i - beg)].querySelector(".inner_leaderboard.rank").innerHTML = `#${i + 1}`;
                // entries[5 + (i - beg)].querySelector(".inner_leaderboard.username").innerHTML = usernameStr;
                // if(leaderboardSortedArray[i][1] > 0) {
                //     entries[5 + (i - beg)].querySelector(".inner_leaderboard.profit").innerHTML = `<span style="color: ${green_color}">${profitStr}</span>`;
                // } else if(leaderboardSortedArray[i][1] < 0) {
                //     entries[5 + (i - beg)].querySelector(".inner_leaderboard.profit").innerHTML = `<span style="color: ${red_color}">${profitStr}</span>`;
                // } else {
                //     entries[5 + (i - beg)].querySelector(".inner_leaderboard.profit").innerHTML = profitStr;
                // }

                this.updateEntry(leaderboardSortedArray[i][0], leaderboard, entries[5 + (i - beg)], i+1)
            }
        }
    }
}