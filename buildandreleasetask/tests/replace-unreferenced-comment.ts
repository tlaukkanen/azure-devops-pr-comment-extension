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
      id: 200,
      properties: {
        [taskProperty]: 'true',
        [commentReferenceProperty]: 'referenced-comment'
      }
    },
    {
      id: 100,
      properties: { [taskProperty]: 'true' }
    }
  ],
  getComments: async (_repositoryId: string, _pullRequestId: number, threadId: number): Promise<any[]> => {
    console.log(`Fetched comments for thread: ${threadId}`)
    return [{ id: 11, commentType: CommentType.Text }]
  },
  deleteComment: async (
    _repositoryId: string,
    _pullRequestId: number,
    threadId: number,
    commentId: number
  ): Promise<void> => {
    console.log(`Deleted comment: ${threadId}/${commentId}`)
  },
  createThread: async (thread: any): Promise<any> => thread
}

class MockWebApi {
  constructor(_collectionUri: string, _authHandler: any) {}

  async getGitApi(): Promise<any> {
    return gitApi
  }
}

tmr.setInput('comment', 'Replacement comment')
tmr.setInput('replacePreviousComment', 'true')
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
