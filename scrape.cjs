const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://localhost:4173/');
  await page.waitForSelector('.border-dashed', { timeout: 5000 }).catch(() => console.log('No empty state found'));
  
  // Click Add Account button
  const addButton = await page.$x('//button[contains(., "Add Account")]');
  if (addButton.length > 0) {
      await addButton[0].click();
      await page.waitForTimeout(1000);
      
      // Fill form
      await page.type('input[placeholder="e.g. Chase Sapphire, Ally Savings..."]', 'baa');
      
      // Click Create Account
      const submit = await page.$x('//button[contains(., "Create Account")]');
      if (submit.length > 0) {
          await submit[0].click();
          await page.waitForTimeout(2000);
      }
  }
  await browser.close();
})();
