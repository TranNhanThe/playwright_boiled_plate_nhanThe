import { Locator, Page, expect } from "@playwright/test"
import { String } from "typescript-string-operations"
import path from "path"
export class BasePage {
  public page: Page

  constructor(page: Page) {
    this.page = page
  }

  async sleep(timeout: number = 10000, page: any = this.page) {
    await page.waitForTimeout(timeout)
  }

  // Returns when element specified by locator satisfies the state option.
  async waitFor(
    selector: string,
    page: any = this.page,
    timeout: number = 10000
  ): Promise<void> {
    const element = await page.locator(selector).first()
    await element.waitFor({ timeout })
  }

  // Check is displayed
  async isDisplayed(
    selector: string,
    page: any = this.page,
    timeout: number = 10000
  ): Promise<boolean> {
    const element = page.locator(selector).first()
    try {
      await element.waitFor({ timeout })
      return await element.isVisible()
    } catch {
      return false
    }
  }

  // Check if element disappears (is hidden or detached)
  async isDisappeared(
    selector: string,
    page: any = this.page,
    timeout: number = 50000
  ): Promise<boolean> {
    const element = page.locator(selector).first()
    try {
      await element.waitFor({ state: "hidden", timeout })
      return true
    } catch {
      return false
    }
  }

  // Single touch at the position (x,y).
  async touchScreen(x: number, y: number): Promise<void> {
    await this.page.touchscreen.tap(x, y)
  }

  // Click element contains click, tap, dblclick
  async click(
    selector: string,
    type: string = "click",
    page: any = this.page,
    timeout: number = 10000
  ): Promise<void> {
    const element = await page.locator(selector).first()
    await this.highlight(selector, page)
    if (type == "click") {
      await element.click({ timeout: timeout }) //Click an element.
    } else if (type == "tap") {
      await element.tap({ timeout: timeout }) //Perform a tap gesture on the element matching the locator.
    } else if (type == "dblclick") {
      await element.dblclick({ timeout: timeout }) //Double-click an element.
    }
  }

  async clickPoint(
    x: number,
    y: number,
    page: any = this.page,
    timeout: number = 10000
  ): Promise<void> {
    await page.mouse.move(x, y)
    await page.mouse.click(x, y, { timeout })
  }

  // Set a value to the input field
  async enterText(
    selector: string,
    text: string,
    page: any = this.page,
    timeout: number = 15000
  ): Promise<void> {
    const element = await page.locator(selector).first()
    await element.waitFor({ timeout })
    await this.highlight(selector, page)
    await element.fill(text)
  }

  // Clear the input field.
  async clear(
    selector: string,
    page: any = this.page,
    timeout: number = 10000
  ): Promise<void> {
    const element = await page.locator(selector).first()
    await element.waitFor({ timeout })
    await element.clear()
  }

  // Calls blur on the element.
  async blur(
    selector: string,
    page: any = this.page,
    timeout: number = 10000
  ): Promise<void> {
    const element = await page.locator(selector).first()
    await element.waitFor({ timeout })
    await element.blur({ timeout: timeout })
  }

  // Returns the number of elements matching the locator.
  async count(selector: string, page: any = this.page): Promise<number> {
    const element = await page.locator(selector)
    return await element.count()
  }

  // Drag the source element towards the target element and drop it.
  async dragTo(sourceLocator: string, targetLocator: string): Promise<void> {
    const source = this.page.locator(sourceLocator).first()
    const target = this.page.locator(targetLocator).first()
    await source.dragTo(target)
  }

  // Returns the matching element's attribute value.
  async getAttribute(
    selector: string,
    attribute: string,
    page: any = this.page
  ): Promise<string> {
    const element = await page.locator(selector).first()
    return (await element.getAttribute(attribute)) || ""
  }

  async setAttribute(
    selector: string,
    attribute: string,
    value: string,
    page: any = this.page
  ): Promise<void> {
    const element = await page.locator(selector).first()
    await element.evaluate(
      (el, [attr, val]) => {
        el.setAttribute(attr, val)
      },
      [attribute, value]
    )
  }

  async getAttrFromText(
    text: string,
    attribute: string,
    page: any = this.page,
    contains: boolean = false
  ): Promise<string> {
    const locator = await this.getLocatorCom(text, contains)
    return this.getAttribute(locator, attribute, page)
  }

