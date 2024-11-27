class OrdersManager {
    /** @type {HTMLElement} */
    buyElem;

    /** @type {HTMLElement} */
    sellElem;
    
    constructor (buyElemName = "buys", sellElemName = "sells") {
        this.buyElem = document.getElementById("buys");
        this.sellElem = document.getElementById("sells");

        
        // let cookie = document.cookie.slice(document.cookie.search(";") + 1);
        // cookie = decodeURIComponent(cookie);
        // let cookies = cookie.split("\x1F");
        // if(cookies.length == 2) {   
        //     this.buyElem.innerHTML = cookies[0];
        //     this.sellElem.innerHTML = cookies[1];
        // }
    }

    addOrder(order) {
        if(order.sideBuy) {
            this.insertChild(this.buyElem, this.getBuyElem(order));
        } else {
            this.insertChild(this.sellElem, this.getSellElem(order));
        }
        
        let newCookie = encodeURIComponent(this.buyElem.innerHTML + "\x1F" + this.sellElem.innerHTML);
        document.cookie = encodeURIComponent(this.buyElem.innerHTML + "\x1F" + this.sellElem.innerHTML);
        console.log(newCookie);
    }

    /**
     * 
     * @param {HTMLElement} elem 
     * @param {Element} child 
     */
    insertChild(elem, child) {
        if(elem.firstChild) {
            elem.insertBefore(child, elem.firstChild);
        } else {
            elem.appendChild(child);
        }
    
        let children = elem.children;
        if(children.length > 0) {
            let last_child = children[children.length - 1];
    
            while(last_child.getBoundingClientRect().top <= elem.getBoundingClientRect().top) {
                last_child.remove();
                last_child = children[children.length - 1];
            }
        }
    }

    getBuyElem(order) {
        let elemStr = `<div class="order">
                    <span class="order_front">-</span>
                    <span class="order_content">${order.username} <span style="color: ${green_color}">bought</span> ${order.symbol} @${order.price.toFixed(2)}$</span>
                </div>`;
        
        return new DOMParser().parseFromString(elemStr, 'text/html').body.firstElementChild;
    }

    getSellElem(order) {
        let elemStr = `<div class="order">
                    <span class="order_front">-</span>
                    <span class="order_content">${order.username} <span style="color: ${red_color}">sold</span> ${order.symbol} @${order.price.toFixed(2)}$; <span style="color: ${(order.profit > 0)?(green_color):((order.profit < 0)?(red_color):"")}">${(order.profit >= 0)?"profit":"loss"} : ${order.profit.toFixed(2)}$</span></span>
                </div>`;
        
        return new DOMParser().parseFromString(elemStr, 'text/html').body.firstElementChild;
    }
}