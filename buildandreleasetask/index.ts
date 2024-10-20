import tl = require('azure-pipelines-task-lib/task')
import azdev = require('azure-devops-node-api')
import { CommentThreadStatus, CommentType } from 'azure-devops-node-api/interfaces/GitInterfaces'
import * as fs from 'fs'

async function run() {
  try{
    const markdownFile: string | undefined = tl.getPathInput('markdownFile', false)
    let markdownContent: string | undefined = undefined
    // We need to check if the markdown file was given with "filePathSupplied" 
    // because the task lib will return root folder string in any case as part of the getPathInput return value
    if(markdownFile != undefined && tl.filePathSupplied('markdownFile')) {
      console.log(`Markdown file given: ${markdownFile}`)
      if(!fs.existsSync(markdownFile)) {
        throw new Error(`File ${markdownFile} does not exist`)
      }
      console.log(`Reading markdown content from file: ${markdownFile}`)
      try {
        markdownContent = fs.readFileSync(markdownFile, 'utf8')
      } catch (err:any) {
        console.log(`Error reading markdown file: ${err.message}`)
      }
    }
    const comment: string | undefined = tl.getInput('comment', true)
    if(comment == '' || comment == undefined) {
      console.log(`Empty comment given - skipping PR comment`)
      return
    }
    const pullRequestId = parseInt(tl.getVariable('System.PullRequest.PullRequestId') ?? '-1')
    if(pullRequestId < 0 ) {
      console.log(`No pull request id - skipping PR comment`)
      return
    }
    const accessToken = tl.getEndpointAuthorizationParameter('SystemVssConnection', 'AccessToken', false) ?? ''
    const authHandler = azdev.getPersonalAccessTokenHandler(accessToken) ?? ''
    const collectionUri = tl.getVariable('System.CollectionUri') ?? ''
    const repositoryId = tl.getVariable('Build.Repository.ID') ?? ''
    const connection = new azdev.WebApi(collectionUri, authHandler)
    const gitApi = await connection.getGitApi()
    const isActive = tl.getBoolInput('active', false)
    const thread : any = {
      comments: [{
        commentType: CommentType.Text,
        content: markdownContent ?? comment,
      }],
      lastUpdatedDate: new Date(),
      publishedDate: new Date(),
      status: isActive ? CommentThreadStatus.Active : CommentThreadStatus.Closed,
    }
    const t = await gitApi.createThread(thread, repositoryId, pullRequestId)
    console.log(`Comment added on pull request: ${comment}`)
  }
  catch (err:any) {
    tl.setResult(tl.TaskResult.Failed, err.message)
  }
}

run()