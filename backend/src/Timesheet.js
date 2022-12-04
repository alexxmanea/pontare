import puppeteer from "puppeteer";
import {
    LOGIN_URL,
    FIELDS,
    DATE_FORMATS,
    DAY_TYPES,
} from "./Constants.js";
import { decryptPassword } from "./PasswordEncryption.js";
import { isWeekendOrHoliday } from "./Utils.js";

const textFieldClearAndType = async (page, element, value) => {
    // Selectare text-field, golire (triplu click pentru a selecta textul existent) si introducere valoare
    const pageElement = await page.$(element);
    await pageElement.click({ clickCount: 3 });
    await pageElement.type(value);
};

const launchBrowserOnMainPage = async () => {
    const browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        executablePath: "/usr/bin/chromium-browser",
        defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto(LOGIN_URL);

    return { browser: browser, page: page };
};

const login = async (page, username, password) => {
    // Introducere username
    await textFieldClearAndType(page, FIELDS.login.username, username);
    // Introducere parola
    await textFieldClearAndType(page, FIELDS.login.password, password);
    // Click pe butonul "Intra"
    await Promise.all([
        page.waitForNavigation(),
        page.click(FIELDS.login.submit),
    ]);

    if ((await page.content()).includes(FIELDS.login.errorText)) {
        return false;
    }

    return true;
};

export const checkValidTimesheetCredentials = async (username, password) => {
    const { page, browser } = await launchBrowserOnMainPage();

    // Introducere username
    await textFieldClearAndType(page, FIELDS.login.username, username);
    // Introducere parola
    await textFieldClearAndType(page, FIELDS.login.password, password);
    // Click pe butonul "Intra"
    await Promise.all([
        page.waitForNavigation(),
        page.click(FIELDS.login.submit),
    ]);

    if ((await page.content()).includes(FIELDS.login.errorText)) {
        return false;
    }

    await browser.close();

    return true;
};

const navigateToAddPage = async (page) => {
    // Navigare catre pagina "Manopera" din meniul principal
    await Promise.all([
        page.waitForNavigation(),
        page.click(FIELDS.manopera.main),
    ]);

    // Navigare catre pagina "Adauga manopera" din meniul "Manopera"
    await Promise.all([
        page.waitForNavigation(),
        page.click(FIELDS.manopera.add),
    ]);
};

const navigateToTimesheetPage = async (page) => {
    // Navigare catre pagina "Manopera" din meniul principal
    await Promise.all([
        page.waitForNavigation(),
        page.click(FIELDS.manopera.main),
    ]);
};

const dateIsAlreadyInTimesheet = async (
    remoteTimesheetPageContent,
    momentDate
) => {
    if (
        remoteTimesheetPageContent.includes(
            momentDate.format(DATE_FORMATS.etrans)
        )
    ) {
        return true;
    }

    return false;
};

export const getRemoteTimesheetPageContent = async (page) => {
    await navigateToTimesheetPage(page);

    const pageContent = await page.content();

    return pageContent;
};

export const startPageAndLogin = async (username, password) => {
    const { page, browser } = await launchBrowserOnMainPage();

    const decryptedPassword = decryptPassword(password);

    if ((await login(page, username, decryptedPassword)) === false) {
        await browser.close();
        return { retCode: false };
    }

    return { retCode: true, page: page, browser: browser };
};

export const closeBrowser = async (browser) => {
    await browser.close();
};

export const addToTimesheet = async (
    page,
    remoteTimesheetPageContent,
    momentDate,
    dayType = DAY_TYPES.workday
) => {
    if (
        await dateIsAlreadyInTimesheet(remoteTimesheetPageContent, momentDate)
    ) {
        return true;
    }

    if (isWeekendOrHoliday(momentDate)) {
        return false;
    }

    await navigateToAddPage(page);

    const project = {
        select: FIELDS.manopera.project.work.select,
        option: FIELDS.manopera.project.work.option,
    };

    if (dayType === DAY_TYPES.vacation) {
        project.select = FIELDS.manopera.project.vacation.select;
        project.option = FIELDS.manopera.project.vacation.option;
    }

    // Modificare select-field "Proiect" si implicit si select-field "WBS"
    await page.evaluate(
        (select, option) => {
            document.querySelector(option).selected = true;

            const event = new Event("change", { bubbles: true });
            document.querySelector(select).dispatchEvent(event);
        },
        project.select,
        project.option
    );

    // Modificare "Data efectuare"
    await page.$eval(
        FIELDS.manopera.date,
        (element, value) => {
            element.value = value;
        },
        momentDate.format(DATE_FORMATS.etrans)
    );

    // Modificare "Numar ore"
    await textFieldClearAndType(
        page,
        FIELDS.manopera.hours.element,
        FIELDS.manopera.hours.value
    );

    // Selectare checkbox "Este telemunca?"
    await page.$eval(
        FIELDS.manopera.isWorkFromHome,
        (element) => (element.checked = true)
    );

    // Click pe butonul "Salveaza"
    await Promise.all([
        page.waitForNavigation(),
        page.click(FIELDS.manopera.submit),
    ]);

    return true;
};
