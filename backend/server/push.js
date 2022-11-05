const PushAPI = require('@pushprotocol/restapi')
const ethers = require('ethers')

const PK = 'ba28f8b5520688563dabda382db5b955164a261dcacf42e89dde7bf806033ae3' // channel private key - test account
const Pkey = `0x${PK}`
const signer = new ethers.Wallet(Pkey)

const sendNotification = async (recipientAddress, title, body) => {
  try {
    const apiResponse = await PushAPI.payloads.sendNotification({
      signer,
      type: 3, // target
      identityType: 2, // direct payload
      notification: {
        title,
        body
      },
      payload: {
        title,
        body,
        cta: '',
        img: ''
      },
      recipients: 'eip155:5:' + recipientAddress, // recipient address
      channel: 'eip155:5:0x052720054C6caC8b4E740c7769F47a5f14B1aC01', // your channel address
      env: 'staging'
    })

    // apiResponse?.status === 204, if sent successfully!
    console.log('API repsonse: ', apiResponse)
  } catch (err) {
    console.error('Error: ', err)
  }
}

module.exports = { sendNotification }