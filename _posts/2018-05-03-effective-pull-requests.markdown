---
layout: post
title:  "Effective Pull Requests"
date:   2018-05-03 23:23:08 +0300
---

Recently I've been sending a lot of pull requests to various
GitHub-hosted projects. It had been a lot of trial and error before I
settled on the git workflow which doesn't involve "Nah, I'll just `rm
-rf` this folder and do a fresh `git clone`" somewhere. This post
documents the workflow. In a nutshell, it is

* do not use the master branch for pull requests
* use the master branch to track upstream repository
* automate


# Avoiding the master branch

The natural thing to do, when sending a pull request, is to fork the
upstream repository, `git clone` your fork locally, make a fix, `git
commit -am` and `git push` it to the master branch of your fork and
then send a PR.

It even seems to work at first, but breaks down in these two cases:

* you want to send a second PR, and now you don't have a clean branch
  to base your work off

* the upstream was updated, your PR does not merge cleanly anymore,
  you need to do a rebase, but you don't have a clean branch to rebase
  onto.

The fix here is to create a fresh branch immediatelly after cloning:


```
Tip 1: always start with creating a feature branch for PR

$ git clone git@github.com:matklad/cargo.git && cd cargo
$ git checkout -b long-and-descriptive-name-of-the-pr-branch
$ $EDITOR hack-hack-hack
```


However it is easy to forget this step, so it is important to be able
to move to a separate branch after you erroneously committed code to
master. It is also crucial to reset `master` to clean state, otherwise
you'll face some bewildering merge conflicts, when you try to update
your fork several days later.

```
Tip 2: don't forget to reset master after a mix-up

$ git clone git@github.com:matklad/cargo.git && cd cargo
$ $EDITOR hack-hack-hack
$ git commit -am'A very important fix'
$ echo "urgh, should have done this on a separate branch"

$ git branch pr-branch
$ git reset --hard origin/master
$ git checkout pr-branch
```


# Syncing with upstream

If you work regularly on a particular project, you'd want to keep your
fork in sync with upstream repository. One way to do that would be to
add upstream repository as a git remote, and set the local master
branch to track the master from upstream:


```
Tip 3: tracking remote repository

$ git clone git@github.com:matklad/cargo.git && cd cargo
$ git remote add upstream git@github.com:rust-lang/cargo.git
$ git fetch remote
$ git branch --set-upstream-to=upstream/master
```

With this setup, you can easily update your pull request if they don't
merge cleanly because of upstream changes:

```
Tip 4: updating a PR

$ git checkout master && git pull --rebase
$ git checkout pr-branch
$ git rebase master
```

# Automating

There are several steps to get the repo setup just right, and doing it
manually every time would lead to errors and mysterious merge
conflicts. It might be useful to define a shell function to do this
for you! It could look like this

```
# calling `gcf rust-lang/cargo` would clone github.com/matklad/cargo,
# and setup upstream properly
function gcf() {
    local userrepo=$1
    local repo=`basename $userrepo`
    git clone git@github.com:matklad/$repo.git
    pushd $repo
    git remote add upstream git@github.com:$userrepo.git
    git fetch upstream
    git checkout master
    git branch --set-upstream-to=upstream/master
    git pull --rebase --force
    popd
}
```

# Bonus points


Bonus 1: another useful function to have is for reviewing PRs:

```
# called like `gpr 9262`, this function would checkout
# GitHub pull request #9262 to `pr-9262` branch
function gpr() {
    local pr=$1
    git fetch upstream pull/$pr/head:pr-$pr
    git checkout pr-$pr
}
```


Bonus 2: there are a lot of learning materials about Git out
there. However, a lot of these materials are either comprehensive
references, or just present a handful of most useful git commands.

I've once accidentally stumbled upon [Git from the bottom
up](https://jwiegley.github.io/git-from-the-bottom-up/) and I highly
recommend reading it: it is a moderately long article, which explains
the inner mechanics of Git.
