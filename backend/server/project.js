const { setData, getData } = require('./firebase')
const { authenticate } = require('./auth')
const { sendNotification } = require('./push')
const { contractABI } = require("./constants.js")
const { ethers } = require('ethers');

const infuraProvider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/5b097d2dbc6749448e0f5419c7a3da7d")
const contractAddress = "0x6FF8Ad006DF88f8fDA884699D9365eC712690f94"

const uuid = require('uuid4')

/**
 * Create project
 * @param {req} req
 * @param {res} res
 */
async function createProject(req, res) {
  // authenticate
  const userData = await authenticate(req, res)
  if (!userData) {
    return
  }

  // set project object
  const projectId = uuid(4)
  const projectObject = {
    name: req.body.name,
    category: req.body.category,
    logo_url: req.body.logo_url,
    description: req.body.description,
    stage: req.body.stage,
    coin: req.body.coin,
    target: req.body.target,
    liverpeer_url: req.body.target.liverpeer_url
  }

  await setData('projects/' + projectId, projectObject)

  // PUSH notification
  // send message to founder
  const founder_title = 'Congrats on creating your project - ' + req.body.name
  const founder_body = 'We are excited to inform your that your project *' + req.body.name + '* is created successfully on CryptoWharf!'
  await sendNotification(userData.wallet_address, founder_title, founder_body, 3) // 3 -> a target user

  // sned message to all investers
  const investors_title = 'We have a new project - ' + req.body.name
  const investors_body = 'We are excited to inform your that we have a new project *' + req.body.name + '* is doing fundraising!'
  await sendNotification(userData.wallet_address, investors_title, investors_body, 1) // 1 -> a broadcast

  return {
    project_id: projectId
  }
}

/**
 * List projects
 * @param {req} req
 * @param {res} res
 */
async function listProjects(req, res) {
  // authenticate
  const userData = await authenticate(req, res)
  if (!userData) {
    return
  }

  // list projects
  const projectObjects = await getData('projects/')

  return {
    projectObjects
  }
}

/**
 * List projects
 * @param {req} req
 * @param {res} res
 */
async function investInProject(req, res) {
  // authenticate
  const userData = await authenticate(req, res)
  if (!userData) {
    return
  }

  const project_id = req.body.project_id
  const amount = req.body.amount

  // get project object
  const projectObject = await getData('projects/' + project_id)

  const contract = new ethers.Contract(contractAddress, contractABI, infuraProvider);

  // Call smartcontract to get progress and other info
  const plan_status = await contract.viewPlanStatus(project_id)

  // Check if investment is valid based on target amount, min, expiration etc

  // Call smartcontract to invest on user's behave
  await contract.delegateInvestInPlan(userData.wallet_address, amount, project_id)

  // Call NFT storage and mint NFT

  // Send push if raise is reaching a milestone
  if (plan_status[3] + amount >= plan_status[0]) {
    const title = 'Your project - ' + projectObject.name + ' has raised 100% of your target'
    const body = 'We are excited to inform your that your project *' + projectObject.name + '* has raised 100% of your target!'
    await sendNotification(userData.wallet_address, title, body)
  }

  return {
    'success': true,
  }
}

module.exports = { createProject, listProjects, investInProject }
