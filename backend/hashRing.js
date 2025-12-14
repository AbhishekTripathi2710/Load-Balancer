const crypto = require("crypto");

class ConsistentHashing{
    constructor({replicas = 100} = {}){
        this.replicas = replicas;
        this.ring = []; //{ hash: 12345678, nodeId: "S1" } each element look like this and it will have a treeMap like structure
        this.nodes = new Set(); // to check duplicate servers
    }

    _hash(value){
        const h = crypto.createHash("md5").update(value).digest("hex"); //this will give hash value like this "9e107d9d372bb6826bd81d3542a419d6"

        return parseInt(h.slice(0,8), 16); // "9e107d9d" → integer

    }

    _binarySearch(hash){
        let low = 0, high = this.ring.length - 1;
        while(low<=high){
            const mid = (low+high) >> 1;
            if(this.ring[mid].hash === hash) return mid;
            if(this.ring[mid].hash < hash) low = mid+1;
            else high = mid - 1;
        }
        return low;
    }

    addNode(nodeId){
        if(this.nodes.has(nodeId)) return; // prevents duplicate servers
        this.nodes.add(nodeId);

        for(let i=0;i<this.replicas;i++){
            const key = `${nodeId}#${i}`; //S1#0
            const hash = this._hash(key);
            const idx = this._binarySearch(hash);
            this.ring.splice(idx,0,{hash, nodeId});
        }
    }

    removeNode(nodeId){
        if(!this.nodes.has(nodeId)) return;
        this.nodes.delete(nodeId);
        this.ring = this.ring.filter(v => v.nodeId !== nodeId);
    }

    getNode(key){
        if(this.ring.length === 0) return null;
        const hash = this._hash(key);
        const idx = this._binarySearch(hash);
        return this.ring[idx % this.ring.length].nodeId;
    }

    size() {
    return this.nodes.size;
}
}

module.exports = ConsistentHashing;