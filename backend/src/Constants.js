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
        main: "#navigation_buyerpg > p > span:nth-child(7) > a",
        add: "#subnav_txt > a:nth-child(1)",
        project: {
            work: {
                select: "#fk_proiect",
                option: "#fk_proiect > option:nth-child(13)",
            },
            vacation: {
                select: "#fk_proiect",
                option: "#fk_proiect > option:nth-child(5)",
            },
        },
        date: "#data_efectuare",
        hours: { element: "#nr_ore", value: "8" },
        isWorkFromHome: "#is_telemunca",
        submit: "#submit_btn",
    },
};

export const ETRANS_DATE_FORMAT = "YYYY-MM-DD";
export const DATE_FORMAT = "DD/MM/YYYY";

export const DAY_TYPES = { workday: "Workday", vacation: "Vacation" };
export const ADD_TO_TIMESHEET_MAX_RETRIES = 3;
export const ADD_TO_TIMESHEET_DELAY = 1000;

export const DEFAULT_VACATION_DAYS = 25;
export const DEFAULT_WORKDAYS_ADDED = 0;
export const DEFAULT_VACATION_DAYS_ADDED = 0;
export const DEFAULT_SLACK_SUBSCRIPTION = false;
export const DEFAULT_SLACK_MEMBER_ID = null;
export const DEFAULT_EMAIL_SUBSCRIPTION = true;
export const DEFAULT_DAILY_TIMESHEET_SUBSCRIPTION = false;
export const DEFAULT_TIMESHEET_HISTORY = [];

export const SERVER_ERROR = "server_error";
