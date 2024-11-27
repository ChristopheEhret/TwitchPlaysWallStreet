const up_arrow = '';
const down_arrow = '';

function get_text_color(value) {
    if(value > 0) {
        return green_color;
    } else if (value < 0) {
        return red_color;
    } else {
        return "";
    }
}

class PositionInfos {
    symbol = "";
    price = 0;
    old_price = 0;
    quantity = 0;
    profit = 0;

    is_up = false;
    is_down = false;

    raising_countdown = 0;
    falling_countdown = 0;    

    constructor(symbol) {
        this.symbol = symbol;
    }

    updateInfos(price, quantity, profit, is_up, is_down) {
        this.old_price = this.price;
        this.price = price;
        this.quantity = quantity;
        this.profit = profit;
        this.is_up = is_up;
        this.is_down = is_down;
    }

    getPriceSymbol() {
        // UP : &#9650; DOWN : &#9660;
        if(this.is_up) {
            return `<span style="color: ${green_color}">&#9650</span>`;
        } else if(this.is_down) {
            return `<span style="color: ${red_color}">&#9660</span>`;
        } else {
            return '-';
        }
    }

    getPriceSpan() {
        if(this.old_price < this.price || this.raising_countdown > 1) {
            if(this.old_price < this.price) {
                this.raising_countdown = 1;
                this.falling_countdown = 0;
            } else {
                this.raising_countdown--;
            }
            return `<span class="green_text">${this.price.toFixed(2)}$</span>`;
        } else if (this.old_price > this.price || this.falling_countdown > 1) {
            if(this.old_price > this.price) {
                this.falling_countdown = 1;
                this.raising_countdown = 0;
            } else {
                this.falling_countdown--;
            }

            return `<span class="red_text">${this.price.toFixed(2)}$</span>`;
        } else if(this.raising_countdown == 1) {
            this.raising_countdown--;
            return `<span class="anim_green">${this.price.toFixed(2)}$</span>`;
        } else if(this.falling_countdown == 1) {
            this.falling_countdown--;
            return `<span class="anim_red">${this.price.toFixed(2)}$</span>`;
        } 
        return `${this.price.toFixed(2)}$`;
    }

    getInnerHTML() {
        let div_str = `<div class="inner_pos symbol"><p class="p_inner_pos">${this.symbol}</p></div>
            <div class="inner_pos price"><p class="p_inner_pos">${this.getPriceSpan()} ${this.getPriceSymbol()}</p></div>
            <div class="inner_pos"><p class="p_inner_pos">${this.quantity.toFixed(0)}</p></div>
            <div class="inner_pos"><p class="p_inner_pos" style="color: ${get_text_color(this.profit)}">${(this.profit > 0?"+":"")}${this.profit.toFixed(2)}%</p></div>`;
        return div_str;
    }

    getNewElement() {
        let div_str = `<div class="position">
            <div class="inner_pos symbol"><p class="p_inner_pos">${this.symbol}</p></div>
            <div class="inner_pos price"><p class="p_inner_pos">${this.price.toFixed(2)}$ ${this.getPriceSymbol()}</p></div>
            <div class="inner_pos"><p class="p_inner_pos">${this.quantity.toFixed(0)}</p></div>
            <div class="inner_pos"><p class="p_inner_pos" style="color: ${get_text_color(this.profit)}">${(this.profit > 0?"+":"")}${this.profit.toFixed(2)}%</p></div>
        </div>`;
        return new DOMParser().parseFromString(div_str, 'text/html').body.firstElementChild;
    }
}

class PositionsList {
    /** @type {Object.<string, PositionInfos>} */
    positions = {};

    constructor(list_id="list") {
        let elem = document.getElementById(list_id);

        if(elem) {
            this.scList = new ScrollingList(elem);
            this.updateInterval = setInterval(() => {this.scList.update()},100);
        } else {
            console.error(`Scrolling list could not be created from element id ${list_id}`);
        }
    }

    update(positions_list) {
        if(!this.scList)
            return;

        let maintained_pos = new Set();
        for(let i = 0; i < positions_list.length; i++) {
            let sym = positions_list[i].symbol
            if(!(sym in this.positions)) {
                this.positions[sym] = new PositionInfos(sym);
            }

            let qtyChanged = positions_list[i].qty != this.positions[sym].quantity;
            this.positions[sym].updateInfos(positions_list[i].price, positions_list[i].qty, positions_list[i].profit, positions_list[i].is_up, positions_list[i].is_down);


            if(this.scList.contains(sym)) {
                this.scList.updateElement(sym, (elem) => {
                    elem.innerHTML = this.positions[sym].getInnerHTML();
                    if(qtyChanged) {
                        elem.style.animation = 'none';
                        elem.offsetHeight;
                        elem.style.animation = null;
                    }
                });
            } else {
                let elem = this.positions[sym].getNewElement();
                elem.classList.add("animation")
                this.scList.addElement(sym, elem);
            }

            maintained_pos.add(sym);
        }

        for(let pos in this.positions) {
            if(!maintained_pos.has(pos)) {
                this.scList.removeElement(pos);
            }
        }
    }
}