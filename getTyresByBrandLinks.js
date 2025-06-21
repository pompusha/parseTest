const puppeteer = require("puppeteer");

async function getTyresByBrandLinks() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--window-size=1250,928"],
    defaultViewport: { width: 1250, height: 928 },
  });

  const page = await browser.newPage();

  await page.goto("https://www.justtyres.co.uk/brands/dunlop-tyres", {
    waitUntil: "networkidle2",
  });

  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    await page.evaluate(() => {
      const btn = document.evaluate(
        "/html/body/div[3]/div/div/div/div[2]/button[2]",
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      if (btn) btn.click();
      else throw new Error("Button not found using evaluate");
    });
    console.log("Button clicked using evaluate");
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } catch (e) {
    console.error("Failed to click the button using evaluate:", e.message);
  }
  try {
    const menuSelector = "li.has-dropdown.nav-item";
    await page.waitForSelector(menuSelector, { visible: true, timeout: 5000 });

    const menu = await page.$(menuSelector);
    await menu.hover();
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const dropdownSelector = "li.has-dropdown .mega-menu";
    await page.waitForSelector(dropdownSelector, {
      visible: true,
      timeout: 5000,
    });

    const content = await page.$$eval(
      `${dropdownSelector} .col-md-3`,
      (sections) => {
        const block = sections.find(
          (section) =>
            section.querySelector(".h6")?.innerText.trim() === "Tyres By Brand"
        );
        if (!block) return [];

        const links = Array.from(block.querySelectorAll("a"));
        return links.map((link) => ({
          text: link.innerText.trim(),
          href: link.href.trim(),
        }));
      }
    );

    await browser.close();
    return content;
  } catch (err) {
    console.error("Error while interacting with the menu:", err.message);
    await browser.close();
    return [];
  }
}

module.exports = getTyresByBrandLinks;
