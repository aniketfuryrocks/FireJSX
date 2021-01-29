import 'expect-puppeteer'

describe('UI', () => {
    beforeAll(async () => {
        await page.goto('http://localhost:5000');
        await page.setJavaScriptEnabled(true)
        await page.emulate({
            userAgent: "Chrome",
            viewport: {
                width: 1920,
                height: 1080,
            }
        })
    });

    it('should be titled "Index"', async () => {
        await expect(page.title()).resolves.toMatch('Index');
    });

    describe('Globals', function () {
        it('should have valid globals', async () => {
            const FireJSX = await page.evaluate(() => window.FireJSX);
            expect(FireJSX.lib).toEqual("lib");
            FireJSX.isHydrated = 2;
            //check if app is present
            await expect(page.evaluate(() => typeof window.FireJSX.app))
                .resolves
                .toEqual('function');
            //check if FireJSX_jsonp is created
            await expect(page.evaluate(() => typeof window.FireJSX_jsonp))
                .resolves
                .toEqual('object')
        });

        it('should have valid pathsCache', async () => {
            const pathsCache = await page.evaluate(() => window.FireJSX.pathsCache);
            expect(pathsCache["/"]).toBeTruthy();
            expect(pathsCache["/"].page).toEqual('index.jsx');
            expect(pathsCache["/"].content).toEqual({emoji: "🔥"});
        });

        it('should have valid pagesCache', async () => {
            const pagesCache = await page.evaluate(() => window.FireJSX.pagesCache);
            expect(pagesCache["/"]).toBeTruthy();
            expect(pagesCache["/"].page).toBe('index.jsx');
            expect(pagesCache["/"].content).toEqual({emoji: "🔥"});
        });
    });

});