  // get text
  async getText(
    selector: string,
    all: boolean = false,
    page: any = this.page,
    timeout: number = 10000
  ): Promise<any> {
    const element = await page.locator(selector).first()
    await element.waitFor({ timeout })
    if (all) {
      return await element.allTextContents()
    } else {
      return await element.textContent({ timeout: timeout })
    }
  }

  async getTextFromText(
    text: string,
    page: any = this.page,
    contains: boolean = false,
    timeout: number = 10000
  ): Promise<string> {
    const locator = await this.getLocatorCom(text, contains)
    return this.getText(locator, false, page, timeout)
  }

  // get value
  async getValue(
    selector: string,
    checkbox: boolean = false,
    page: any = this.page,
    timeout: number = 10000
  ): Promise<string> {
    if (checkbox) {
      return await (await page.$(selector)).evaluate((node) => node.checked)
    } else {
      const element = await this.page.locator(selector).first()
      return await element.inputValue({ timeout: timeout })
    }
  }

  // Highlight the corresponding element(s) on the screen
  async highlight(
    selector: string,
    page: any = this.page,
    timeout: number = 10000
  ): Promise<void> {
    const element = await page.locator(selector).first()
    await element.waitFor({ timeout })
    await element.highlight()
  }

  // Hover over the matching element.
  async hover(
    selector: string,
    page: any = this.page,
    timeout: number = 10000
  ): Promise<void> {
    const element = await page.locator(selector).first()
    await element.waitFor({ timeout })
    await element.hover()
  }

  // Keyboards contains insertText, type, down, up, press
  async keyboard(text: string, type: string = "insertText"): Promise<void> {
    const keyboadElement = await this.page.keyboard
    if (type == "insertText") {
      await keyboadElement.insertText(text) //Dispatches only input event, does not emit the keydown, keyup or keypress events.
    } else if (type == "type") {
      await keyboadElement.type(text) //Sends a keydown, keypress/input, and keyup event for each character in the text.
    } else if (type == "down") {
      await keyboadElement.down(text) //Dispatches a keydown event.
    } else if (type == "up") {
      await keyboadElement.up(text) //Dispatches a keyup event.
    } else if (type == "press") {
      await keyboadElement.press(text) //Press keys
    }
  }

  // Mouse contains click, dblclick, move, wheel
  async mouse(x: number, y: number, type: string = "click"): Promise<void> {
    const mouseElement = await this.page.mouse
    if (type == "click") {
      await mouseElement.click(x, y) //Mouse click
    } else if (type == "dblclick") {
      await mouseElement.dblclick(x, y) //dblclick click
    } else if (type == "move") {
      await mouseElement.move(x, y) //Dispatches a mousemove event.
    } else if (type == "wheel") {
      await mouseElement.wheel(x, y) //Dispatches a wheel event.
    }
  }
  async scrollElementIntoView(
    selector: string,
    page: any = this.page,
    timeout: number = 10000
  ) {
    const element = await page.locator(selector).first()
    await element.waitFor({ timeout })
    await element.scrollIntoViewIfNeeded()
  }

  //wait For Response
  async waitForResponse(
    endPoint: string,
    status: number,
    page: any = this.page,
    timeout: number = 30000
  ): Promise<any> {
    try {
      const response: any = await page.waitForResponse(
        (response) =>
          response.url().includes(endPoint) && response.status() === status,
        { timeout: timeout }
      )
      return JSON.parse(await response.body())
    } catch (error) {
      return false
    }
  }

  // get tag html
  async getTagHtml(
    selector: string,
    page: any = this.page,
    timeout: number = 10000
  ): Promise<string> {
    const element = await page.locator(selector).first()
    await element.waitFor({ timeout })
    return (await element.evaluate((e) => e.tagName)).toLowerCase()
  }
  // get style
  async getStyleElement(
    selector: string,
    css: any,
    page: any = this.page,
    timeout: number = 10000
  ): Promise<any> {
    const result: any = []
    const element = await page.locator(selector).first()
    await element.waitFor({ timeout })
    if (Array.isArray(css)) {
      for (let i = 0; i < css.length; i++) {
        const value = await element.evaluate((ele, style) => {
          return window.getComputedStyle(ele, null).getPropertyValue(style)
        }, css[i])
        result.push({
          css: css[i],
          value: value,
        })
      }
    } else {
      const value = await element.evaluate((ele, style) => {
        return window.getComputedStyle(ele, null).getPropertyValue(style)
      }, css)
      result.push({
        css: css,
        value: value,
      })
    }
    return result
  }

