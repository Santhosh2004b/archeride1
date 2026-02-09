
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'santhosh.b@arche.global';
const ADMIN_PASS = 'Santhosh@Arche2026';

async function verify() {
    try {
        console.log("1. Logging in...");
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASS })
        });

        if (!loginRes.ok) {
            const txt = await loginRes.text();
            console.error("Login Failed:", loginRes.status, txt);
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Login successful. Token obtained.");

        console.log("2. Fetching Dashboard Metrics...");
        const dashRes = await fetch(`${BASE_URL}/dashboard/metrics`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!dashRes.ok) {
            const txt = await dashRes.text();
            console.error("Dashboard Fetch Failed:", dashRes.status, txt);
            return;
        }

        const data = await dashRes.json();
        console.log("\n--- API RESPONSE DATA (Subset) ---");
        console.log("Resolved:", data.resolved);
        console.log("Approved:", data.approved);
        console.log("Cancelled:", data.cancelled);
        console.log("----------------------------------");

        if (data.cancelled === 9 && data.approved === 48) {
            console.log("SUCCESS: Server is running NEW code.");
        } else {
            console.log("FAILURE: Server is running OLD code or DB is empty.");
            console.log(`Expected Cancelled: 9, Got: ${data.cancelled}`);
            console.log(`Expected Approved: 48, Got: ${data.approved}`);
        }

    } catch (err) {
        console.error("Verification Error:", err.message);
    }
}

verify();
