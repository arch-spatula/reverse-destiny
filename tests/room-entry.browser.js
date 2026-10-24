import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { chromium } from 'playwright'
import jsQR from 'jsqr'
import { createServer } from 'vite'

// Run `bunx playwright install chromium` once before running this browser suite.
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
let browser
const results = []
try {
  browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  })
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`
  const mutations = []
  let roomFactoryCalls = 0
  async function observedContext() {
    const context = await browser.newContext()
    await context.exposeBinding('__recordRoomFactoryCall', () => { roomFactoryCalls += 1 })
    context.on('request', (request) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) mutations.push(request.url())
    })
    // The existing local room factory uses Date.now; this also catches accidental
    // factory calls before a future backend makes them observable as requests.
    await context.addInitScript(() => {
      const now = Date.now
      Date.now = function () {
        if (new Error().stack?.includes('createRoom')) window.__recordRoomFactoryCall()
        return now()
      }
    })
    return context
  }
  const context = await observedContext()
  const page = await context.newPage()

  async function check(name, run) {
    await run()
    results.push(name)
    console.log(`PASS ${name}`)
  }

  async function assertJoinScreen(target) {
    await target.getByRole('heading', { name: '입장 정보', exact: true }).waitFor()
    assert.equal(await target.locator('svg').count(), 0)
    for (const label of ['생년월일', '태어난 시간', '태어난 도시']) {
      assert.equal(await target.getByLabel(label, { exact: true }).count(), 1)
    }
    assert.equal(await target.getByRole('combobox', { name: '성별', exact: true }).count(), 1)
    assert.equal(await target.getByLabel('모름', { exact: true }).count(), 1)
  }

  async function decodedQrUrl() {
    const pixels = await page.locator('svg').evaluate(async (svg) => {
      const image = new Image()
      const imageUrl = URL.createObjectURL(new Blob(
        [new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' },
      ))
      image.src = imageUrl
      await image.decode()
      URL.revokeObjectURL(imageUrl)
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 512
      const context = canvas.getContext('2d')
      context.fillStyle = 'white'
      context.fillRect(0, 0, 512, 512)
      context.drawImage(image, 0, 0, 512, 512)
      return Array.from(context.getImageData(0, 0, 512, 512).data)
    })
    const decoded = jsQR(Uint8ClampedArray.from(pixels), 512, 512)
    assert.ok(decoded, 'Actual rendered QR must decode')
    return decoded.data
  }

  await check('RE1–RE3: QR below-button, new-tab hint, decoded absolute URL and popup preserve host', async () => {
    await page.goto(`${origin}/rooms/1792684449634?invite=host#qr`)
    const entry = page.getByRole('link', { name: '입장', exact: true })
    await entry.waitFor()
    const hint = await entry.getAttribute('aria-describedby')
    assert.ok(hint)
    assert.match(await page.locator(`[id="${hint}"]`).innerText(), /새 탭/)
    const qrBox = await page.locator('svg').boundingBox()
    const entryBox = await entry.boundingBox()
    assert.ok(entryBox.y >= qrBox.y + qrBox.height, 'Entry must appear below QR')
    const decoded = await decodedQrUrl()
    const expected = `${origin}/rooms/1792684449634/join`
    assert.equal(decoded, expected)
    assert.equal(await entry.evaluate((link) => link.href), decoded)
    assert.equal(await entry.getAttribute('target'), '_blank')
    assert.match(await entry.getAttribute('rel'), /noopener/)
    const hostUrl = page.url()
    const popupPromise = page.waitForEvent('popup')
    await entry.click()
    const popup = await popupPromise
    await assertJoinScreen(popup)
    assert.equal(popup.url(), expected)
    assert.equal(page.url(), hostUrl)
    assert.equal(await page.getByRole('heading', { name: '방 입장 QR', exact: true }).count(), 1)
    await popup.close()
    const scanned = await context.newPage()
    await scanned.goto(decoded)
    await assertJoinScreen(scanned)
    await scanned.close()
  })

  await check('RE4–RE6: fresh browser direct/reload access and distinct room identifiers', async () => {
    const fresh = await observedContext()
    const direct = await fresh.newPage()
    for (const roomId of ['other-room', 'room%20with%20space']) {
      const expected = `${origin}/rooms/${roomId}/join`
      await page.goto(`${origin}/rooms/${roomId}?discard=1#discard`)
      assert.equal(await page.getByRole('link', { name: '입장', exact: true }).evaluate((link) => link.href), expected)
      assert.equal(await decodedQrUrl(), expected)
      await direct.goto(expected)
      await assertJoinScreen(direct)
      assert.equal(direct.url(), expected)
      await direct.reload()
      await assertJoinScreen(direct)
      assert.equal(direct.url(), expected)
    }
    await fresh.close()
  })

  await check('RC-entry: required birth details and unknown-time toggle', async () => {
    await page.goto(`${origin}/rooms/details/join`)
    await assertJoinScreen(page)
    const form = page.locator('form')
    assert.equal(await form.evaluate((element) => element.checkValidity()), false)
    await page.getByLabel('생년월일', { exact: true }).fill('1995-03-18')
    await page.getByLabel('태어난 도시', { exact: true }).fill('서울')
    await page.getByRole('combobox', { name: '성별', exact: true }).selectOption({ label: '여성' })
    assert.equal(await form.evaluate((element) => element.checkValidity()), false)
    const time = page.getByLabel('태어난 시간', { exact: true })
    await time.fill('14:30')
    assert.equal(await form.evaluate((element) => element.checkValidity()), true)
    await time.fill('')
    await page.getByLabel('모름', { exact: true }).check()
    assert.equal(await time.isDisabled(), true)
    assert.equal(await form.evaluate((element) => element.checkValidity()), true)
    await page.getByLabel('모름', { exact: true }).uncheck()
    assert.equal(await time.isEnabled(), true)
    assert.equal(await form.evaluate((element) => element.checkValidity()), false)
  })

  await check('RE7: QR/join access never creates an additional room', async () => {
    assert.equal(roomFactoryCalls, 0)
    assert.deepEqual(mutations, [])
  })

  await check('RE5 deployment: join deep-link has an index rewrite', async () => {
    const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'))
    assert.ok(config.rewrites.some((rule) => rule.source === '/rooms/:roomId/join' && rule.destination === '/index.html'))
  })
  console.log(JSON.stringify({ passed: results.length, results }, null, 2))
} finally {
  await browser?.close()
  await server.close()
}
