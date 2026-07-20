import tmrm = require('azure-pipelines-task-lib/mock-run')
import path = require('path')
import { CommentType } from 'azure-devops-node-api/interfaces/GitInterfaces'

const taskPath = path.join(__dirname, '..', 'index.js')
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath)
const taskProperty = 'PullRequestCommentTask'
const commentReferenceProperty = 'PullRequestCommentTask.CommentReference'

const gitApi = {
  getThreads: async (): Promise<any[]> => [
    {
      id: 300,
      isDeleted: true,
      properties: {
        [taskProperty]: { $value: 'true' },
        [commentReferenceProperty]: { $value: 'build-status' }
      }
    },
    {
      id: 100,
      properties: {
        [taskProperty]: { $value: 'true' },
        [commentReferenceProperty]: { $value: 'another-comment' }
      }
    },
    {
      id: 200,
      properties: {
        [taskProperty]: { $value: 'true' },
        [commentReferenceProperty]: { $value: 'build-status' }
      }
    }
  ],
  getComments: async (_repositoryId: string, _pullRequestId: number, threadId: number): Promise<any[]> => {
    console.log(`Fetched comments for thread: ${threadId}`)
    return [{ id: 22, commentType: CommentType.Text, content: 'Previous comment' }]
  },
  deleteComment: async (
    _repositoryId: string,
    _pullRequestId: number,
    threadId: number,
    commentId: number
  ): Promise<void> => {
    console.log(`Deleted comment: ${threadId}/${commentId}`)
  },
  createThread: async (thread: any): Promise<any> => {
    const reference = thread.properties[commentReferenceProperty]
    console.log(`Created replacement: ${thread.comments[0].content}; reference: ${reference}`)
    return thread
  }
}

class MockWebApi {
  constructor(_collectionUri: string, _authHandler: any) {}

  async getGitApi(): Promise<any> {
    return gitApi
  }
}

tmr.setInput('comment', 'Replacement comment')
tmr.setInput('active', 'true')
tmr.setInput('replacePreviousComment', 'true')
tmr.setInput('commentReference', 'build-status')
tmr.registerMockExport('getEndpointAuthorizationParameter', () => 'token')
tmr.registerMockExport('getVariable', (name: string) => ({
  'System.PullRequest.PullRequestId': '123',
  'Build.Repository.ID': 'repository-id',
  'System.CollectionUri': 'https://dev.azure.com/example/'
}[name]))
tmr.registerMock('azure-devops-node-api', {
  getPersonalAccessTokenHandler: () => ({}),
  WebApi: MockWebApi
})
tmr.run()