  // waitForEvent
  async waitForEvent(
    type: string = "popup",
    page: any = this.page,
    timeout: number = 10000
  ) {
    //type: page, popup
    try {
      return await page.waitForEvent(type, {
        timeout: timeout,
      })
    } catch (error) {
      return false
    }
  }

  async getLocatorCom(text: string, contains: boolean = false) {
    let locatorText = "//*[text()='{0}']"
    if (contains) {
      locatorText = "//*[contains(text(),'{0}')]"
    }
    return String.format(locatorText, text)
  }

  async isText(
    text: string,
    page: any = this.page,
    contains: boolean = false,
    timeout: number = 10000
  ) {
    return await this.isDisplayed(
      await this.getLocatorCom(text, contains),
      page,
      timeout
    )
  }

  async tapText(
    text: string,
    page: any = this.page,
    contains: boolean = false,
    timeout: number = 10000
  ) {
    await this.click(
      await this.getLocatorCom(text, contains),
      "click",
      page,
      timeout
    )
  }

  async waitForText(
    text: string,
    page: any = this.page,
    contains: boolean = false,
    timeout: number = 10000
  ) {
    await this.waitFor(await this.getLocatorCom(text, contains), page, timeout)
  }

  protected ensureLocator = (selector: string | Locator): Locator => {
    if (typeof selector === "string") {
      return this.page.locator(selector)
    }
    return selector as Locator
  }

  public waitForAttached = async (
    selector: string | Locator,
    timeout: number = 10000
  ) => {
    await this.ensureLocator(selector).waitFor({
      state: "attached",
      timeout: timeout,
    })
  }

  public waitForDetached = async (
    selector: string | Locator,
    timeout: number = 10000
  ) => {
    await this.ensureLocator(selector).waitFor({
      state: "detached",
      timeout: timeout,
    })
  }

  public waitForVisible = async (
    selector: string | Locator,
    timeout: number = 30000
  ) => {
    await this.ensureLocator(selector).waitFor({
      state: "visible",
      timeout: timeout,
    })
  }

  public waitForVisiblePosition = async (
    selector: string | Locator,
    position: number = 1,
    timeout: number = 25000
  ) => {
    await this.ensureLocator(`(${selector})[${position}]`).waitFor({
      state: "visible",
      timeout: timeout,
    })
  }

  public notVisible = async (
    selector: string | Locator,
    position: number = 1,
    timeout: number = 20000
  ) => {
    await this.ensureLocator(`(${selector})[${position}]`).waitFor({
      state: "hidden",
      timeout: timeout,
    })
  }

  public waitForHidden = async (
    selector: string | Locator,
    timeout: number = 10000
  ) => {
    await this.ensureLocator(selector).waitFor({
      state: "hidden",
      timeout: timeout,
    })
  }

  public inputText = async (
    selector: string | Locator,
    value: string,
    force: boolean = true,
    timeout: number = 30000
  ) => {
    await this.waitForVisible(selector, timeout)
    const locator = this.ensureLocator(selector)
    await locator.clear({
      force: force,
      timeout: timeout,
    })
    await locator.fill(value, {
      force: force,
      timeout: timeout,
    })
  }

  public inputOTP = async (
    selector: string | Locator,
    value: string,
    timeout: number = 10000
  ) => {
    await this.waitForVisible(selector, timeout)
    const locator = this.ensureLocator(selector)
    await locator.fill(value)
  }

  public clickElement = async (
    selector: string | Locator,
    force: boolean = true,
    timeout: number = 30000
  ) => {
    await this.page.waitForTimeout(1000)
    await this.waitForVisible(selector, timeout)
    await expect(this.ensureLocator(selector)).toBeEnabled({
      timeout: 15000,
    })
    await this.ensureLocator(selector).click({
      force: force,
    })
  }

  public clickElementFast = async (
    selector: string | Locator,
    force: boolean = true,
    timeout: number = 30000
  ) => {
    await this.waitForVisible(selector, timeout)
    await expect(this.ensureLocator(selector)).toBeEnabled({
      timeout: 15000,
    })
    await this.ensureLocator(selector).click({
      force: force,
    })
  }

  public clickAnyway = async (
    selector: string | Locator,
    force: boolean = true
  ) => {
    await this.ensureLocator(selector).click({
      force: force,
    })
  }

