const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(2000);
  
  // Try to click Add Account button
  const addButton = await page.$x('//button[contains(., "Add Account")]');
  if (addButton.length > 0) {
      await addButton[0].click();
      await page.waitForTimeout(1000);
      
      const submitBtn = await page.$x('//button[contains(., "Create Account")]');
      if (submitBtn.length > 0) {
          const disabled = await page.evaluate(el => el.disabled, submitBtn[0]);
          console.log('Button disabled state:', disabled);
          
          await submitBtn[0].click();
          await page.waitForTimeout(2000);
          const modalExists = await page.$x('//h2[contains(., "Add New Account")]');
          console.log('Modal still open after submit?', modalExists.length > 0);
      } else {
          console.log('Submit button not found');
      }
  } else {
      console.log('Add Account button not found');
  }
  await browser.close();
})();
