class TrendingList {
    list;
    
    constructor(list_id="trending_list") {
        this.list = document.getElementById(list_id);
    }

    updateList(data) {
        let list_str = "";
        for(let i = 0; i < data.length; i++) {
            let item = data[i];
            list_str += `<div class="top_element">
                <div class="inner_top symbol"><p class="p_inner_top">${item.symbol}</p></div>
                <div class="inner_top"><p class="p_inner_top">${item.price.toFixed(2)}$</p></div>
                <div class="inner_top"><p class="p_inner_top"><span style="color:${get_text_color(item.changeRatio)}">${item.changeRatio>0?"+":""}${item.changeRatio.toFixed(2)}%</span></p></div>
            </div>`;
        }
        
        this.list.innerHTML = list_str;
        this.list.style.flex = data.length;
    }
}