const Wallet = require('./scr/wallet');
const Morphl2 = require('./scr/morphl2');

const dapp = new Morphl2();

const collect = async (wallet) => {

};

async function main() {
    const w = new Wallet("0xf65fee178e60e45f79f5e484b8274f8b2af9cb9608106a6eef8d08374c893a0e");
    const r = new Morphl2();
    // const a = await r.checkin(w);
    const a1 = await r.openBox(w);

    console.log(a)
    console.log(a1)
}

main();
