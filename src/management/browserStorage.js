import moment from "moment/moment";

/**
 * Stores data in the local storage with an optional expiry time.
 * @param {string} key - The key to use for storing the data.
 * @param {any} data - The data to be stored.
 * @param {number} expiry - The expiry time in minutes (default is 2 minutes).
 * @returns {Promise<boolean>} - Returns a promise that resolves to true when the data is successfully stored.
 */
export async function storeData(key, data, expiry = 2) {
  const store = {
    data: data,
    time: moment.now("x"),
    expiry: expiry,
  };
  await localStorage.setItem(key, JSON.stringify(store));
  return true;
}

/**
 * Retrieves data from the local storage based on the provided key.
 * @param {string} key - The key used for storing the data.
 * @returns {any|null} - Returns the stored data if it is valid and not expired, otherwise returns null.
 */
export async function getData(key) {
  const data = JSON.parse(localStorage.getItem(key));
  if (data === null || data.data == null) {
    return null;
  }
  if (moment(data.time, "x").isBefore(moment().subtract(data.expiry, "minutes"))) {
    return null;
  }
  return data.data;
}

/**
 * Retrieves the token from the local storage and checks if it is valid.
 * @returns {string|null} - Returns the token if it is valid and not expired, otherwise returns null.
 */
export function getToken() {
  const data = JSON.parse(localStorage.getItem("token"));
  if (data === null || data.data == null) {
    return null;
  }
  if (moment(data.time, "x").isBefore(moment().subtract(60, "minutes"))) {
    return null;
  }
  return data.data;
}
