# Gitis

A git-backed and YAML-based distributed issue tracker.


## Reasons

- Code and documentation are in the git repo and so should your issues
- You shouldn't have to leave your programming environment to manage issues
- You should be able to view and edit issues offline


## Schema

```yaml
title: Use Gitis instead of GitHub issues
user: adius
tags:
  - must_have
  - important
  - easy_to_implement
state: open
assignee: everyone
comments:
  - user: octocat
    body: Great idea!
    created_at: 2015-01-12 14:45:21
  - user: offlineJoe
    body: Can't wait for it!
    created_at: 2015-01-12 14:51:34
milestone: finally_independent
created_at: 2015-01-12 13:44:46
updated_at: 2015-01-12 13:46:12
closed_at: null
body: |
  Our issues should be managed with Gitis and not with GitHub Issues
```


## Related

Name | Git Based | Own Branch | Storage format | CLI | UI | License
---|---|---|---|---|---|---
[t](https://github.com/sjl/t) | | | `txt` | `t` | | X11
[beastie](https://github.com/avillafiorita/beastie) | | | `YAML` | `beastie` | | MIT
[gaskit](https://github.com/bkeepers/gaskit) | ✔︎ | ✔︎ | ? | | ✔︎ | GPL
[gitissius](https://github.com/glogiotatidis/gitissius) | ✔︎ | ✔︎ | `JSON` | ✔︎ | | GPLv3
[bugseverywhere](http://bugseverywhere.org/) | ✔︎ | ? | ? | ✔︎ | ✔︎ | GPLv2
[gitis](https://github.com/adius/gitis) | ✔︎ | | `YAML` | ✔︎ | ✔︎ | MIT
