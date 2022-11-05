const { setData, getData } = require('./firebase')
const { authenticate } = require('./auth')
const uuid = require('uuid4')

/**
 * Create project
 * @param {req} req
 * @param {res} res
 */
async function createProject (req, res) {
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

  return {
    project_id: projectId
  }
}

/**
 * List projects
 * @param {req} req
 * @param {res} res
 */
async function listProjects (req, res) {
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

module.exports = { createProject, listProjects }
