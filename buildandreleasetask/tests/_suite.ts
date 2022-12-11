import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('Task tests', function () {

    before( function() {

    });

    after(() => {

    });

    it('should succeed with simple inputs', function(done: Mocha.Done) {
      this.timeout(5000);
  
      let tp = path.join(__dirname, 'success.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);
  
      tr.run();
      console.log(`Task result: ${tr.succeeded}`);
      console.log(tr.stdout);
      assert.equal(tr.succeeded, false, 'should not have succeeded without input');
      assert.equal(tr.warningIssues.length, 0, "should have no warnings");
      assert.equal(tr.errorIssues.length, 1, "should have errors");
      console.log(tr.stdout);
      done();
    });

});