  public clickElementHover = async (
    selector: string | Locator,
    force: boolean = true,
    timeout: number = 30000
  ) => {
    await this.page.waitForTimeout(1000)
    await this.waitForVisible(selector, timeout)
    await expect(this.ensureLocator(selector)).toBeEnabled({
      timeout: 15000,
    })
    await this.ensureLocator(selector).hover()
    await this.ensureLocator(selector).click({
      force: force,
    })
  }

  public verifyTextDiv = async (value, timeout: number = 25000) => {
    await this.ensureLocator(`//div[contains(text(), '${value}')]`).waitFor({
      state: "visible",
      timeout: timeout,
    })
  }

  public verifyTextSpan = async (value, timeout: number = 20000) => {
    await this.ensureLocator(`//span[contains(text(), '${value}')]`).waitFor({
      state: "visible",
      timeout: timeout,
    })
  }
  public verifyTextSpanDuplicate = async (
    value,
    nth,
    timeout: number = 20000
  ) => {
    await this.page
      .locator(`//span[contains(text(), '${value}')]`)
      .nth(nth)
      .waitFor({
        state: "visible",
        timeout: timeout,
      })
  }

  // public verifyTextDivDuplicate = async (value, nth, timeout: number = 20000) => {
  //   await this.ensureLocator((`//div[contains(text(), '${value}')]`)[nth]).waitFor({
  //     state: "visible",
  //     timeout: timeout,
  //   })
  // }
  public verifyTextDivDuplicate = async (
    value,
    nth,
    timeout: number = 20000
  ) => {
    await this.page
      .locator(`//div[contains(text(), '${value}')]`)
      .nth(nth)
      .waitFor({
        state: "visible",
        timeout: timeout,
      })
  }

  public verifyValue = async (locator, value) => {
    await expect(this.ensureLocator(locator)).toHaveValue(value)
  }

  public verifyTextP = async (value, timeout: number = 20000) => {
    await this.ensureLocator(`//p[contains(text(), '${value}')]`).waitFor({
      state: "visible",
      timeout: timeout,
    })
  }

  public verifyTextH6 = async (value, timeout: number = 20000) => {
    await this.ensureLocator(`//h6[contains(text(), '${value}')]`).waitFor({
      state: "visible",
      timeout: timeout,
    })
  }
  public verifyText = async (locator, value) => {
    await expect(this.ensureLocator(locator)).toHaveText(value)
  }
  public clickTheSpan = async (value, timeout: number = 30000) => {
    await this.ensureLocator(`//span[text()="${value}"]`).click({
      timeout: timeout,
    })
  }
  public verifyTextH3 = async (value, timeout: number = 20000) => {
    await this.ensureLocator(`//h3[contains(text(), '${value}')]`).waitFor({
      state: "visible",
      timeout: timeout,
    })
  }
  public verifyTextH1 = async (value, timeout: number = 20000) => {
    await this.ensureLocator(`//h1[contains(text(), '${value}')]`).waitFor({
      state: "visible",
      timeout: timeout,
    })
  }

  public locatorHaveText = async (
    locator,
    text,
    position: number = 1,
    timeout: number = 30000
  ) => {
    await expect(this.ensureLocator(`(${locator})[${position}]`)).toHaveText(
      text,
      { timeout }
    )
  }

  public locatorContainText = async (
    locator,
    text,
    position: number = 1,
    timeout: number = 30000
  ) => {
    await expect(this.ensureLocator(`(${locator})[${position}]`)).toContainText(
      text,
      { timeout }
    )
  }

  public locatorNotHaveText = async (locator, text) => {
    await expect(this.ensureLocator(locator)).not.toHaveText(text)
  }

  public exacly18YearOldGlobal = async () => {
    const currentDate = new Date()
    const daysToSubtract = 6575
    const pastDate = new Date(currentDate)
    pastDate.setDate(currentDate.getDate() - daysToSubtract)
    const day = pastDate.toLocaleString("en-US", { weekday: "long" })
    const month = pastDate.toLocaleString("en-US", { month: "long" })
    const dayOfMonth = pastDate.getDate()
    const year = pastDate.getFullYear()
    const formattedDate = `${day}, ${month} ${dayOfMonth}, ${year}`
    const dayLocator = `//div[contains(@aria-label, '${formattedDate}')]`
    await this.clickElement(dayLocator)
  }

