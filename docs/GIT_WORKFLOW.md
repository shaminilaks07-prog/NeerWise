# Git workflow for three sequential members

Never force-push. Never edit the same file as someone else at the same time.

## Member 1: publish the base

```bash
git init                                  # creates a local repository
git add .                                 # stages every file for the first commit
git commit -m "feat: base app, store, calc library, overview"   # saves a snapshot
git branch -M main                        # names the branch main
git remote add origin <your-repo-url>     # links to the GitHub repository
git push -u origin main                   # uploads main and remembers it as the default
```

Before pushing, run `npm install`, `npm run typecheck`, `npm test`, `npm run build`, and click through every page.

## Members 2 and 3: add one feature each

```bash
git clone <your-repo-url>                 # first time only: copy the repository
git pull origin main                      # fetch and merge the latest main
git checkout -b feature/<short-name>      # work on a separate branch
# ...make changes, run npm run typecheck && npm test && npm run build...
git add src/features/<your-folder>        # stage only what you changed
git commit -m "feat: <what you added>"
git pull origin main                      # re-sync right before pushing
git push -u origin feature/<short-name>   # upload your branch
```

Then open a pull request into `main`, or, if your team agrees to push straight to main, run `git push origin main` only after the pull above succeeds.

## If a push is rejected

Rejected means someone pushed first. Do **not** use `--force`.

```bash
git pull origin main        # brings in their commits and merges them with yours
# if Git reports a conflict, open the listed files, keep both sides' intent,
# remove the <<<<<<< ======= >>>>>>> markers, then:
git add <resolved-files>
git commit                  # completes the merge
npm run typecheck && npm test
git push origin <your-branch>
```
