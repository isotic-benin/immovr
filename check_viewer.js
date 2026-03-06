const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));

    console.log("Navigating to property page...");
    await page.goto('http://localhost:3000/appartement/69a94b1a08fed6e81dbb2f1d', { waitUntil: 'networkidle2' });

    console.log("Waiting 5 seconds for viewer to initialize...");
    await new Promise(r => setTimeout(r, 5000));

    await browser.close();
})();
