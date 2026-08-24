# Git Workflow Checkpoint Evidence

This folder contains the evidence requested for the Git workflow checkpoint.

Each screenshot is a terminal-style capture of one instruction step, numbered in execution order from `step-01.png` through `step-17.png`. The complete command output is also preserved in `terminal-transcript.txt`.

| Screenshot | Evidence shown |
| --- | --- |
| `step-01.png` | Create the `learn_git` folder |
| `step-02.png` | Change directory into `learn_git` |
| `step-03.png` | Create `third.txt` |
| `step-04.png` | Initialize an empty Git repository |
| `step-05.png` | Add `third.txt` to staging |
| `step-06.png` | Commit `third.txt` with message `adding third.txt` |
| `step-07.png` | Inspect the first commit with `git log` |
| `step-08.png` | Create `fourth.txt` |
| `step-09.png` | Add `fourth.txt` to staging |
| `step-10.png` | Commit `fourth.txt` with message `adding fourth.txt` |
| `step-11.png` | Remove `third.txt` |
| `step-12.png` | Stage the deletion with `git add .` |
| `step-13.png` | Commit the deletion with message `removing third.txt` |
| `step-14.png` | Inspect all commits with `git log` |
| `step-15.png` | Set `core.pager` globally to `cat` |
| `step-16.png` | List all global Git configurations |
| `step-17.png` | Verify the final repository state and remaining file |

The command requested for listing all global Git configurations is:

```bash
git config --global --list
```

Final tracked workflow result: `fourth.txt` remains, `third.txt` has been removed, and the three requested commits are visible in the log evidence.
