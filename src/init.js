const core = require('@actions/core')

const {context, getToken} = require('@adobe/aio-lib-ims')
const {CLI} = require('@adobe/aio-lib-ims/src/context')
const {init} = require('@adobe/aio-lib-cloudmanager')
const jwt = require('jsonwebtoken')
const {REQUIRED} = require('./constants')

const CONTEXT = 'aio-cloudmanager-github-actions'
const SCOPE = 'ent_cloudmgr_sdk'

async function initSdk(imsOrgId) {
    let apiKey
    let accessToken
    // try cli context first
    const contextData = await context.get(CLI)
    if (contextData && contextData.data) {
        core.info('using access token from CLI authentication context')
        accessToken = await getToken(CLI)
        // no need here to validate the token
        const decodedToken = jwt.decode(accessToken)
        if (!decodedToken) {
            throw new Error('Cannot decode token read from CLI authentication context')
        }
        apiKey = decodedToken.client_id
        if (!apiKey) {
            throw new Error('The decoded token from the CLI authentication context did not have a client_id')
        }
    } else {
        core.info('creating access token using provided configuration')

        const key = core.getInput('key', REQUIRED)

        apiKey = core.getInput('clientId', REQUIRED)

        const clientSecret = core.getInput('clientSecret', REQUIRED)

        const techAccId = core.getInput('technicalAccountId', REQUIRED)

        const imsConfig = {
            client_id: apiKey,
            client_secret: clientSecret,
            technical_account_id: techAccId,
            ims_org_id: imsOrgId,
            private_key: key.toString(),
            meta_scopes: [
                SCOPE,
            ],
        }
        await context.set(CONTEXT, imsConfig, true)
        accessToken = await getToken(CONTEXT)
    }

    return await init(imsOrgId, apiKey, accessToken)
}

module.exports = {
    initSdk,
}
