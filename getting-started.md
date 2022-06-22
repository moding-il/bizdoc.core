Developing requires skills in C# and Angular. Mobile development for BizDoc requires skills in Flutter or Xamarin. 

## Prerequisites

1. Download and install [.NET](https://dotnet.microsoft.com/en-us/download).

Use SDK edition for development and runtime for production.

2. Download and install [Node.js](https://nodejs.org/en/download/). Preferably, use _current_ version with latest features.

Use the version compatible to your operating system.

3. Download and install [git cli](https://git-scm.com/downloads).

4. Download and install [Visual Studio Code](https://code.visualstudio.com/download) or Visual Studio.

If you're installing production environment, you can skip this step.

Add the extensions for C#, SQL Server and Angular.

5. Install [Angular cli](https://angular.io/cli).

From command line, run this line:

```bash
npm install -g @angular/cli
```
6. Install database.

If you're installing development environment, you can skip this step.

LocalDb is suitable for *development environment*. Use one of [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) or [Oracle](.).
Minimum express edition.

## Installing

Create base project from repository.

```bash
git clone https://github.com/moding-il/bizdoc-web-app
```

### Build and run

From command line, in project root:

```bash
dotnet build
```

## Developing

Use Visual Studio Code to Open Folder of your project root or open from command line:

```bash
code .
```

### What's next

Follow the [guidelines](./guidelines.md) manual onbest practices in developing BizDoc app.

### Mobile app

BizDoc offers SDK for several mobile platforms. Including Flutter, Xamarin and Kotlin.

Refere to the mobile development manual for more.
