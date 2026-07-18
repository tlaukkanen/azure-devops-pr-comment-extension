import tmrm = require('azure-pipelines-task-lib/mock-run');
import path = require('path');

const taskPath = path.join(__dirname, '..', 'index.js');
const markdownFile = path.join(__dirname, '..', '..', 'tests', 'fixtures', 'comment.md');
const tmr: tmrm.TaskMockRunner = new tmrm.TaskMockRunner(taskPath);

const gitApi = {
  createThread: async (thread: any): Promise<any> => {
    console.log(`Created thread content: ${thread.comments[0].content}`);
    return thread;
  }
};

class MockWebApi {
  constructor(_collectionUri: string, _authHandler: any) {}

  async getGitApi(): Promise<any> {
    return gitApi;
  }
}

tmr.setInput('comment', 'This is **sample** _text_');
tmr.setInput('markdownFile', markdownFile);
tmr.setInput('active', 'true');
tmr.registerMockExport('getEndpointAuthorizationParameter', () => 'token');
tmr.registerMockExport('getVariable', (name: string) => ({
  'System.PullRequest.PullRequestId': '123',
  'Build.Repository.ID': 'repository-id',
  'System.CollectionUri': 'https://dev.azure.com/example/'
}[name]));
tmr.registerMock('azure-devops-node-api', {
  getPersonalAccessTokenHandler: () => ({}),
  WebApi: MockWebApi
});
tmr.run();
