export const LOGIN_URL = "https://www.e-trans.ro/prlogs-beta/login.php";

export const FIELDS = {
    login: {
        username:
            "#inner-container > form > table > tbody > tr:nth-child(1) > td:nth-child(2) > input[type=text]",
        password:
            "#inner-container > form > table > tbody > tr:nth-child(2) > td:nth-child(2) > input[type=password]",
        submit: "#inner-container > form > table > tbody > tr:nth-child(3) > td:nth-child(1) > input[type=submit]",
        errorText:
            "Nu sunteti autorizat sa folositi sistemul. Va rugam sa va autentificati!",
    },
    manopera: {
        main: "#navigation_buyerpg > p > span > a[href='lista_manopera.php']",
        add: "#subnav_txt > a:nth-child(1)",
        project: {
            work: {
                select: "#fk_proiect",
                option: "#fk_proiect > option[value='372']",
                // option: "#fk_proiect > option:nth-child(189)",
            },
            vacation: {
                select: "#fk_proiect",
                option: "#fk_proiect > option[value='371']",
            },
        },
        date: "#data_efectuare",
        hours: { element: "#nr_ore", value: "8" },
        isWorkFromHome: "#is_telemunca",
        submit: "#submit_btn",
    },
};

export const DATE_FORMATS = {
    default: "DD/MM/YYYY",
    etrans: "YYYY-MM-DD",
};

export const DAY_TYPES = { workday: "Workday", vacation: "Vacation" };
export const ADD_TO_TIMESHEET_MAX_RETRIES = 3;
export const ADD_TO_TIMESHEET_DELAY = 1000;

export const DEFAULT_TEAM = "Dezvoltare";

export const DEFAULT_USER_DATA = {
    defaultVacationDays: 25,
    workDaysAdded: 0,
    vacationDaysAdded: 0,
    slackSubscription: false,
    slackMemberId: null,
    emailSubscription: true,
    automaticTimesheetSubscription: false,
    timesheetHistory: [],
    nextVacation: [],
    team: DEFAULT_TEAM,
};

export const SERVER_ERROR = "server_error";
