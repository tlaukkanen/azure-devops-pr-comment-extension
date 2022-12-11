# PR Comment Extension

Azure DevOps extension to easily add Azure Repos pull request comments from pipeline with single task. Extension is free and  Open Source.

# Usage

When extension is added to your organization then you can find it from the extensions list or you can add it simply to your yaml pipeline with the following task command:

```
- task: PullRequestComment@1
  inputs:
    comment: |
      This is **sample** _text_ 🎉
      [This is link](https://microsoft.com)
      Build ID is $(Build.BuildId)
      | Table |
      |---|
      | Cell |
  displayName: 'PR Comment'
```

This will for example create the following comment on the pull request:
![Screenshot](screenshots/screen1.png)

# Installation

You can install the extension to your Azure DevOps organization from Marketplace:
[PR Comment Task](https://marketplace.visualstudio.com/items?itemName=TommiLaukkanen.pr-comment-extension)

You may need to add **Contribute to pull requests** permission to your **Project Collection Build Service Accounts** from project -> repository -> **Security**.
