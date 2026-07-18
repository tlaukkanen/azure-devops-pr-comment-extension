import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('Task tests', function () {

    before( function() {

    });

    after(() => {

    });

    it('should succeed with simple inputs', function() {
      this.timeout(5000);

      let tp = path.join(__dirname, 'success.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      tr.run();
      console.log(`Task result: ${tr.succeeded}`);
      if(!tr.succeeded && tr.errorIssues.length > 0) {
        console.log(`Errors: ${tr.errorIssues}`);
      }
      console.log(tr.stdout);
      assert.equal(tr.succeeded, true, 'should have succeeded with simple input');
      assert.equal(tr.warningIssues.length, 0, "should have no warnings");
      assert.equal(tr.errorIssues.length, 0, "should have no errors");
      console.log(tr.stdout);
    });

    it('should add comment only once', function() {
      this.timeout(5000);

      let tp = path.join(__dirname, 'add-only-once.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      tr.run();
      console.log(`Task result: ${tr.succeeded}`);
      if(!tr.succeeded && tr.errorIssues.length > 0) {
        console.log(`Errors: ${tr.errorIssues}`);
      }
      console.log(tr.stdout);
      assert.equal(tr.succeeded, true, 'should have succeeded with simple input');
      assert.equal(tr.warningIssues.length, 0, "should have no warnings");
      assert.equal(tr.errorIssues.length, 0, "should have no errors");
      console.log(tr.stdout);
    });

    it('should log the markdown file content that was added', function() {
      this.timeout(5000);

      let tp = path.join(__dirname, 'markdown-file.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      tr.run();
      assert.equal(tr.succeeded, true, 'should have succeeded with markdown file input');
      assert.equal(tr.warningIssues.length, 0, "should have no warnings");
      assert.equal(tr.errorIssues.length, 0, "should have no errors");
      assert.equal(tr.stdOutContained('Created thread content: # File comment'), true, 'should send markdown file content to the API');
      assert.equal(tr.stdOutContained('Comment added on pull request: # File comment'), true, 'should log markdown file content');
      assert.equal(tr.stdOutContained('Comment added on pull request: This is **sample** _text_'), false, 'should not log the fallback comment');
    });

});
