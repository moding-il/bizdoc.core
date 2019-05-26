# bizdoc.core

BizDoc is a developer framework for designing organization forms. It includs a mailbox -like interface and business intelligence feature.

## Setting up

Prerequisite:

[Visual Studio 2019](https://visualstudio.microsoft.com/vs/), Net Core.
[Node.js](https://nodejs.org/)
[EF Core](https://docs.microsoft.com/en-us/ef/core/get-started/install/)

To install BizDoc, open Visual Studio. From Extensions menu, choose Manage Extensions. Select Online and search for BizDoc-Core.

Install the package. You will need to restart Visual Studio.

Open Visual Studio again and create New Project. Select BizDoc as the template for your new project.

Run your project to allow it to download required dependencies.

Update BizDoc service Nuget. From Package Manager Console, type:

> Update-Package [bizdoc.core](https://www.nuget.org/packages/BizDoc.Core/)

Update npm package. From Windows PowerShell, type:

> npm i bizdoc.core@latest

Create a database. Set _connectionString_ in _appsettings.json_. 

From From Package Manager Console, type:

Update-Database -Context BizDoc.Core.Data.Store.

## Architecture

BizDoc comprise of two major parts: backend server code objects, and a user interface Angular components. Often, a front-end component such as a form has a backing server object. The two communicate via BizDoc interface.

Each BizDoc element, such as form or report, is represented with a class that instruct BizDoc what the element role is. The class generally inherits from an underlaying base class, providing a service that BizDoc recognize.

The list of elements are:
Form
Report
Widget
DataType
Rule

BizDoc configures the new element in it's configuration file _bizdoc.json_ as you add it to your project code.
You may instruct BizDoc to register the element with specific settings by annotating the class with the corresponding attribute, e.g a form class _MyForm_ behaviour can be set using the \[Form()\] attribute.

> Open _bizdoc.json_ to review your configuration.

You can manually edit this file as text, providing that you apply to the schema validation.

As mentioned, an element may have a fromt-end Angular component. The backend class is coupled with the frontend component using the \[Template()\] attribute.

Browse to _ClientApp\src\app_ to create and update Angular components.

> Use _ng_ command-line to generate new components. See https://angular.io/cli/generate for more. 
