/**
 * LITTLE FELLA
 */

/**  {import("chart.js").Chart} Chart */

// import "chart.js"
// import Chart from "chart.js"

// TODO : le faire augmenter de taille très lentement au fur et à mesure
let little_fella = ['🯇', '🯅', '🯈', '🯅'];
let little_fella_index = 0;
let little_fella_div = document.getElementById("lil_dik");

if(little_fella_div) {
    setInterval(() => {
        little_fella_index = (little_fella_index + 1) % little_fella.length;
        little_fella_div.innerHTML = little_fella[little_fella_index];
    }, 150);
}

const red_color = "rgba(227,65,93,1.00)";
const green_color = "rgba(81,156,88,1.00)";

let sl = new ScrollingList(document.getElementById("list"));

function add_pos(i) {
    let div_str = `<div class="position">
        <div class="inner_pos symbol"><p class="p_inner_pos">TSLA${i}</p></div>
        <div class="inner_pos"><p class="p_inner_pos">${(Math.random() * 2000).toFixed(2)}</p></div>
        <div class="inner_pos"><p class="p_inner_pos">${(Math.random() * 100).toFixed(0)}</p></div>
        <div class="inner_pos"><p class="p_inner_pos">${(Math.random() * 400).toFixed(2)}%</p></div>    
    </div>`;
    sl.addElement(`${i}`, new DOMParser().parseFromString(div_str, 'text/html').body.firstElementChild)
}

// for(let i = 0; i < 15; i++) {
//     add_pos(i);
// }

// setInterval(() => {sl.update()},100);
// let a = setInterval(() => {
//     sl.removeElement(`${(Math.random()  * 15).toFixed(0)}`)
// }, 2000);

// setInterval(() => {
//     for(let i = 0; i < 10; i++) {
//         add_pos(i);
//     }
// }, 10000);


/*
🯅
🯆
🯇
🯈
*/

let positionsList = new PositionsList();
let trendingList = new TrendingList();
let ordersManager = new OrdersManager();
let chartManager = new ChartManager("MyChart");
let tradingViewManager = new TradingViewManager();
let audioManager = new AudioManager();
let leaderboardManager = new LeaderboardManager();

let ws = new WebSocket(`ws://${window.location.hostname}:8000`);

ws.onopen = () => {
    console.log("opened!!");
}

ws.onmessage = (msg) => {
    let data = msg.data;
    let req = JSON.parse(data);
    if(!("type" in req)) {
        console.log("Got message without a type : " + data);
        return;
    } 

    switch(req.type) {
        case "scrollingText":
            updateScrollingText(req.content);
            break;
        case "positionsList": 
            positionsList.update(JSON.parse(req.content));
            break;
        case "accountInfos":
            updateAccountInfos(JSON.parse(req.content));
            break;
        case "order":
            ordersManager.addOrder(JSON.parse(req.content));
            break;
        case "trendingSymbols":
            // trendingList.updateList(JSON.parse(req.content));
            break;
        case "leaderboard":
            leaderboardManager.updateLeaderboard(JSON.parse(req.content));
            break;
        default:
            console.error(`Unkown message type : ${req.type}`);
            break;
    }
}

function updateScrollingText(text) {
    document.getElementById("scrolling_text").innerHTML = text;
}

let profit_goal = 10000;
let currentisMarketOpened = undefined;

function updateAccountInfos(infos) {
    document.getElementById("cash_span").innerHTML = infos.cash.toFixed(2);
    document.getElementById("equity_span").innerHTML = infos.equity.toFixed(2);
    document.getElementById("starting_cash_span").innerHTML = infos.given_cash.toFixed(2);
    document.getElementById("stock_cash_span").innerHTML = infos.cashInStocks.toFixed(2);

    document.getElementById("profit_span").innerHTML = (infos.profit > 0?"+":"") + infos.profit.toFixed(2) + "$";
    document.getElementById("profit_ratio_span").innerHTML = (infos.profitRatio > 0?"+":"") + infos.profitRatio.toFixed(2) + "%";
    if(infos.profit > 0) {
        document.getElementById("profit_span").style.color = green_color;
        document.getElementById("profit_ratio_span").style.color = green_color;
    } else if (infos.profit < 0) {
        document.getElementById("profit_span").style.color = red_color;
        document.getElementById("profit_ratio_span").style.color = red_color;
    } else {
        document.getElementById("profit_span").style.color = "";
        document.getElementById("profit_ratio_span").style.color = "";
    }

    chartManager.update(infos.lastProfits);

    profit_goal = infos.profitGoal;
    if(profit_goal > 0) {
        document.getElementById("goal_span").innerHTML = "+" + profit_goal.toFixed(2) + "$";

        let profit_goal_ratio = infos.profit / profit_goal;

        document.getElementById("progress_bar").style.width = (profit_goal_ratio > 0)?(profit_goal_ratio * 100).toFixed(2) + "%":"0%";
        document.getElementById("goal_ratio_span").innerHTML = (profit_goal_ratio * 100).toFixed(2) + "%";
        if(profit_goal_ratio > 0) {
            document.getElementById("goal_ratio_span").style.color = green_color;
        } else {
            document.getElementById("goal_ratio_span").style.color = red_color;
        }
    }
    
    if(infos.isMarketOpened !== currentisMarketOpened) {
        currentisMarketOpened = infos.isMarketOpened;
        if(currentisMarketOpened) {
            document.getElementById("market_status_p").innerHTML = '🟢 <span class="green_text">OPEN</span> 🟢';
        } else {
            document.getElementById("market_status_p").innerHTML = '🔴 <span class="red_text">CLOSED</span> 🔴';
        }
    }
}

function setInnerHTML(elm, html) {
    elm.innerHTML = html;
    Array.from(elm.querySelectorAll("script")).forEach( oldScript => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes)
        .forEach( attr => newScript.setAttribute(attr.name, attr.value) );
      newScript.appendChild(document.createTextNode(oldScript.innerHTML));
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });
  }
  

// setInterval(() => {
//     // setInnerHTML(document.getElementById("tradingview-widget-container"), `<div class="tradingview-widget-container__widget"></div>
//     // <script type="text/javascript" src="tradingviewWidget.js" async>
//     // </script>`);

//     let newScript = document.createElement("script");
//     newScript.setAttribute("type", "text/javascript");
//     newScript.setAttribute("src", "tradingviewWidget.js");
//     newScript.setAttribute("async", "");
//     newScript.appendChild(document.createTextNode(`let a = {
//         "colorTheme": "dark",
//         "dateRange": "1D",
//         "exchange": "NYSE",
//         "showChart": false,
//         "locale": "en",
//         "largeChartUrl": "",
//         "isTransparent": true,
//         "showSymbolLogo": false,
//         "showFloatingTooltip": false,
//         "width": "100%",
//         "height": "100%"
//     }`));

//     document.getElementById("tradingview-widget-container").innerHTML = "";
//     document.getElementById("tradingview-widget-container").appendChild(newScript);

// }, 3600000);