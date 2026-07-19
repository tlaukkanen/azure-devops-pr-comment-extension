import tmrm = require('azure-pipelines-task-lib/mock-run')
import path = require('path')

const taskPath = path.join(__dirname, '..', 'index.js')
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath)
const taskProperty = 'PullRequestCommentTask'
const commentReferenceProperty = 'PullRequestCommentTask.CommentReference'

const gitApi = {
  getThreads: async (): Promise<any[]> => [{
    id: 100,
    properties: {
      [taskProperty]: 'true',
      [commentReferenceProperty]: 'another-comment'
    }
  }],
  getComments: async (): Promise<any[]> => {
    console.log('Unexpected comment lookup')
    return []
  },
  deleteComment: async (): Promise<void> => {
    console.log('Unexpected comment deletion')
  },
  createThread: async (thread: any): Promise<any> => {
    console.log(`Created replacement: ${thread.comments[0].content}`)
    return thread
  }
}

class MockWebApi {
  constructor(_collectionUri: string, _authHandler: any) {}

  async getGitApi(): Promise<any> {
    return gitApi
  }
}

tmr.setInput('comment', 'New comment')
tmr.setInput('replacePreviousComment', 'true')
tmr.setInput('commentReference', 'missing-comment')
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
