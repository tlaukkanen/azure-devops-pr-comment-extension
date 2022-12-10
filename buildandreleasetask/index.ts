import tl = require('azure-pipelines-task-lib/task')

async function run() {
  try{
    const comment: string | undefined = tl.getInput('comment', true)
    if(comment == 'bad') {
      tl.setResult(tl.TaskResult.Failed, 'Bad comment was given')
      return
    }
    console.log('hello', comment)
  }
  catch (err:any) {
    tl.setResult(tl.TaskResult.Failed, err.message)
  }
}

run()