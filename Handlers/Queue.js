class Queue
{
    constructor(id)
    {
        this.items = [];
        this.time = 0;
        this.qid = id
    }
    enqueue(element,t){    
        this.items.push(element);
        this.time = this.time + Number(t);
    }
    dequeue(t){
        if(this.isEmpty())
            return "Underflow";
        this.time = this.time - Number(t)
        return this.items.shift();
    }
    getTime(){
        return this.time
    }
    setTime(t){
        this.time = this.time+t
        return this.time
    }
    front(){
        if(this.isEmpty())
            return "No elements in Queue";
        return this.items[0];
    }
    isEmpty(){
        return this.items.length == 0;
    }
    printQueue(){
        var str = "";
        for(var i = 0; i < this.items.length; i++)
            str += this.items[i] +" ";
        return str;
    }
}

module.exports = {Queue}