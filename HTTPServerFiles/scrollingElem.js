class ScrollingElem {
    /** @type {HTMLElement} */
    mainElem;
    pos;

    /** @type {HTMLElement} */
    copyElem = undefined;
    copyPos;


    constructor(pos, element) {
        this.pos = pos;
        this.mainElem = element;
        this.mainElem.style.top = this.pos + "px";
    }

    update(step) {
        if(!this.mainElem)
            return;

        this.pos += step;
        this.mainElem.style.top = this.pos + "px";

        if(this.copyElem) {
            this.copyPos += step;
            this.copyElem.style.top = this.copyPos + "px";
        }

        if(this.mainElem.getBoundingClientRect().bottom < this.mainElem.parentElement.getBoundingClientRect().top) {
            if(!this.copyElem) {
                console.log("ELEMENT WILL BE DESTROYED WITH NO COPY !!!");
            }

            this.mainElem.remove();
            this.mainElem = this.copyElem;
            this.pos = this.copyPos;

            this.copyElem = undefined;
            this.copyPos = 0;
        }
    }

    needCopy() {
        return (this.mainElem.getBoundingClientRect().top < this.mainElem.parentElement.getBoundingClientRect().top) && !this.copyElem;
    }

    produceCopy(copyPos) {
        // @ts-ignore
        this.copyElem = this.mainElem.cloneNode(false);
        this.copyElem.innerHTML = this.mainElem.innerHTML;
        this.mainElem.parentElement.appendChild(this.copyElem);
        
        this.copyPos = copyPos; 
        this.copyElem.style.top = this.copyPos + "px";
    }

    getLowestPoint() {
        if(this.copyElem)
            return this.copyElem.getBoundingClientRect().bottom;
        return this.mainElem.getBoundingClientRect().bottom;
    }

    getNextElemPos() {
        if(this.copyElem)
            return this.copyPos + this.copyElem.getBoundingClientRect().height;
        return this.pos + this.mainElem.getBoundingClientRect().height;
    }

    updateElement(callbackFunction) {
        callbackFunction(this.mainElem);

        if(this.copyElem) {
            callbackFunction(this.copyElem);
        }
    }
}

// Only up for now
class ScrollingList {

    /** @type {HTMLElement} */
    listElement;

    /** @type {Object.<string, ScrollingElem>} */
    elements;

    constructor(listElement) {
        this.listElement = listElement;
        // if(this.listElement.firstChild.nodeType == "")
        this.elements = {};     
    }

    addElement(key, elem) {
        this.listElement.appendChild(elem);
        if(this.elements[key])
            this.removeElement(key);

        let lowsestElem = this.getLowestElem();
        if(lowsestElem)
            this.elements[key] = new ScrollingElem(lowsestElem.getNextElemPos(), elem);
        else
            this.elements[key] = new ScrollingElem(0, elem);

        // this.update();
    }

    removeElement(key) {
        let elementToRemove = this.elements[key];
        if(!elementToRemove)
            return;

        if(elementToRemove.copyElem)
            this.listElement.removeChild(elementToRemove.copyElem);
        delete this.elements[key];

        let sortedElements = [];
        for(let i in this.elements)
            sortedElements.push(this.elements[i]);
        sortedElements.sort((a, b) => {return a.pos - b.pos});
        
        if(this.getTotalHeight() < this.listElement.getBoundingClientRect().height) {
            let currPos = 0;
            for(let i = 0; i < sortedElements.length; i++) {
                sortedElements[i].pos = currPos;
                currPos += sortedElements[i].mainElem.getBoundingClientRect().height;
                if(sortedElements[i].copyElem) {
                    this.listElement.removeChild(sortedElements[i].copyElem);
                    sortedElements[i].copyElem = undefined;
                }
            }
        } else {
            // TODO : faire ça bien pour pas avoir de trous 
            let removedPos = elementToRemove.pos;
            let removedHeight = elementToRemove.mainElem.getBoundingClientRect().height;
            for(let i in this.elements) {
                let decrement_pos = 0;
                let decrement_copyPos = 0;
                
                if(this.elements[i].pos > removedPos) {
                    decrement_pos += removedHeight;
                }
                if(this.elements[i].copyElem && this.elements[i].copyPos > removedPos) {
                    decrement_copyPos += removedHeight;
                }

                if(elementToRemove.copyElem) {
                    if(this.elements[i].pos > elementToRemove.copyPos) {
                        decrement_pos += removedHeight;
                    }
                    if(this.elements[i].copyElem && this.elements[i].copyPos > elementToRemove.copyPos) {
                        decrement_copyPos += removedHeight;
                    }
                }

                this.elements[i].pos -= decrement_pos;
                if(this.elements[i].copyElem)
                    this.elements[i].copyPos -= decrement_copyPos;
            }
        }

        this.listElement.removeChild(elementToRemove.mainElem);
        this.update();
    }

    // TODO remove;

    update() {
        // console.log("aaaaaaaa");
        
        for(let i in this.elements) {
            if(this.getTotalHeight() < this.listElement.getBoundingClientRect().height)
                this.elements[i].update(0);
            else
                this.elements[i].update(-1);
        }

        for(let i in this.elements) {
            if(this.elements[i].needCopy()) {
                let copyPos = this.getLowestElem().getNextElemPos();
                this.elements[i].produceCopy(copyPos);
            }
        }
    }

    // TODO : on resize

    getLowestElem() {
        let lowest = undefined;
        let lowestPoint = -Infinity;
        for(let i in this.elements) {
            if(this.elements[i].getLowestPoint() > lowestPoint) {
                lowestPoint = this.elements[i].getLowestPoint();
                lowest = this.elements[i];
            } 
        }

        return lowest;
    }

    getTotalHeight() {
        let height = 0;
        for(let i in this.elements) {
            height += this.elements[i].mainElem.getBoundingClientRect().height;
        }

        return height;
    }

    /**
     * 
     * @param {String} key 
     * @param {(elem : HTMLElement) => void} callbackFunction 
     */
    updateElement(key, callbackFunction) {
        if(this.elements[key])
            this.elements[key].updateElement(callbackFunction);
    }

    contains(key) {
        return key in this.elements
    }
}

var colors = ["red", "green", "blue"];
function add_div(num) {
    let div = document.createElement("div");
    div.innerHTML = "" + num;
    div.className = "content";
    div.style.backgroundColor = colors[num % 3];
    return div;
}

// let sl = new ScrollingList(document.getElementById("list"));
// // sl.addElement("2", add_div(2));
// for(let i = 0; i < 10; i++) {
//     sl.addElement("" + i, add_div(i));
// }

// setInterval(() => {sl.update()},100);
// setTimeout(() => {sl.addElement("a", add_div(4))}, 1000)
// setTimeout(() => {sl.removeElement("2")}, 3000)
// setTimeout(() => {sl.removeElement("a")}, 5000)