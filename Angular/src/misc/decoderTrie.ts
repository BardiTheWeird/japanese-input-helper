interface IHash<TVal> {
    [index : string] : TVal;
}

export class TrieNode<TVal> {
    value : TVal | null = null;
    private next : IHash<TrieNode<TVal>> = {};

    constructor(value : TVal | null = null, next : IHash<TrieNode<TVal>> = {}){
        this.value = value;
        this.next = next;
    }

    nextExists(nextKey : string) : boolean {
        return Boolean(this.next[nextKey]);
    }

    addNext(key : string, val : TVal | null = null) : TrieNode<TVal>{
        return this.next[key] = new TrieNode<TVal>(val);
    }

    getNextNode(nextKey : string) : TrieNode<TVal> | null {
        if(!this.nextExists(nextKey))
            return null;
        return this.next[nextKey];
    }

    getAllNextNodes() : TrieNode<TVal>[] {
        return Object.values(this.next);
    }

    getNextLength() : number {
        return this.getAllNextNodes().length;
    }

    isLeaf() : boolean {
        return !Boolean(this.getNextLength);
    }
}

export class DecoderTrie{
    root : TrieNode<string> = new TrieNode();

    constructor(kvPairs : string[][] = []){
        let logStr = '';
        
        for (const pair of kvPairs){
            const [key, value] = pair;
            // logStr += `${key}: ${value}; `;
            logStr += `${pair}; `
            this.insertPair(key, value);
        }
        // console.log('all pairs inserted: ' + logStr);
    }

    insertPair(key : string, value : string){
        let node = this.root;
        for (const char of key) {
            if (node?.nextExists(char))
                node = node?.getNextNode(char)!;
            else
                node = node.addNext(char)
        }
        node.value = value;
    }

    decode(str : string, testPrefix : string | null = null) : string {
        const log = testPrefix === null 
            ? () => {} 
            : (x : string) => console.log(testPrefix + x);

        let finString = '';
        let charBuffer = '';
        let curNode = this.root;
        for (const char of str){
            log(`current char: ${char}`);
            
            let nextCharNode = curNode.getNextNode(char);
            if (nextCharNode === null){
                log(`next node doesn't exist`);
                if (curNode.value !== null){
                    log(`curNode has value, appending ${curNode.value} to the finString`);
                    finString += curNode.value;
                }
                else{
                    log(`curNode doesn't have value, appending ${charBuffer} to the finString`);
                    finString += charBuffer;
                }

                charBuffer = '';
                curNode = this.root;
                nextCharNode = this.root.getNextNode(char);
                if (nextCharNode === null){
                    log(`${char} doesn't start any symbol, appending it to finString`);
                    finString += char;
                }
                else{
                    log(`${char} starts a symbol, appending it to charBuffer`);
                    charBuffer += char;
                    curNode = nextCharNode;
                }
            }
            else{
                log(`next node exists, appending ${char} to charBuffer`);
                curNode = nextCharNode;
                charBuffer += char;
            }
        }

        if (curNode.value === null)
            finString += charBuffer;
        else
            finString += curNode.value;

        return finString;
    }
}