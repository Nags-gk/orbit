fetch('http://127.0.0.1:4173/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({"name":"baa","type":"credit","subtype":"Credit Card","balance":0})
}).then(async r => {
    console.log(r.status);
    console.log(await r.text());
}).catch(e => console.error(e));