  public verifyLabel = async (value, timeout: number = 20000) => {
    await this.ensureLocator(`//label[contains(text(), '${value}')]`).waitFor({
      state: "visible",
      timeout: timeout,
    })
  }
  public verifyH = async (value, h, timeout: number = 20000) => {
    await this.ensureLocator(`//h${h}[contains(text(), '${value}')]`).waitFor({
      state: "visible",
      timeout: timeout,
    })
  }
  public clickTheDiv = async (value, timeout: number = 20000) => {
    await this.ensureLocator(`//div[contains(text(), '${value}')]`).click({
      timeout: timeout,
    })
  }
  public verify = async (
    element,
    value,
    position: number = 1,
    timeout: number = 25000
  ) => {
    await this.ensureLocator(
      `(//${element}[contains(text(), '${value}')])[${position}]`
    ).waitFor({
      state: "visible",
      timeout: timeout,
    })
  }
  public isDisable = async (locator: Locator | string) => {
    const el = this.ensureLocator(locator)
    await this.waitForVisible(locator)
    await expect(el).toBeDisabled({timeout: 25000})//add timeout 15000
  }
  public isEnable = async (locator: Locator | string) => {
    const el = this.ensureLocator(locator)
    await this.waitForVisible(locator)
    await expect(el).toBeEnabled({timeout: 25000})//add timeout 15000
  }

  // await page.locator(ocObLocator.createYourID.help).hover()
  public hoverLocator = async (locator, position: number = 1) => {
    // await this.ensureLocator(locator).hover()
    await this.page.locator(`(${locator})[${position}]`).hover()
    await this.page.waitForTimeout(1000)
  }

  public clickElementCustom = async (
    element,
    value,
    position: number = 1,
    timeout: number = 30000
  ) => {
    await this.waitForVisible(`(//${element}[contains(text(), '${value}')])[${position}]`, timeout)
    await this.isEnable(`(//${element}[contains(text(), '${value}')])[${position}]`)
    await this.ensureLocator(
      `(//${element}[contains(text(), '${value}')])[${position}]`
    ).click({
      timeout: timeout,
    })
  }
  public clickElementCustomExact = async (
    element,
    value,
    timeout: number = 25000
  ) => {
    await this.ensureLocator(`//${element}[text()='${value}']`).click({
      timeout: timeout,
    })
  }
  public notVerify = async (
    element,
    value,
    position: number = 1,
    timeout: number = 20000
  ) => {
    await this.ensureLocator(
      `(//${element}[contains(text(), '${value}')])[${position}]`
    ).waitFor({
      state: "hidden",
      timeout: timeout,
    })
  }

  public verifyValueV2 = async (locator, value, timeout: number = 20000) => {
    const actual = await this.page.locator(locator).inputValue({
      timeout: timeout,
    })
    expect(actual).toBe(value)
  }

  public isReadOnly = async (locator) => {
    await expect(this.ensureLocator(locator)).toHaveAttribute("readonly", "")
  }

  // await this.page.locator(locator).all()
  public verifyList = async (
    locator: any,
    position: number,
    timeout: number = 30000
  ) => {
    await this.ensureLocator(`(${locator})[${position}]`).waitFor({
      state: "visible",
      timeout: timeout,
    })
  }

  public notVerifyList = async (
    locator: any,
    position: number,
    timeout: number = 20000
  ) => {
    await this.ensureLocator(`(${locator})[${position}]`).waitFor({
      state: "hidden",
      timeout: timeout,
    })
  }

  public clickElementPosition = async (
    selector: string | Locator,
    position: number = 1,
    force: boolean = true
  ) => {
    await this.page.waitForTimeout(1000)
    // await this.waitForVisible(selector, timeout)
    await expect(this.ensureLocator(`(${selector})[${position}]`)).toBeEnabled({
      timeout: 15000,
    })
    await this.ensureLocator(`(${selector})[${position}]`).click({
      force: force,
    })
  }
  public isVisible = async (locator, timeout: number = 20000) => {
    await this.ensureLocator(locator).waitFor({
      state: "visible",
      timeout: timeout,
    })
  }

  public isVisibleText = async (element, value, timeout: number = 20000) => {
    await this.ensureLocator(
      `//${element}[contains(text(), '${value}')]`
    ).waitFor({
      state: "visible",
      timeout: timeout,
    })
  }

