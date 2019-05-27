# bizdoc.core

BizDoc is a developer framework for designing organization forms. It includes a mailbox like user interface, worflow engine and set of business intelligence feature.

## Setting up

BizDoc is designed as a .Net Core web application, running Angular 7. You author a BizDoc app by creating a new project, either from Visual Studio or dotnet command. 

### Prerequisites

[Visual Studio](https://visualstudio.microsoft.com/vs/) or Visual Code, Net Core,
[Node.js](https://nodejs.org/), [Angular CLI](https://cli.angular.io/)
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

BizDoc comprises of two parts: backend server objects, and user interface Angular components. Often, a front-end component such as a form has a backing server object. The two communicate via BizDoc interface.

Each BizDoc object, such as a form or report, is represented by a class that instruct BizDoc what the object does. The class inherits from an underlaying base class, providing methods that BizDoc recognize. 

The types supported are:
Form,
Report,
Widget,
Type,
Utility,
Action,
Cube and
Rule.

BizDoc manages other types of elements which does not have backend object, such as states, roles, and cube views. You control these settings by editing the relevent configuration section.

More on objects see Objects section below.

BizDoc keeps track of objects in _bizdoc.json_ configuration file. Each object you create in your project is added to the configuration file on first run.
You may instruct BizDoc to register an object with specific settings by annotating the class with the respective attribute.

> Open _bizdoc.json_ and review your app configuration.

You can manually edit this file as text, providing that you confirm with the schema structure.

As mentioned, a BizDoc object may have a fromt-end Angular component. The backend class is coupled with the front-end component by annotating the \[Template()\] attribute with a unique value. The Angular component is then decorated with the @BizDoc() attribute with a matching value. 

BizDoc objects accepts .Net Core services using Dependency Injection (DI). 
BizDoc provides seeveral built-in services you can aquire: Store, IOptions<SystemOptions>, IDocumentInstance, IWorkflowInstance and more. 

Browse to _ClientApp\src\app_ to create and update Angular components.

> Use _ng_ command-line to generate new components. See https://angular.io/cli/generate for more. 

The Angular user interface is built on Material Design guidelines, using the [Angular Material](https://material.angular.io/) library.
Consult Angular Material documentation on how to use components in your project.

BizDoc database is installed on first run. The BizDoc database objects are created with \[BizDoc\] schema. 
You'll probably want to create your own database context to gain access to custom database objects. Refer to .Net Core [EF](https://docs.microsoft.com/en-us/ef/core/get-started/index) to achive that.
To access BizDoc database objects using Entity Framework, use the _Store_ service, in BizDoc.Core.Data namespace. 

## Configuration

BizDoc behaviour is set in _startup.cs_. Two methods are responsible for that: services.AddBizDoc() and app.UseBizDoc().
BizDoc configuration includes licensing and messaging.

In addition, you'll need to configure SMTP for outgoing mailing.

You will also need to declare the database context using AddDbContext() method.

Configure [Hanfire](https://docs.hangfire.io/en/latest/getting-started/aspnet-core-applications.html).

BizDoc has some background services you can optionaly configure. These include: escalate job, which escaltes unattended documents, set by AddEscalate() method, mail pending summary set by AddMailWaiting(), execute mail job, set by AddMailExecute() method which comes in three configurtions: IMAP, POP3 and Exchange. 

You'll need to set up authentication. BizDoc has three configurations: [AspNetIdentity](https://www.nuget.org/packages/BizDoc.Core.AspIdentity/) for managing users in database, [DirectoryServices](https://www.nuget.org/packages/BizDoc.Core.DirectoryServices/) which uses Microsoft Active Directory, and [Okta](https://www.nuget.org/packages/BizDoc.Core.Okta/). Install the relevant Nuget and add it to services in _startup.cs_.

Sometimes the default identity manager will not sufice your organization specifics. In which case, you'll want to implement your own identity manager. See how to below. 

You can set BizDoc client behaviour from BizDocModule.forRoot() function.

> Open _/ClinetApp/src/app/app.module_ to edit BizDocModule.forRoot() settings.

## Objects

You control BizDoc flow by authoring _objects_. An object is a unit of code that implements one of the basic BizDoc models in BizDoc.Configuration namespace.

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
#### Declare data model 

```   
    public class MyFormModel {
        public DateTime? Due { get; set; }
        ...
    }
```

Annotatate properties to control flow and default layouting.

Subject, Summary, Value, 
Required, DataType, MaxLength, Hint, ListType

#### Mapping database table

You can map form model and sub models to database tables by annotating the class with Table attribute.
Annotate one or more of the properties with the Key attribute. Use DocumentId to apply it to a key.

```   
    [Table("MyTable")]
    public class MyFormModel {
        [Key, DocumentId]
        public int BizDocId { get; set; }
        ...
    }
```

#### Mapping cube


You map a form model to a cube by annotating the CubeMapping attribute.

```   
    [CubeMapping(typeof(MyCube), nameof(Amount), new string[] { nameof(Balance), nameof(Year) })]
```

See Cube below for more.

#### Mapping scheduled tasks

```
    [EvenMapping]
```

#### Add user interface 

From ./ClientApp PowerShell, type:

> ng g c myForm

Open ./app/src/myForm/myForm.component.ts

```typescript
import { Component } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { FormComponent, MailModel, ViewMode } from 'bizdoc.core';
import { BizDoc } from 'bizdoc.core';
@Component({
  selector: 'app-my-form',
  templateUrl: './my-form.component.html',
  styleUrls: ['./my-form.component.scss']
})
@BizDoc({
  selector: 'app-my-form'
})
/** myForm component*/
export class MyFormComponent implements FormComponent<MyFormModel> {
  form = this.fb.group({
    subject: this.fb.control([], [Validators.required])
  });
  mode: ViewMode;
  constructor(private fb: FormBuilder) {
  }
  onBind(model: MailModel<MyFormModel>): void {
  }
}
interface MyFormModel {
    subject: string;
}
```

### Type

A type represent a source of values, which can be applied to model property.
For example, the type Account can retreive accounts from your database.

You link a model property to a type by setting it's ListType attribute.

```
   [ListType(typeof(Account))]
   public string AccountId {get; set }
```

BizDoc has several built-in types, including Years, Monthes and Users. See BizDoc.Configuration.Generic namespace.

### Report

```c#
    public class MyReportDataModel
    {
        [Key]
        public string Number { get; set; }
        public decimal? Amount { get; set; }
    }
    public struct MyReportArgsModel
    {
        public DateTime Starting { get; set; }
    }
    [Report(title: "My report")]
    public class MyReport : ReportBase<MyReportArgsModel, MyReportDataModel>
    {
        private readonly Store _store;

        public MyReport(Store store)
        {
            _store = store;
        }

        public override async Task<IEnumerable<MyReportDataModel>> PopulateAsync(MyReportArgsModel args, IProgress<int> progress) =>
            await _store.Documents.Where(d => d.Log.Any(l => l.Time >= args.Starting)).Select(d => new MyReportDataModel
            {
                Number = d.Number,
                Amount = d.Value
            }).ToListAsync();
    }
}
```

### Cube

A cube represent a cross-data summary, which can be visualized as a chart of accumulated values.

A cube decare _Axes_. Each axis represents a Type.

You map a cube to form model by annotating the CubeMapping attribute.

> Open _bizdoc.json_ and find Cubes section. You can reorder, modify and add axes to the Axes section.

You can add views to a cube in the configuration file. 


```
    public class MyCube : CubeBase
    {
    }
```

Override cube CanView() methon to control access.

A cube may also have one or more _Index_. An index represent a linear data such as budgeted values or target performance.

Cubes are stored in database BizDoc.Cube and BizDoc.Indices tables.

#### Explore data

You can extend the default drill down cpability by implementing a custom dill down. This is a desigered behaviour if your cube summarize data from 3rd party. 

Implement the CubeBase.IExplore<T>. 

Override cube GetExploreType() methon and return the T type for the requested axes.

## How To

### Format email

Create new xslt file. Refer to xsd. In properties, choose 'Copy'.

In startup.cs services.AddBizDoc(), set the Template path relative to the project root.

You can pass data to Data node by implementing GetCustomData() on your form object.

### Create custom Identity Manager

Create new class in your project and make it implement _BizDoc.Core.Identity.IIdentityManager_ and _BizDoc.Core.Identity.ISignInProvider_.
Register each of them separately in _startup.cs_ as scoped service for the respective interface, prior to calling AddBizDoc().

### Change cube chart type

bizdoc.json

