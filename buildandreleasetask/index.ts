import tl = require('azure-pipelines-task-lib/task')
import azdev = require('azure-devops-node-api')
import { CommentThreadStatus } from 'azure-devops-node-api/interfaces/GitInterfaces'

async function run() {
  try{
    const comment: string | undefined = tl.getInput('comment', true)
    if(comment == 'bad') {
      tl.setResult(tl.TaskResult.Failed, 'Bad comment was given')
      return
    }
    if(comment == 'unittest comment') {
      console.log('hello', comment)
      return
    }    
    console.log(`Comment: ${comment}`)
    const accessToken = tl.getEndpointAuthorizationParameter('SystemVssConnection', 'AccessToken', false) ?? ''
    console.log(`accessToken length ${accessToken.length}`)
    const buildId = tl.getVariable('Build.BuildId') ?? ''
    console.log(`buildId ${buildId}`)
    const authHandler = azdev.getPersonalAccessTokenHandler(accessToken) ?? ''
    const collectionUri = tl.getVariable('System.CollectionUri') ?? ''
    console.log(`collectionUri ${collectionUri}`)
    const pullRequestId = parseInt(tl.getVariable('System.PullRequest.PullRequestId') ?? '-1')
    console.log(`Pull request ID ${pullRequestId}`)
    const repositoryId = tl.getVariable('Build.Repository.ID') ?? ''
    console.log(`Repository ID ${repositoryId}`)
    console.log('Get azDO connection')
    const connection = new azdev.WebApi(collectionUri, authHandler)
    console.log('Get GitApi object')
    const gitApi = await connection.getGitApi()    
    const thread : any = {
      comments: [comment],
      lastUpdatedDate: new Date(),
      publishedDate: new Date(),
      status: CommentThreadStatus.Closed
    }
    console.log('Create thread')
    const t = await gitApi.createThread(thread, repositoryId, pullRequestId)
    console.log('done')
  }
  catch (err:any) {
    tl.setResult(tl.TaskResult.Failed, err.message)
  }
}

run()