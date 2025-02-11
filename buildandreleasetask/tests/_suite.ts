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

      tr.runAsync();
      console.log(`Task result: ${tr.succeeded}`);
      if(!tr.succeeded && tr.errorIssues.length > 0) {
        console.log(`Errors: ${tr.errorIssues}`);
      }
      console.log(tr.stdout);
      assert.equal(tr.succeeded, true, 'should have succeeded with simple input');
      assert.equal(tr.warningIssues.length, 0, "should have no warnings");
      assert.equal(tr.errorIssues.length, 0, "should have no errors");
      console.log(tr.stdout);
      done();
    });

    it('should add comment only once', function(done: Mocha.Done) {
      this.timeout(5000);

      let tp = path.join(__dirname, 'add-only-once.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      tr.runAsync();
      console.log(`Task result: ${tr.succeeded}`);
      if(!tr.succeeded && tr.errorIssues.length > 0) {
        console.log(`Errors: ${tr.errorIssues}`);
      }
      console.log(tr.stdout);
      assert.equal(tr.succeeded, true, 'should have succeeded with simple input');
      assert.equal(tr.warningIssues.length, 0, "should have no warnings");
      assert.equal(tr.errorIssues.length, 0, "should have no errors");
      console.log(tr.stdout);
      done();
    });

});
