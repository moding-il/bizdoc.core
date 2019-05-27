# bizdoc.core

BizDoc is a developer framework for designing organization forms. It includes a mailbox like interface and a set of business intelligence features.

## Setting up

BizDoc is designed as a .Net Core web application running Angular 7. You author a BizDoc implementation by creating a new project, either from Visual Studio or Visual Code. 

### Prerequisites

[Visual Studio](https://visualstudio.microsoft.com/vs/), Net Core.,
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

Each BizDoc object, such as a form or report, is represented by a class that instruct BizDoc what the object role is. The class generally inherits from an underlaying base class, providing methods that BizDoc recognize. Base classes are declared in BizDoc.Configuration namespace. 

The types supported are:
Form,
Report,
Widget,
Type,
Utility,
Action,
Cube and
Rule.
BizDoc manages other types of elements which does not have backend object, such as states, roles, and cube views. You can control these settings by editing the relevent configuration section.
Read more on objects see objects section below.


BizDoc keeps track of objects objects in it's _bizdoc.json_ configuration file. Each object you create in your project is added to the configuration file on first run.
You may instruct BizDoc to register an object with specific settings by annotating the class with the corresponding attribute. (e.g a form class _MyForm_ may be set a \[Form()\] attribute.

> Open _bizdoc.json_ and review your configuration.

You can manually edit this file as text, providing that you confirm with the schema structure.

As mentioned, a BizDoc object may have a fromt-end Angular component. The backend class is coupled with the front-end component by adding the \[Template()\] attribute to it with a unique value. The Angular component needs to be decorated with the @BizDoc() attribute with a matching value. 

BizDoc objects accepts other .Net Core services using Dependency Injection (DI). 
BizDoc provides services you may come to aquire: Store, IOptions<SystemOptions>, IDocumentInstance, IWorkflowInstance and more. 

Browse to _ClientApp\src\app_ to create and update Angular components.

> Use _ng_ command-line to generate new components. See https://angular.io/cli/generate for more. 

The Angular user interface is built on Material Design, using the [Angular Material](https://material.angular.io/) library components.
Consult Angular Material on how to add new components to your project.

BizDoc database is installed on first run. The BizDoc database objects are created under \[BizDoc\] schema. You are likely to want to create your own database context to gain access to custom database objects. Refer to .Net Core [EF](https://docs.microsoft.com/en-us/ef/core/get-started/index) for more information.
To access BizDoc objects, use the _Store_ service, using BizDoc.Core.Data namespace. 

##Configuring

BizDoc behaviour is set in _startup.cs_. Two methods are responsible for that: services.AddBizDoc() and app.UseBizDoc().
BizDoc configuration includes licensing and messaging.
In addition, you'll need to configure SMTP for mailing.
You will also need to declare the database context using AddDbContext() method.
Configure [Hanfire](https://docs.hangfire.io/en/latest/getting-started/aspnet-core-applications.html).

BizDoc has some background services you can optionaly configure. These include: escalate job, which escaltes unattended documents, set by AddEscalateJob() method, mail pending summary set by AddMailWaitingJob(), execute mail job, set by AddMailExecuteJob() method which comes in three configurtions: IMAP, POP3 and Exchange, each has required options. 

You need to set up authentication. BizDoc has three configurations: [AspNetIdentity](https://www.nuget.org/packages/BizDoc.Core.AspIdentity/) for managing users in database, [DirectoryServices](https://www.nuget.org/packages/BizDoc.Core.DirectoryServices/) which uses Microsoft Active Directory, and [Okta](https://www.nuget.org/packages/BizDoc.Core.Okta/). Install the relevant Nuget and add it to services in _startup.cs_.

Sometimes the default identity manager will not sufice your organization specifics. In which case, you'll want to implement your own identity manager. See how to below to do that. 

You can set some BizDoc client behaviour from BizDocModule.forRoot() function.

> Open _/ClinetApp/src/app/app.module_ to edit BizDocModule.forRoot() settings.

## Objects

You control BizDoc flow by authoring _objects_. An object is a unit of code that implements one of the basic BizDoc models.

### Form

A form comprises of a backing class, responsible for managing form scope, a model, which represent form structure, and an Angular component, managing user interaction. 

You may override scope events to control form flow. Events are OnFlowEnd().

```
    using BizDoc.Configuration;
    
    public class MyForm : FormBase<MyFormModel>
    {
            public override Task FlowEndAsync(MyFormModel model)
        {
            ...
        }
    }
```

You can annotate your class with Form attribute to apply configuration properties.

```
using BizDoc.Configuration.Annotations;
[Form(title: "My form")]
    public class MyForm : FormBase<MyFormModel> {
    ...
    }
```

#### Mapping cube

```   [CubeMapping(typeof(MyCube), nameof(Amount), new string[] { nameof(Balance), nameof(Year) })]
```

#### Mapping scheduled tasks

### Type

A type represent a source of values, which can be applied to model property.
For example, the type Account can retreive accounts from your database.

You link a model property to a type by setting it's ListType attribute.

```
   [ListType(typeof(Account))]
   public string AccountId {get; set }
```

BizDoc has several built-in types, including Years, Monthes.

### Cube

## How To

### Create custom Identity Manager

Create new class in your project and make it implement _BizDoc.Core.Identity.IIdentityManager_ and _BizDoc.Core.Identity.ISignInProvider_.
Register each of them separately in _startup.cs_ as scoped service for the respective interface, prior to calling AddBizDoc().

