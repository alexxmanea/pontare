const REST_PROTOCOL = "http";
const REST_ADDRESS = window.location.href.split("/")[2].split(":")[0];
const REST_PORT = "3001";
export const REST_URL = `${REST_PROTOCOL}://${REST_ADDRESS}:${REST_PORT}`;

export const INVALID_CREDENTIALS = "invalid_credentials";
export const INVALID_TIMESHEET_CREDENTIALS = "invalid_timesheet_credentials";
export const SERVER_ERROR = "server_error";
export const USER_EXISTS = "user_exists";
