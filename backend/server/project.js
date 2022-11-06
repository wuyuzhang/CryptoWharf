const { setData, getData } = require('./firebase')
const { authenticate } = require('./auth')
const { sendNotification } = require('./push')

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
    stage: req.body.stage
  }

  await setData('projects/' + projectId, projectObject)

  // send notification using PUSH
  const title = 'Congrats on creating your project - ' + req.body.name
  const body = 'We are excited to inform your that your project *' + req.body.name + '* is created successfully on CryptoWharf!'
  await sendNotification(userData.wallet_address, title, body)

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
  const token_contract = req.body.token_contract

  // get project object
  const projectObject = await getData('projects/' + project_id)

  // Call smartcontract to get progress and other info

  // 0x swap token to project base token contract

  // Grant allowance for the base token contract and the amount

  // Call smartcontract to invest on user's behave

  // Call smartcontract to check raising progress

  // Send push if raise is reaching a milestone
  const title = 'Your project - ' + req.body.name + ' has raised 100% of your target'
  const body = 'We are excited to inform your that your project *' + req.body.name + '* has raised 100% of your target!'
  await sendNotification(userData.wallet_address, title, body)


  return {
    projectObject
  }
}

module.exports = { createProject, listProjects, investInProject }
