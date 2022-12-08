const core = require('@actions/core')
const {initSdk} = require('./init')
const {REQUIRED} = require('./constants')

function executeAction() {
    return new Promise((resolve) => {
        const imsOrgId = core.getInput('imsOrgId', REQUIRED)
        const programId = core.getInput('programId', REQUIRED)
        const pipelineId = core.getInput('pipelineId', REQUIRED)

        initSdk(imsOrgId).then(sdk => {
            sdk.createExecution(programId, pipelineId)
                .then(execution => {
                    console.log('Pipeline execution: ' + execution)

                    core.info(`Started execution ID ${execution.id}`)
                    core.setOutput('executionId', execution.id)
                    core.setOutput('executionHref', execution.link('self') && `${sdk.baseUrl}${execution.link('self').href}`)
                    resolve()
                })
                .catch(e => {
                    console.log('Error: ' + e)

                    core.setFailed(e)
                    resolve()
                })
        }).catch(e => {
            core.setFailed(e)
            resolve()
        })
    })
}

module.exports = {
    executeAction
}