  public cookMyDate = (dirtyDateString: string): string => {
    try {
      const dateObject = new Date(dirtyDateString)

      // cook options
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Ho_Chi_Minh",
        month: "short", // Aug
        day: "numeric", // 12
        year: "numeric", // 2025
        hour: "numeric", // 11
        minute: "numeric", // 54
        hour12: true, // AM/PM
      }

      // cook date
      const cleanDate = new Intl.DateTimeFormat("en-US", options).format(
        dateObject
      )
      return cleanDate
    } catch (error) {
      console.error("Cook Failed:", error)
      return ""
    }
  }

  public cookMyDateWithGMT = (utcDateString: string): string => {
    try {
      const dateObject = new Date(utcDateString)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Ho_Chi_Minh",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZoneName: "short",
      }

      const legalizedString = new Intl.DateTimeFormat("en-US", options).format(
        dateObject
      )

      return legalizedString
    } catch (error) {
      console.error("cook failed", error)
      return "Invalid Timestamp"
    }
  }

  public cookMyDateShort = (dirtyDateString: string): string => {
    try {
      const dateObject = new Date(dirtyDateString)

      // cook options
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "Asia/Ho_Chi_Minh",
        month: "short", // Aug
        day: "numeric", // 12
        year: "numeric", // 2025
      }

      // cook date
      const cleanDate = new Intl.DateTimeFormat("en-US", options).format(
        dateObject
      )
      return cleanDate
    } catch (error) {
      console.error("Cook Failed:", error)
      return ""
    }
  }

  public cookMyRealtimeDate = (
    dateToForge: Date,
    monthNumChar: number = 4
  ): string => {
    try {
      const timeZone = "Asia/Ho_Chi_Minh"

      const day = new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        timeZone,
      }).format(dateToForge)
      const month = new Intl.DateTimeFormat("en-GB", {
        month: "short",
        timeZone,
      }).format(dateToForge)
      const year = new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        timeZone,
      }).format(dateToForge)
      const time = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
        timeZone,
      }).format(dateToForge)
      const d = parseInt(day) > 9 ? parseInt(day) : "0" + parseInt(day)

      return `as of ${d} ${month.substring(0, monthNumChar)}, ${year} at ${time}`
    } catch (error) {
      console.error("cook failed", error)
      return "Forgery Failed"
    }
  }

  public cookNameByDate = (randomLength: number = 6): string => {
    const today = new Date()
    const day = today.getDate()
    const month = today.getMonth() + 1
    const randomPart = Math.random()
      .toString(36)
      .slice(2, 2 + randomLength)
    const codename = `aes${day}${month}a${randomPart}`
    return codename
  }

  public uploadImg = async (selector: string, url, page: any = this.page) => {
    try {
      const element = page.locator(selector).first()
      // Upload the image
      await element.setInputFiles(url)
      return true
    } catch (error) {
      console.log("Upload failed:" + error)
      return false
    }
  }

  public capitalizeFirstLetter = (str: string): string => {
    if (!str) return ""
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  public convertNull<T>(value: T | null | undefined): T | string {
    return value == null ? "--" : value
  }

  public async getTextContent(
    locator: string,
    position: number = 1
  ): Promise<string> {
    const element = this.page.locator(`(${locator})[${position}]`)
    await expect(element).toHaveCount(1)

    const text = await element.textContent()
    return text ?? ""
  }
  public buildRandomString() {
    const randomAlias = Math.random().toString(36).substring(2, 10)
    return randomAlias
  }

  public getDatetime = (format: string): string | number => {
    const now = new Date()

    switch (format.toLowerCase()) {
      case "day": {
        const day = now.getDate()
        return day.toString().padStart(2, "0")
      }

      case "month": {
        const month = now.getMonth() + 1
        return month.toString().padStart(2, "0")
      }

      case "year":
        return now.getFullYear()

      case "hour": {
        const hour24 = now.getHours()
        const hour12 = hour24 % 12 || 12
        return hour12.toString().padStart(2, "0")
      }

      case "minute":
        return now.getMinutes()

      case "second":
        return now.getSeconds()

      default:
        console.error(`Invalid format: "${format}"`)
        return "Invalid Format"
    }
  }
  public inserEmailContent = async (emailContent: string) => {
    await this.page.keyboard.type(emailContent, { delay: 150 })
  }
}