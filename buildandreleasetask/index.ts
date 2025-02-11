import tl = require('azure-pipelines-task-lib/task')
import azdev = require('azure-devops-node-api')
import { Comment, CommentThreadStatus, CommentType, GitPullRequestCommentThread } from 'azure-devops-node-api/interfaces/GitInterfaces'
import * as fs from 'fs'

async function run() {
  try {
    const markdownFile: string | undefined = tl.getPathInput('markdownFile', false)
    let markdownContent: string | undefined = undefined
    // We need to check if the markdown file was given with "filePathSupplied"
    // because the task lib will return root folder string in any case as part of the getPathInput return value
    if (markdownFile != undefined && tl.filePathSupplied('markdownFile')) {
      console.log(`Markdown file given: ${markdownFile}`)
      if (!fs.existsSync(markdownFile)) {
        throw new Error(`File ${markdownFile} does not exist`)
      }
      console.log(`Reading markdown content from file: ${markdownFile}`)
      try {
        markdownContent = fs.readFileSync(markdownFile, 'utf8')
      } catch (err: any) {
        console.log(`Error reading markdown file: ${err.message}`)
      }
    }
    const comment: string | undefined = tl.getInput('comment', true)
    if (comment == '' || comment == undefined) {
      console.log(`Empty comment given - skipping PR comment`)
      return
    }
    const pullRequestInput: string | undefined = tl.getInput('pullRequestId', false) ?? tl.getVariable('System.PullRequest.PullRequestId') ?? '-1'
    const pullRequestId = parseInt(pullRequestInput)
    if (pullRequestId < 0) {
      console.log(`No pull request id - skipping PR comment`)
      return
    }
    const repositoryId: string | undefined = tl.getInput('repositoryId', false) ?? tl.getVariable('Build.Repository.ID') ?? ''

    const accessToken = tl.getEndpointAuthorizationParameter('SystemVssConnection', 'AccessToken', false) ?? ''
    const authHandler = azdev.getPersonalAccessTokenHandler(accessToken) ?? ''
    const collectionUri = tl.getVariable('System.CollectionUri') ?? ''
    const connection = new azdev.WebApi(collectionUri, authHandler)
    const gitApi = await connection.getGitApi()
    const isActive = tl.getBoolInput('active', false)

    const addCommentOnlyOnce = tl.getBoolInput('addCommentOnlyOnce', false)
    if (addCommentOnlyOnce) {
      // Get old threads and check if there is already a thread with the comment task property
      const threads = await gitApi.getThreads(repositoryId, pullRequestId)
      console.log(`Checking if there is a thread with comment task property to add the PR comment only once`)
      if (threads != undefined && threads.length > 0) {
        for (const thread of threads) {
          console.log(`Checking thread: ${thread.id} with properties: ${JSON.stringify(thread.properties ?? {})}`)
          if (thread.properties != undefined && thread.properties['PullRequestCommentTask'] != undefined) {
            console.log(`Thread already exists with comment task property - skipping PR comment`)
            return
          }
        }
      }
    }

    const updatePreviousComment = tl.getBoolInput('updatePreviousComment', false)
    if (updatePreviousComment) {
      // Get old threads and check if there is already a thread with the comment task property
      const threads = await gitApi.getThreads(repositoryId, pullRequestId)
      console.log(`Checking if there is a thread with comment task property to update the PR comment`)
      if (threads != undefined && threads.length > 0) {
        for (const thread of threads) {
          console.log(`Checking thread: ${thread.id} with properties: ${JSON.stringify(thread.properties ?? {})}`)
          if (thread.properties != undefined &&
            thread.properties['PullRequestCommentTask'] != undefined &&
            thread.id != undefined) {
            console.log(`Thread already exists with comment task property - updating PR comment`)

            const comments = await gitApi.getComments(repositoryId, pullRequestId, thread.id)
            if (comments == undefined || comments.length < 1) {
              console.log(`No comments found in thread - skipping PR comment update`)
              break
            }
            console.log(`Updating first comment in thread: ${comments[0].id}`)

            const firstComment = comments[0]
            if (
              firstComment.commentType != CommentType.Text ||
              firstComment.id == undefined
            ) {
              console.log(`First comment is not a text comment - skipping PR comment update`)
              return
            }
            const updatedComment: Comment = {
              commentType: CommentType.Text,
              content: markdownContent ?? comment,
            }

            const c = await gitApi.updateComment(
              updatedComment,
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

    const thread: GitPullRequestCommentThread = {
      comments: [{
        commentType: CommentType.Text,
        content: markdownContent ?? comment,
      }],
      lastUpdatedDate: new Date(),
      publishedDate: new Date(),
      status: isActive ? CommentThreadStatus.Active : CommentThreadStatus.Closed,
      properties: {
        'PullRequestCommentTask': 'true'
      }
    }
    const t = await gitApi.createThread(thread, repositoryId, pullRequestId)
    console.log(`Comment added on pull request: ${comment}`)
  }
  catch (err: any) {
    tl.setResult(tl.TaskResult.Failed, err.message)
  }
}

run()
