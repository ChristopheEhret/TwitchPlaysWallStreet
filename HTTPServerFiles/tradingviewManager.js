// @ts-nocheck

class TradingViewManager{
    container;
    widget_id;
    span;
    widget = undefined;

    constructor(widgetContainer_id = "tradingview-widget-container", widget_id = "tradingview_81176", symbolSpan_id="rnd_symbol") {
        this.container = document.getElementById(widgetContainer_id);
        this.widget_id = widget_id;
        this.span = document.getElementById(symbolSpan_id);

        setInterval(() => {this.update();}, 60000);
        this.update();
    }

    update() {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", 'http://www.randstock.ca/rand-nyse', false ); // false for synchronous request
        xmlHttp.send(null);
        let newSymbol = xmlHttp.responseText;

        // xmlHttp.open("GET", `https://fr.tradingview.com/symbols/NYSE-${newSymbol}`, false ); // false for synchronous request
        // xmlHttp.send(null);
        // console.log(xmlHttp.responseText);

        if(this.widget) {
            delete this.widget;
        }

        this.widget = new TradingView.MediumWidget(
            {
                "symbols": [
                    [
                        newSymbol
                    ]
                ],
                "chartOnly": false,
                "width": document.getElementsByClassName("rnd_chart")[0].getBoundingClientRect().width,
                "height": document.getElementsByClassName("rnd_chart")[0].getBoundingClientRect().height,
                "locale": "en",
                "colorTheme": "dark",
                "gridLineColor": "rgba(42, 46, 57, 0)",
                "fontColor": "#787b86",
                "isTransparent": true,
                "autosize": false,
                "showFloatingTooltip": true,
                "showVolume": false,
                "scalePosition": "no",
                "scaleMode": "Normal",
                "fontFamily": "'Courier New', Courier, monospace",
                "noTimeScale": false,
                "chartType": "area",
                "lineColor": "rgba(41, 98, 255, 0.71)",
                "bottomColor": "rgba(41, 98, 255, 0)",
                "topColor": "rgba(41, 98, 255, 0.3)",
                "container_id": this.widget_id
            }
        );

        this.span.innerHTML = newSymbol;
    }
}

// const a = new TradingView.MediumWidget(
//     {
//         "symbols": [
//             [
//                 "TSLA"
//             ]
//         ],
//         "chartOnly": false,
//         "width": document.getElementsByClassName("rnd_chart")[0].getBoundingClientRect().width,
//         "height": document.getElementsByClassName("rnd_chart")[0].getBoundingClientRect().height,
//         "locale": "en",
//         "colorTheme": "dark",
//         "gridLineColor": "rgba(42, 46, 57, 0)",
//         "fontColor": "#787b86",
//         "isTransparent": true,
//         "autosize": false,
//         "showFloatingTooltip": true,
//         "showVolume": false,
//         "scalePosition": "no",
//         "scaleMode": "Normal",
//         "fontFamily": "'Courier New', Courier, monospace",
//         "noTimeScale": false,
//         "chartType": "area",
//         "lineColor": "rgba(41, 98, 255, 0.71)",
//         "bottomColor": "rgba(41, 98, 255, 0)",
//         "topColor": "rgba(41, 98, 255, 0.3)",
//         "container_id": "tradingview_81176"
//     }
// );

// setTimeout(() => {
//     var xmlHttp = new XMLHttpRequest();
//     xmlHttp.open( "GET", 'http://www.randstock.ca/rand-nyse', false ); // false for synchronous request
//     xmlHttp.send(null);
//     console.log(xmlHttp.responseText);
// }, 3000);