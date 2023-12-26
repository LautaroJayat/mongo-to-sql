# Mongo To SQL!

![Testing](https://github.com/lautarojayat/mongo-to-sql/actions/workflows/test.yaml/badge.svg)
![Build](https://github.com/lautarojayat/mongo-to-sql/actions/workflows/build.yaml/badge.svg)



A simple mongo to sql translator powered by Nodejs

![header](assets/header.png)



* [How to start](#how-to-start)
    * [1. Clone this repo](#1-clone-this-repo)
    * [2. Install yarn](#2-install-yarn)
    * [3. Install all dependencies](#3-install-all-dependencies)
    * [4. Transpile the project](#4-transpile-the-project)
    * [5. Install the package as a cmd utility](#5-install-the-package-as-a-cmd-utility)
    * [6. Try to translate a query](#6-try-to-translate-a-query)
* [Usage](#usage)
* [Observations](#observations)
    * [String Values](#string-values)
    * [Command Line tips](#command-line-tips)
    * [Bash escaping](#bash-escaping)
* [Uninstall](#uninstall)

## How to start

### 1. Clone this repo
Clone the project and then go to the root folder
```bash
git clone https://github.com/LautaroJayat/mongo-to-sql.git

cd mongo-to-sql
```

### 2. Install yarn 
if you have NPM installed:
```bash
npm install --global yarn
```

if not, you can follow these alternative steps:
https://classic.yarnpkg.com/lang/en/docs/install

### 3. Install all dependencies
```bash
yarn
```

### 4. Transpile the project

```bash
yarn build
```

### 5. Install package as a command line utility
```bash
yarn install:bin

# under the hood it does
# chmod +x bin/cli/index.js && npm i -g .
```

### 6. Translate a query

```bash
mongoToSql "db.myCollection.find({some: 'args'}, { fieldToProject: 1 })"
```
## Usage

### `mongoToSql [options] [ command | arguments ] `

Options: 
* `--cool`: prints a pretty title before the output
    ```bash
    mongoToSql --cool "db.myCollection.find({})"
    ```

Commands:
* `help` : prints a help dialog with all the options
    ```bash
    mongoToSql help
    ```

Arguments:
* A mongo query that will be used as input
    ```bash
    mongoToSql "db.myCollection.find({my: 'field'})"
    ```




## Observations

### String Values
When using string values, remember to use single quotes. If you try to quote using double quotes or backticks you will have an error
```js
// this is ok
db.users.find({name: 'smith'})
// but this no
db.users.find({name: "smith"})
```

### Command Line tips
You can use this CLI in three ways:

1. You can introduce a a string containing a command as the first argument:

```1.ash
mongoToSql "db.myCollection.find({some: 'args'}, { fieldToProject: 1 })"
```

2. You can interpolate the value of the first argument by using a subshell:

```bash
mongoToSql $(cat query.js)
```

3. You can pipe a string directly to the command
```bash
cat query.js | mongoToSql
```

### Bash escaping
Mongodb uses `$` as a prefix for their operators, but the same character is an actual operator in bash.
To avoid unexpected errors, if you are providing a string directly into the shell, remember to escape any special character:
```bash
# this will work
mongoToSql "db.users.find({age: { \$gte: 25 }, name: 'smith' })"

# this will interpret 'gre' as an env and will try to interpolate its value
mongoToSql "db.users.find({age: { $gte: 25 }, name: 'smith' })"
```

## Uninstall
Just run:
```bash
yarn remove:bin
```