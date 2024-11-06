import tl = require('azure-pipelines-task-lib/task')
import azdev = require('azure-devops-node-api')
import { CommentThreadStatus, CommentType, GitPullRequestCommentThread } from 'azure-devops-node-api/interfaces/GitInterfaces'
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

    const addCommentOnlyOnce = tl.getBoolInput('addCommentOnlyOnce', false)
    if(addCommentOnlyOnce) {
      // Get old threads and check if there is already a thread with the comment task property
      const threads = await gitApi.getThreads(repositoryId, pullRequestId)
      if(threads != undefined && threads.length > 0) {
        for(const thread of threads) {
          if(thread.properties != undefined && thread.properties['pr-comment-task'] != undefined) {
            console.log(`Thread already exists with comment task property - skipping PR comment`)
            return
          }
        }        
      }
    }

    const updatePreviousComment = tl.getBoolInput('updatePreviousComment', false)
    if(updatePreviousComment) {
      // Get old threads and check if there is already a thread with the comment task property
      const threads = await gitApi.getThreads(repositoryId, pullRequestId)
      if(threads != undefined && threads.length > 0) {
        for(const thread of threads) {
          if( thread.properties != undefined && 
              thread.properties['pr-comment-task'] != undefined &&
              thread.id != undefined &&
              thread.comments != undefined &&
              thread.comments.length > 0) {
            console.log(`Thread already exists with comment task property - updating PR comment`)

            const firstComment = thread.comments[0]
            if(
              firstComment.commentType != CommentType.Text ||
              firstComment.id == undefined
            ) {
              console.log(`First comment is not a text comment - skipping PR comment update`)
              return
            }
            firstComment.content = markdownContent ?? comment
            const c = await gitApi.updateComment(
              firstComment, 
              repositoryId, 
              pullRequestId, 
              thread.id, 
              firstComment.id
            )
            console.log(`Comment updated on pull request: ${comment}`)
            return
          }
        } 
      }
      console.log(`No thread found with comment task property - skipping PR comment update and adding new comment`)
    }

    const thread : GitPullRequestCommentThread = {
      comments: [{
        commentType: CommentType.Text,
        content: markdownContent ?? comment,
      }],
      lastUpdatedDate: new Date(),
      publishedDate: new Date(),
      status: isActive ? CommentThreadStatus.Active : CommentThreadStatus.Closed,
      properties: {
        'pr-comment-task': 'true'
      }
    }
    const t = await gitApi.createThread(thread, repositoryId, pullRequestId)
    console.log(`Comment added on pull request: ${comment}`)
  }
  catch (err:any) {
    tl.setResult(tl.TaskResult.Failed, err.message)
  }
}

run()