// server/firebase.js

const admin = require('firebase-admin')
const serviceAccount = require('../firebase_admin.json')
const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const DATABASE_URL = 'https://jomo-hackathon-default-rtdb.firebaseio.com/'
const DATABASE_PATH = `${process.env.TEST_ENV_NAME ===
  ''
  ? '/'
  : process.env.TEST_ENV_NAME + '/'}`

/**
 * Add two numbers.
 * @return {number} The DB
 */
function getDB() {
  if (process.env.RUNTIME_ENV !== 'test' && process.env.TEST_ENV_NAME !== '') {
    console.log('Invalid ENV settings for database.')
    return null
  }
  if (process.env.RUNTIME_ENV === 'test' && process.env.TEST_ENV_NAME === '') {
    console.log('Invalid ENV settings for database.')
    return null
  }
  return app.database(DATABASE_URL)
}

/**
 * Add two numbers.
 * @param {string} path
 * @return {number} The sum of the two numbers.
 */
async function getData(path) {
  const data = await getDB().ref(DATABASE_PATH + path).once('value')
  return data.val()
}

/**
 * Add two numbers.
 * @param {string} path
 * @param {string} obj
 */
async function setData(path, obj) {
  await getDB().ref(DATABASE_PATH + path).update(obj)
}

/**
 * Add two numbers.
 * @param {string} path
 * @param {string} obj
 */
async function pushToList(path, obj) {
  await getDB().ref(DATABASE_PATH + path).push(obj)
}

/**
 * Add two numbers.
 * @param {string} updates
 */
async function batchUpdate(updates) {
  await getDB().ref(DATABASE_PATH).update(updates)
}

/**
 * Add two numbers.
 * @param {string} path
 * @param {string} eventName
 * @param {string} callbackFunction
 */
function registerHook(path, eventName, callbackFunction) {
  getDB().ref(DATABASE_PATH + path).on(eventName, callbackFunction)
}

/**
 * Add two numbers.
 * @param {string} path
 * @param {string} eventName
 * @param {string} callbackFunction
 */
function detachHook(path, eventName, callbackFunction) {
  getDB().ref(DATABASE_PATH + path).off(eventName, callbackFunction)
}

module.exports = {
  getData,
  setData,
  pushToList,
  batchUpdate,
  registerHook,
  detachHook
}
