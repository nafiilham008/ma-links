async function testLoginFlow() {
    try {
        console.log("1. Attempting Login...");
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'password123' })
        });

        console.log("Login Status:", loginRes.status);
        const cookie = loginRes.headers.get('set-cookie');
        console.log("Set-Cookie Header:", cookie);

        if (!cookie) {
            console.log("Error: No cookie returned from login");
            return;
        }

        console.log("\n2. Attempting to fetch protected /api/links using cookie...");
        const linksRes = await fetch('http://localhost:3000/api/links', {
            headers: { 'Cookie': cookie }
        });

        console.log("API Links Status:", linksRes.status);
        const data = await linksRes.json();
        console.log("API Links Data:", data);

    } catch (e) {
        console.error("Test failed:", e);
    }
}

testLoginFlow();
