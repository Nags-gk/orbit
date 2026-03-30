const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err));
  page.on('response', response => {
      if (!response.ok()) {
          console.log('NETWORK ERROR:', response.status(), response.url());
      }
  });

  await page.goto('http://localhost:5173/');
  
  // Wait for React to mount
  await page.waitForTimeout(2000);
  
  console.log('Clicking Add Account...');
  const addBtn = await page.$x('//button[contains(., "Add Account")]');
  if (addBtn.length > 0) {
      await addBtn[0].click();
      await page.waitForTimeout(1000);
      
      console.log('Typing name...');
      await page.type('input[placeholder="e.g. Chase Sapphire, Ally Savings..."]', 'baa');
      
      console.log('Clicking Create Account...');
      const createBtn = await page.$x('//button[contains(., "Create Account")]');
      if (createBtn.length > 0) {
          await createBtn[0].click();
          await page.waitForTimeout(2000);
          console.log('Checked after clicking Create Account');
      } else {
          console.log('Create Account button not found');
      }
  } else {
      console.log('Add Account button not found');
  }
  
  await browser.close();
})();
