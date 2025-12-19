// const fetch = require('node-fetch'); // Native fetch in Node 18+

async function run() {
    try {
        const response = await fetch('http://localhost:3000/api/donations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: 100,
                type: 'ZAKAT',
                donorId: 'donor-001', // Old string ID, expected to fail
                donorName: 'donor@example.com'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);

    } catch (err) {
        console.error('Error:', err);
    }
}

run();
