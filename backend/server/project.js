const { setData, getData } = require('./firebase')
const { authenticate } = require('./auth')
const { sendNotification } = require('./push')
const { storeNFT } = require('./nft_storage')
const { contractABI, nftContractABI } = require("./constants.js")
const { ethers } = require('ethers');
const Web3 = require("web3");
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    `https://polygon-mumbai.infura.io/v3/5b097d2dbc6749448e0f5419c7a3da7d`
  )
);

const infuraProvider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/5b097d2dbc6749448e0f5419c7a3da7d")
const contractAddress = "0x6D5948c9cFe56629b6cBfdE8eA806830365a8da1"
const PRIVATE_KEY = '7fc22f70a4ee05aa17a3a7db2da7e2a23fcaf0c0f7228e262f74d689da1d9d7a'
const nftContractAddress = "0xb565A7c1D5978131a8B42bD056D903F0765f07ab"

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
    livepeer_playbackurl: "24bc85jognfuyjz0"
  }

  await setData('projects/' + projectId, projectObject)

  const contract = new ethers.Contract(contractAddress, contractABI, infuraProvider);
  const signer = new ethers.Wallet(PRIVATE_KEY, infuraProvider);

  // Call smartcontract to get progress and other info
  await contract.connect(signer).createPlan(
    projectId,
    projectId,
    projectObject.name,
    userData.wallet_address,
    projectObject.target,
    0,
    1667918345000,
  )

  // PUSH notification
  // send message to founder
  const founder_title = 'Congrats on creating your project - ' + req.body.name
  const founder_body = 'We are excited to inform your that your project *' + req.body.name + '* is created successfully on CryptoWharf!'
  await sendNotification(userData.wallet_address, founder_title, founder_body, 3) // 3 -> a target user

  // send message to all investers
  const investors_title = 'We have a new project - ' + req.body.name
  const investors_body = 'We are excited to inform your that we have a new project *' + req.body.name + '* is doing fundraising!'
  await sendNotification(userData.wallet_address, investors_title, investors_body, 1) // 1 -> a broadcast

  return {
    project_id: projectId,
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
  const signer = new ethers.Wallet(PRIVATE_KEY, infuraProvider);

  // Call smartcontract to get progress and other info
  const plan_status = await contract.connect(signer).viewPlanStatus(project_id)

  // Check if investment is valid based on target amount, min, expiration etc

  // Call smartcontract to invest on user's behave
  await contract.connect(signer).delegateInvestInPlan(userData.wallet_address, amount, project_id)

  // Call NFT storage and mint NFT
  const imagePath = "../images/cryptowharf.jpg"
  const description = "Invested $" + amount + " USDC"
  const tokenURI = 'ipfs://bafyreidwhmxqpybwo6uj7acahighy5oby3gcctxgflumugnksybvuimw2a/metadata.json'

  // We get the tokenURI and pass it to the smart contract
  const nftContract = new ethers.Contract(nftContractAddress, nftContractABI, infuraProvider);
  await nftContract.connect(signer).mint(tokenURI, userData.wallet_address)

  // Send push if raise is reaching a milestone
  const title = 'Your project - ' + projectObject.name + ' has reached your raising target'
  const body = 'We are excited to inform your that your project *' + projectObject.name + '* has reached your raising target!'
  await sendNotification(userData.wallet_address, title, body, 3)

  return {
    'success': true,
  }
}

module.exports = { createProject, listProjects, investInProject }
