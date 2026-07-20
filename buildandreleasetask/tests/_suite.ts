import * as path from 'path';
import * as assert from 'assert';
import * as ttm from 'azure-pipelines-task-lib/mock-test';

describe('Task tests', function () {

    before( function() {

    });

    after(() => {

    });

    it('should succeed with simple inputs', async function() {
      this.timeout(120000);

      let tp = path.join(__dirname, 'success.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      await tr.runAsync();
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

    it('should add comment only once', async function() {
      this.timeout(120000);

      let tp = path.join(__dirname, 'add-only-once.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      await tr.runAsync();
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

    it('should log the markdown file content that was added', async function() {
      this.timeout(120000);

      let tp = path.join(__dirname, 'markdown-file.js');
      let tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      await tr.runAsync();
      assert.equal(tr.succeeded, true, 'should have succeeded with markdown file input');
      assert.equal(tr.warningIssues.length, 0, "should have no warnings");
      assert.equal(tr.errorIssues.length, 0, "should have no errors");
      assert.equal(tr.stdOutContained('Created thread content: # File comment'), true, 'should send markdown file content to the API');
      assert.equal(tr.stdOutContained('Comment added on pull request: # File comment'), true, 'should log markdown file content');
      assert.equal(tr.stdOutContained('Comment added on pull request: This is **sample** _text_'), false, 'should not log the fallback comment');
    });

    it('should replace the previous comment with the matching reference', async function() {
      this.timeout(120000);

      const tp = path.join(__dirname, 'replace-previous-comment.js');
      const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      await tr.runAsync();
      assert.equal(tr.succeeded, true, 'should have succeeded when replacing a previous comment');
      assert.equal(tr.warningIssues.length, 0, "should have no warnings");
      assert.equal(tr.errorIssues.length, 0, "should have no errors");
      assert.equal(tr.stdOutContained('Fetched comments for thread: 200'), true, 'should find the thread with the matching reference');
      assert.equal(tr.stdOutContained('Fetched comments for thread: 100'), false, 'should ignore a different comment reference');
      assert.equal(tr.stdOutContained('Fetched comments for thread: 300'), false, 'should ignore a deleted thread');
      assert.equal(tr.stdOutContained('Deleted comment: 200/22'), true, 'should delete the previous comment');
      assert.equal(tr.stdOutContained('Created replacement: Replacement comment; reference: build-status'), true, 'should create a new referenced comment');
    });

    it('should replace only an unreferenced comment when no reference is supplied', async function() {
      this.timeout(120000);

      const tp = path.join(__dirname, 'replace-unreferenced-comment.js');
      const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      await tr.runAsync();
      assert.equal(tr.succeeded, true, 'should have succeeded when replacing an unreferenced comment');
      assert.equal(tr.stdOutContained('Fetched comments for thread: 100'), true, 'should find the unreferenced thread');
      assert.equal(tr.stdOutContained('Fetched comments for thread: 200'), false, 'should ignore a referenced thread');
      assert.equal(tr.stdOutContained('Deleted comment: 100/11'), true, 'should delete the unreferenced comment');
    });

    it('should create a new comment when no previous comment matches', async function() {
      this.timeout(120000);

      const tp = path.join(__dirname, 'replace-missing-comment.js');
      const tr: ttm.MockTestRunner = new ttm.MockTestRunner(tp);

      await tr.runAsync();
      assert.equal(tr.succeeded, true, 'should have succeeded when no previous comment exists');
      assert.equal(tr.stdOutContained('Unexpected comment lookup'), false, 'should not inspect a non-matching thread');
      assert.equal(tr.stdOutContained('Unexpected comment deletion'), false, 'should not delete a non-matching comment');
      assert.equal(tr.stdOutContained('Created replacement: New comment'), true, 'should create the new comment');
    });

});
