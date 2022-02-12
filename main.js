const SHA256 = require('crypto-js/sha256');
const crypto = require('crypto');
const HmacSHA256 = require('crypto-js/hmac-sha256');
const enc = require('crypto-js/enc-base64');
const stringify = require('canonical-json');

class Block {
    constructor (sequence_number, timestamp, data, previousHash = '') {
        this.sequensequence_number =sequence_number;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
    }

    // constructor (index, timestamp, data, previousHash = '') {
    //     this.index = index;
    //     this.timestamp = timestamp;
    //     this.data = data;
    //     this.previousHash = previousHash;
    //     this.hash = this.calculateHash();
    // }

    calculateHash() {
        return SHA256(this.sequensequence_number + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}


class Blockchain {
    constructor() {
        this.chain = [this.createGenesisBlock()];
    }

    createGenesisBlock() {
        let genesisBlockData = {
            customer_public_key: "0",
            merchant_public_key: "0",
            transaction_date: "00000000",
            transaction_amount: "00.00"
        };
        genesisBlockData = {
            ...genesisBlockData,
            customer_signature: HmacSHA256(genesisBlockData.customer_public_key + genesisBlockData.merchant_public_key + 
                genesisBlockData.transaction_date + genesisBlockData.transaction_date + genesisBlockData.transaction_amount, 'secret'),
            merchant_signature: HmacSHA256(genesisBlockData.customer_public_key + genesisBlockData.merchant_public_key + 
                genesisBlockData.transaction_date + genesisBlockData.transaction_date + genesisBlockData.transaction_amount + 
                genesisBlockData.customer_signature, 'secret')
        };
        return new Block(0, "00000000", JSON.stringify(genesisBlockData), "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash();
        this.chain.push(newBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}


let prime_length = 60;


let customers = [];
for (let i = 0; i < 5; i++) {
    let diffHell = crypto.createDiffieHellman(prime_length);
    diffHell.generateKeys('base64');
    customers.push({
        public_key: diffHell.getPublicKey('base64'),
        private_key: diffHell.getPrivateKey('base64')
    });
}

let merchants = [];
for (let i = 0; i < 2; i++) {
    let diffHell = crypto.createDiffieHellman(prime_length);
    diffHell.generateKeys('base64');
    merchants.push({
        public_key: diffHell.getPublicKey('base64'),
        private_key: diffHell.getPrivateKey('base64')
    });
}

let diffHell = crypto.createDiffieHellman(prime_length);
diffHell.generateKeys('base64');

let miner = {
    public_key: diffHell.getPublicKey('base64'),
    private_key: diffHell.getPrivateKey('base64')
}

let seanCoin = new Blockchain();

for (let i = 1; i < 26; i++) {
    let merchant = merchants[Math.floor(Math.random() * merchants.length)];
    let customer = customers[Math.floor(Math.random() * customers.length)];
    
    let data = {
        customer_public_key: customer.public_key,
        merchant_public_key: merchant.public_key,
        transaction_date: "02" + Math.floor(Math.random() * 28) + "2022",
        transaction_amount: parseFloat(i + ".00") + ".00"
    };
    data = {
        ...data,
        customer_signature: HmacSHA256(data.customer_public_key + data.merchant_public_key + 
                    data.transaction_date + data.transaction_date + data.transaction_amount, customer.private_key),
        merchant_signature: HmacSHA256(data.customer_public_key + data.merchant_public_key + 
                    data.transaction_date + data.transaction_date + data.transaction_amount + 
                    data.customer_signature, merchant.private_key),
        miner_signature: HmacSHA256(data.merchant_signature + (i-1), miner.private_key)
    };

    seanCoin.addBlock(new Block(i, "02" + Math.floor(Math.random() * 28) + "2022", data));
}

console.log('-----------------------1-----------------------');
for (let i = 0; i < seanCoin.chain.length; i++) {
    let x = {
        customer_public_key: seanCoin.chain[i].data.customer_public_key,
        merchant_public_key: seanCoin.chain[i].data.merchant_public_key,
        transaction_date: seanCoin.chain[i].data.transaction_date,
        transaction_amount: seanCoin.chain[i].data.transaction_amount
    }
    console.log(JSON.stringify(x));
}

console.log('-----------------------2-----------------------');
console.log('Is Blockchain valid? ', seanCoin.isChainValid());
console.log(JSON.stringify(seanCoin.chain[10], null, 4));
console.log('-------------------ADD $10.00------------------');
seanCoin.chain[10].data = {
    ...seanCoin.chain[10].data,
    transaction_amount: parseFloat(seanCoin.chain[10].data.transaction_amount) + 10.00 + ".00"
}

console.log('Is Blockchain valid? ', seanCoin.isChainValid());
console.log(JSON.stringify(seanCoin.chain[10], null, 4));

console.log('-----------------------3-----------------------');
let c3_public_key = customers[2].public_key;
let m2_public_key = merchants[1].public_key;
console.log(c3_public_key);
console.log(m2_public_key);

for (let i = 0; i < seanCoin.chain.length; i++) {
    if (seanCoin.chain[i].data.customer_public_key == c3_public_key) {
        console.log(JSON.stringify(seanCoin.chain[i], null, 4));
    }
}

console.log('-----------------------4-----------------------');
for (let i = 0; i < seanCoin.chain.length; i++) {
    if (seanCoin.chain[i].data.merchant_public_key == m2_public_key) {
        console.log(JSON.stringify(seanCoin.chain[i], null, 4));
    }
}

