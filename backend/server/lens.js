import {
  signCreatePostTypedData, lensHub, splitSignature
} from '../api'

const createLenPost = async (profileId, ipfsPath) => {
  const createPostRequest = {
    profileId,
    contentURI: 'ipfs://' + ipfsPath,
    collectModule: {
      freeCollectModule: {
        followerOnly: true
      }
    },
    referenceModule: {
      followerOnlyReferenceModule: false
    },
  }
  try {
    const signedResult = await signCreatePostTypedData(createPostRequest, token)
    const typedData = signedResult.result.typedData
    const {
      v,
      r,
      s
    } = splitSignature(signedResult.signature)
    const tx = await lensHub.postWithSig({
      profileId: typedData.value.profileId,
      contentURI: typedData.value.contentURI,
      collectModule: typedData.value.collectModule,
      collectModuleInitData: typedData.value.collectModuleInitData,
      referenceModule: typedData.value.referenceModule,
      referenceModuleInitData: typedData.value.referenceModuleInitData,
      sig: {
        v,
        r,
        s,
        deadline: typedData.value.deadline,
      },
    })
    console.log('successfully created post: tx hash', tx.hash)
  } catch (err) {
    console.log('error posting publication: ', err)
  }
}