# Azure DevOps Pull Request Comment Task

Azure DevOps extension to easily add Azure Repos pull request comments from pipeline with single pipeline task. Extension is free and Open Source.

Task can be used to communicate key information from build, dev deployment etc. to the developers. For example URL of the test environment for the pull request or any other data that would be nice to have visible without a need to go to the build logs for details.

If you like the extension, consider buying me a coffee ☕😊

<a href="https://www.buymeacoffee.com/tlaukkanen" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

...and if you don't like it then send me some feedback or improvement ideas through [issues](https://github.com/tlaukkanen/azure-devops-pr-comment-extension/issues) so I can make it better.

# Usage

When extension is added to your organization then you can find it from the extensions list or you can add it simply to your yaml pipeline with the following task command:

```
- task: PullRequestComment@1
  inputs:
    active: false
    # Markdown file - if this is set then the content of that file is used as comment
    # and comment parameter is ignored. Use full path. Optional.
    #markdownFile: $(Build.SourcesDirectory)/your_markdown_file.md
    # Only once - if you trigger PR comment task multiple times but
    # you want it to add comment only once you can set this to true. Optional.
    #addCommentOnlyOnce: false
    # Update original - if you trigger PR comment task multiple times but
    # you don't want to pollute your PR with multiple comments then you can make it
    # to update the original comment. Optional.
    #updatePreviousComment: false
    comment: |
      This is **sample** _text_ 🎉
      [This is link](https://microsoft.com)
      Build ID is $(Build.BuildId)
      | Table |
      |---|
      | Cell |
  displayName: 'PR Comment'
```

This example would create the following comment on the pull request:
![Screenshot](screenshots/screen1.png)

# Installation

You can install the extension to your Azure DevOps organization from Marketplace:
[PR Comment Task](https://marketplace.visualstudio.com/items?itemName=TommiLaukkanen.pr-comment-extension)

You may need to add **Contribute to pull requests** permission to your **Project Collection Build Service Accounts** from project -> repository -> **Security**.

![Permissions](screenshots/screen3.png)
