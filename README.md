# bizdoc.core

BizDoc is a developer framework for designing organization forms. It includes a mailbox like interface and a set of business intelligence features.

## Setting up

Prerequisite:

[Visual Studio 2019](https://visualstudio.microsoft.com/vs/), Net Core.,
[Node.js](https://nodejs.org/)
and [EF Core](https://docs.microsoft.com/en-us/ef/core/get-started/install/).

To install BizDoc, open Visual Studio. From Extensions menu, choose Manage Extensions. Select Online and search for [BizDoc Core](https://marketplace.visualstudio.com/items?itemName=Moding.BizDoc-Core).

Install the package. You will need to restart Visual Studio.

Open Visual Studio again and create a New Project. Select BizDoc as the template for your new project.

Run the project to download required dependencies.

Update BizDoc service Nuget. From Package Manager Console, type:

> Update-Package [bizdoc.core](https://www.nuget.org/packages/BizDoc.Core/)

Update npm package. From Windows PowerShell, type:

> npm i [bizdoc.core@latest](https://www.npmjs.com/package/bizdoc.core)

Create a database. Set _connectionString_ in _appsettings.json_. 

From From Package Manager Console, type:

> Update-Database -Context BizDoc.Core.Data.Store.

## Architecture

BizDoc comprises of two major parts: backend server code objects, and a user interface Angular components. Often, a front-end component such as a form has a backing server object. The two communicate via BizDoc interface.

Each BizDoc object, such as a form or report, is represented by a class that instruct BizDoc what the object role is. The class generally inherits from an underlaying base class, providing methods that BizDoc recognize.

The list of elements are:
Form
Report
Widget
DataType
Rule

BizDoc configures objects in _bizdoc.json_ configuration file. Each object you create in your project is added to configuration file on first run.
You may instruct BizDoc to register the object with specific settings by annotating the class with the corresponding attribute. (e.g a form class _MyForm_ may be set a \[Form()\] attribute.

> Open _bizdoc.json_ and review your configuration.

You can manually edit this file as text, providing that you confirm with schema structure.

As mentioned, a BizDoc object may have a fromt-end Angular component. The backend class is coupled with the front-end component by adding the \[Template()\] attribute to it. The Angular component on it's end is decorated with the @BizDoc() attribute with a matching value. 

Browse to _ClientApp\src\app_ to create and update Angular components.

> Use _ng_ command-line to generate new components. See https://angular.io/cli/generate for more. 

The Angular user interface is built upon Material Design, using the [Angular Material](https://material.angular.io/) library components.
