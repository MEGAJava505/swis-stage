
const _0x5f1 = [
    "ZCazXwV4Lq7Uy93dL4iVeaqIz9rvArtg3ZFBjBW",
    "h2_yuqkcvblu=scuqnzxqzyy=vlh",
    "h2_yuqkcvblu",
    "h2_yuqkcvblu=scuqnzxqxbluzgq=zyy",
    "248505183525",
    "8+248505183525+tqn+q3k4n31806116z5q7n2nq6"
];

// DO NOT EDIT 
(function (_c) {
    const _h = (s) => s.match(/.{1,2}/g).map(b => String.fromCharCode(parseInt(b, 16))).join('');
    const _s1 = _h("7a6e766b7173676663706a6f686d6c79647578626965747277615a4e564b5153474643504a4f484d4c5944555842494554525741393837363534333231305f2b203d");
    const _s2 = _h("6162636465666768696a6b6c6d6e6f707172737475767778797a4142434445464748494a4b4c4d4e4f505152535455565758595a303132333435363738392d3a202e");

    const _dec = (t) => t.split('').map(c => {
        const i = _s1.indexOf(c);
        return i !== -1 ? _s2[i] : c;
    }).join('');

    const _cfg = {
        apiKey: _dec(_c[0]),
        authDomain: _dec(_c[1]),
        projectId: _dec(_c[2]),
        storageBucket: _dec(_c[3]),
        messagingSenderId: _dec(_c[4]),
        appId: _dec(_c[5])
    };

    firebase.initializeApp(_cfg);
})(_0x5f1);

const db = firebase.firestore();
