const core = require('@actions/core')

const {context, getToken} = require('@adobe/aio-lib-ims')
const {init} = require('@adobe/aio-lib-cloudmanager')
const {REQUIRED} = require('./constants')

const CONTEXT = 'aio-cloudmanager-github-actions'
const SCOPE = 'ent_cloudmgr_sdk'

async function initSdk(imsOrgId) {
    core.info('creating access token using provided configuration')

    const key = core.getInput('key', REQUIRED)
    const apiKey = core.getInput('clientId', REQUIRED)
    const clientSecret = core.getInput('clientSecret', REQUIRED)
    const techAccId = core.getInput('technicalAccountId', REQUIRED)
    const baseUrl = core.getInput('baseUrl', REQUIRED)

    const imsConfig = {
        client_id: apiKey,
        client_secret: clientSecret,
        technical_account_id: techAccId,
        ims_org_id: imsOrgId,
        private_key: key.toString(),
        meta_scopes: [
            SCOPE,
        ]
    }

    core.info('ims config: ' + imsConfig)

    await context.set(CONTEXT, imsConfig, true)
    const accessToken = await getToken(CONTEXT)

    core.info('access token: ' + accessToken)

    return await init(imsOrgId, apiKey, accessToken, baseUrl)
}

module.exports = {
    initSdk
}
