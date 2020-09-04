# bizdoc.core

BizDoc is a developer framework for designing organization forms. It includes a mailbox like user interface, worflow engine and set of business intelligence feature.

## Setting up

BizDoc is designed as a .Net Core web application, running Angular 7. You author a BizDoc app by creating a new project, either from Visual Studio or dotnet command.

### Prerequisites

[Visual Studio](https://visualstudio.microsoft.com/vs/) or Visual Code, Net Core,
[Node.js](https://nodejs.org/), [Angular CLI](https://cli.angular.io/)
and [EF Core](https://docs.microsoft.com/en-us/ef/core/get-started/install/).

Download latest Net Core from [Microsoft](https://dotnet.microsoft.com/download/dotnet-core/2.2).

### Installation

To install BizDoc, open Visual Studio. From Extensions menu, choose Manage Extensions. Select Online and search for [BizDoc Core](https://marketplace.visualstudio.com/items?itemName=Moding.BizDoc-Core).

Install the package. You will need to restart Visual Studio.

Open Visual Studio again and create a New Project. Select BizDoc as the template to your new project.

Run the project to download required dependencies.

Update BizDoc Nuget package. From Package Manager Console, type:

> Update-Package [bizdoc.core](https://www.nuget.org/packages/BizDoc.Core/)

Update npm package. From Windows PowerShell, type:

> npm i [bizdoc.core@latest](https://www.npmjs.com/package/bizdoc.core)

Create a database and set it's _connectionString_ in _appsettings.json_.  

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

BizDoc objects accepts .Net Core services using Dependency Injection (DI). It provides several built-in services you can consume.

Browse to _ClientApp\src\app_ to create and update Angular components.

> Use `ng` command-line to generate new components. See <https://angular.io/cli/generate> for more.

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

BizDoc has some background services you can optionaly configure. These include: escalate job, which escaltes unattended documents, set by AddEscalate() method, mail pending summary set by AddMailWaiting(), execute mail job, set by AddMailExecute() method which comes in three configurtions: IMAP, POP3 and Exchange, which require an additional reference to [Exchange](https://www.nuget.org/packages/BizDoc.Core.Exchange/).

Setup database provider by installing the Nuget for it, from either [SqlServer](https://www.nuget.org/packages/BizDoc.Core.SqlServer/), [Oracle](https://www.nuget.org/packages/BizDoc.Core.Oracle/) or [MySql](https://www.nuget.org/packages/BizDoc.Core.MySql/).

Setup in _startup.cs_.

```c#
    services.AddBizDoc().
      UseSqlServer(connectionString);

```

Set up authentication from either of the three configurations: [AspNetIdentity](https://www.nuget.org/packages/BizDoc.Core.AspIdentity/) for managing users in database, [DirectoryServices](https://www.nuget.org/packages/BizDoc.Core.DirectoryServices/) which uses Microsoft Active Directory, or [Okta](https://www.nuget.org/packages/BizDoc.Core.Okta/). 
Install the relevant Nuget and add it to services in _startup.cs_.

```c#
    services.AddBizDoc().
       UseSqlServer(connectionString).
       AddAspIdentity(options =>
          {
              options.Password.RequireLowercase = false;
              options.Password.RequireUppercase = false;
              options.Password.RequireDigit = false;
              ...
          });
```

Sometimes the default identity manager will not sufice your organization specifics. In which case, you'll want to implement your own identity manager. See how to below.

You can set BizDoc client behaviour from BizDocModule.forRoot() function.

> Open _/ClinetApp/src/app/app.module_ to edit BizDocModule.forRoot() settings.

```typescript
  imports: [BizDocModule.forRoot({...})]
```

## Objects

You control BizDoc flow by authoring _objects_. An object is a unit of code that implements one of the basic BizDoc models in BizDoc.Configuration namespace.

### Dependecy Injection

BizDoc objects support Dependency Injection. You can consume any service added at startup in object constructor, including BizDoc services.

The following example uses IWorkflowInstance to get currently running workflow instance.

```c#
public class MyForm : FormBase<MyFormModel> {
    private readonly IWorkflowInstance _workflowInstance;
    public MyForm(IWorkflowInstance workflowInstance) {
        _workflowInstance = workflowInstance;
    }
}
````

BizDoc provide the following services:

- BizDoc.Core.Http.IHttpContext - Current identity.
- BizDoc.Core.Data.Store - BizDoc database.
- BizDoc.Core.Data.DocumentFactory - Document manager.
- BizDoc.Core.Data.IDocumentContext - Create, update, delete documents, document context.
- BizDoc.Core.Data.CubeService - Query cube.
- BizDoc.Core.Workflow.WorkflowService - Workflow manager.
- BizDoc.Core.Workflow.IWorkflowInstance - Start, resume and access workflow.
- BizDoc.Core.Identity.IProfileManager - User profile.
- BizDoc.Core.Identity.IIdentityManager - User information from provider.
- BizDoc.Core.Messaging.IEmailer - Deliver @.
- BizDoc.Core.Messaging.ISmser - Send SMS.
- BizDoc.Core.Messaging.NotificationManager - inject text notifiction to user(s).
- IOptions<BizDoc.Core.Configuration.Models.SystemOptions> - Configuration.
- BizDoc.Core.Tasks.ScheduledTasks - Delayed execution.

> The `IDocumentContext` and `IWorkflowInstance` services are only available in BizDoc objects.

### Form

A form is comprised of:

- A backing class, responsible for managing evets in form lifetime.
- A model, which represent form structure.
- An Angular component, responsible for displaying model data and responding to user interaction.

Override backend methods to respond to form events, such as FlowEndAsync().

```c#
using BizDoc.Configuration;

[Form(title: "My form")]
public class MyForm : FormBase<MyFormModel>
{
    public override Task FlowEndAsync(MyFormModel model)
    {
        ...
    }
}
```

The above `Form` annotation i used to apply configuration properties.

#### Declare data model

```c#
[Temlate("app-my-form")]
public class MyFormModel {
    public DateTime? Due { get; set; }
    ...
}
```

Properties can be applied attributes to control how the model is read by BizDoc, and control layouting.

Attribues are: Subject, Summary, Value, Required, DataType, MaxLength, Hint and ListType.

```c#  
using BizDoc.ComponentModel.Annotations;

public class MyFormModel {
    [Subject]
    public string Subject { get; set; }
    ...
}
```

#### Mapping database table

You can map form model and sub models to database tables by annotating the class with Table attribute.
Annotate one or more of the properties with the Key attribute. Use DocumentId to apply it to a key.

```c#
[Table("MyTable")]
public class MyFormModel {
    [Key, DocumentId]
    public int Id { get; set; }
    ...
}
```

#### Mapping cube

You map a form model to a cube by annotating the `CubeMapping` attribute.

```c#
[CubeMapping(nameof(Amount), new [] { nameof(Year), nameof(Quarter), nameof(Month), nameof(Balance) })]
public class Line {
  public DateTime Date { get; set; }
  [JsonIgnore, ListType(typeof(Years))]
  public short Year => (short)Date.Year;
  [JsonIgnore, ListType(typeof(Months))]
  public byte Month => (byte)Date.Month/*.ToString("d2")*/;
  [JsonIgnore, ListType(typeof(Quarters))]
  public byte? Quarter => Date.Quarter();

  [ListType(typeof(Balances)), ValueResolver(typeof(StateAxisResolver<Balance?>))]
  public Balance? Balance { get; set; }
}
```

> Mapping should match the ordinal of the _Axes_ declared for the _cube_ in the configuration file.

The `StateAxisResolver` above finds the Balance in _bizdoc.config_ by the document _state_.

#### Mapping scheduled tasks

```c#
[EvenMapping(...)]
```

#### Designing user interface

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
    subject: this._fb.control([], [Validators.required])
  });
  mode: ViewMode;
  constructor(private _fb: FormBuilder) {
  }
  onBind(model: MailModel<MyFormModel>): void {
  }
}
interface MyFormModel {
    subject: string;
}
```

> The `@BizDoc` decorator _selector_ has to match the `Template` attribute of the form model on the server code.

The onBind function of FormComponent&lt;T&gt; interface provide access to message.

Open my-form.component.html to edit the template.

```html
<form [formGroup]="form" autocomplete="off">
  <mat-form-field>
    <input matInput placeholder="Subject" required formControlName="subject" />
  </mat-form-field>
</form>
```

See Angular [reactive forms](https://angular.io/guide/reactive-forms).

You can incorporate BizDoc _Select_ and _Autocomplete_ in your template:

```html
  <mat-form-field>
    <bizdoc-select formControlName="myProperty" type="users" placeholder="My property"></bizdoc-select>
  </mat-form-field>
```

You can assign an icon to the from from any of the [Material Icons](https://material.io/tools/icons).

### Type

A type represent a source of values, which can be applied to model property.
For example, the type Account can retreive accounts from your database.

```c#
[Table("Accounts")]
public class Account
{
    [System.ComponentModel.DataAnnotations.Key]
    public string Id { get; set; }
    public string Name { get; set; }
}
public class Accounts : TypeBase<string>
{
    private readonly CustomStore _store;

    public Accounts(CustomStore customStore)
    {
        _store = customStore;
    }
    public override Task<Dictionary<string, string>> GetValuesAsync(Void args)
    {
        return _store.Accounts.ToDictionaryAsync(a => a.Id, a => a.Name);
    }
}
```

Link a model property to a type by setting it's ListType attribute.

```c#
[ListType(typeof(Accounts))]
public string AccountId {get; set }
```

BizDoc has several built-in types, including Years, Monthes and Users. See BizDoc.Configuration.Generic namespace.

### Report

```c#
public class MyReportDataModel
{
    [Key]
    public int Id { get; set; }
    public string Product { get; set; }
    public decimal? Price { get; set; }
}
public struct MyReportArgsModel
{
    public DateTime Starting { get; set; }
}
[Report(title: "My report")]
public class MyReport : ReportBase<MyReportArgsModel, MyReportDataModel>
{
  private readonly CustomStore _store;
  public MyReport(CustomStore store) {
    _store = store;
  }

  public override async Task<IEnumerable<MyReportDataModel>> 
    PopulateAsync(MyReportArgsModel args, IProgress<int> progress) =>
      await _store.Lines.Select(l=> new MyReportDataModel {
        Product = l.Product,
        Price  l.Price,
        ...
      }).ToListAsync();
}
```

### Cube

A cube represent a cross-data summary, which can be visualized as a chart of accumulated values.

A cube declare _Axes_. Each axis represents a Type.

You map a cube to form model by annotating the CubeMapping attribute.

> Open _bizdoc.json_ and find Cubes section. You can reorder, modify and add axes to the Axes section.

You can add views to a cube in the configuration file.

```c#
public class MyCube : CubeBase
{
}
```

Override cube CanView() methon to control access.

A cube may also have one or more _Index_. An index represent a linear data such as budgeted values or target performance.

#### Quering

Use the `CubeService` to preform quries on cube and indices.

```c#
public class MyForm : FormBase<MyFormModel> {
    private readonly CubeService _cubeService;
    public MyForm(ICubeService CubeService) {
        _CubeService = CubeService;
    }

    public override async Task FlowStartAsync(MyFormModel model) {
      var usage = await _cubeService.GetUsage("myCube", 2020, Axis.FromArray(1, 2), Axis.Null, Balance.Opend);
      ...
    }
}
```

The above retrieves the usage for myCube, year 2020 1st-2nd querters of all Opened balance.

The _Axis_ struct can be utilized to specify range, collection, pattern or combination of them. Patterns support _*_ and _._ charaters.

Cubes are stored in database _BizDoc.Cube_ and _BizDoc.Indices_ tables.

#### Explore data

You can extend the default drill down cpability by implementing a custom dill down. This is a desigered behaviour if your cube summarize data from 3rd party.

Implement the CubeBase.IExplore&lt;T&gt;.

Override cube GetExploreType() methon and return the T type for the requested axes.

### Widget

A _Widget_ shows summary data on dashboard.

```c#
[Template("app-my-widget")]
public class MyWidget : WidgetBase<PersonalActivity.DataModel, PersonalActivity.ArgsModel>
{
    public override Task<DataModel> GetAsync(ArgsModel args)
    {
        ...
    }
    public struct DataModel
    {
        ...
    }
    public struct ArgsModel
    {
    }
}
```

Add a new compoenent to your widget in ./ClientApp.

```typescript
import { Component } from '@angular/core';
import { WidgetComponent } from 'bizdoc.base';
import { BizDoc } from 'bizdoc.core';

@Component({
  selector: 'app-my-widget',
  templateUrl: './my-widget.widget.html',
})
@BizDoc({
  selector: 'app-my-widget'
})
/** component*/
export class MyWidget implements WidgetComponent<DataModel[]> {
  onBind(data: DataModel[]) {
    ...
  }
}
interface DataModel {
    ...
}
```

## How To

### Add version compare

In you form template, use the `bizdocCompareGroup`, `bizdocCompareContext` and `bizdocCompareName` directives.

```html
<ng-container [ngSwitch]="mode">
  <div *ngSwithCase='"preview"'>
    <span bizdocCompareName="from,to">{{data.model.from}} - {{data.model.to}}</span>
    <table bizdocCompareGroup="lines">
      <tr *ngFor='let line of data.model.lines' [bizdocCompareContext]='line'>
        <td bizdocCompareName="product">{{line.product}}</td>
      </tr>
    </table>
  </div>
</ng-container>
```

You may also access version data from the onBind() function.

```typescript
onBind(data: MailModel<MyFormModel>, version?: MyFormModel): void {
    if(version && version.subject !== data.model.subject) {
      ...
    }
}
```

### Format email

Create new xslt file. In file properties, choose 'Copy Always'.

```xml
<?xml version="1.0" encoding="utf-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns="https://raw.githubusercontent.com/moding-il/bizdoc.core/master/message.xsd">
  <xsl:output method="html" indent="no"/>
  <xsl:template match="/Message">
    <html>
      <body>
          #<xsl:value-of select="Number"/>
          ...
        </body>
    </html>
</xsl>
```

In startup.cs services.AddBizDoc(), set BodyTemplate to your xslt file path, relative to the project root.

You can pass data to CustomData node by overriding the GetCustomData() method on your form object.

### Create custom Identity Manager

Create new class in your project and make it implement _BizDoc.Core.Identity.IIdentityManager_ and _BizDoc.Core.Identity.ISignInProvider_.
Register each of them separately in _startup.cs_ as scoped service for the respective interface, prior to calling AddBizDoc().

### Customize built-in objects

BizDoc offers several built-in objects. These include workflow activities, data sources and widgets. You can extend any of these objects and adjust their behaviour.

Create a new object and inherit from the object you wish to extend.

```c#
public class MyDepartmentalPerformance: DepartmentalPerformance {
    private readonly IIdentityContext _identityContext;
    protected override async Task<string[]> UsersAsync() => ... // provide list of identities
}
```

Set the Type of the object in bizdoc configuration file to your implementation.

BizDoc built-in objects can be found under the following namespaces:
BizDoc.Workflow.Activities, BizDoc.Workflow.Actions,
BizDoc.Configuration.Generic and
BizDoc.Configuration.Widgets.

### Disable existing objects

Open bizdoc.json configuration and locate the object you wish to disable.
Add Disabled to the object node.

```json
{
    "Disabled": true
}
```

### Set rules to form sections

BizDoc has an administrative utility for assigning _roles_ to _rules_. Rules are declared per form in _bizdoc.config_.

```json
{
  "Rules": {
    "myField": {
      "Roles": [
        "role1"
      ]
    }
  },
  "Name": "myForm"
}
```

In your form component template, test privileges by providing the permission name.

```html
<input bizdocDisabled="myField" />
<div bizdocHidden="myField"></div>
```

You can gain programatic access to rules in the onBind() method.

```typescript
private _privileges: { [name: string]: boolean; };
onBind(data: MailModel<MyFormModel>): void {
    this._privileges = data.rules;
}
```

In addition to roles, a rule may be assigned an _Expression_, which has to evaluates to true. See _rules_ above on how to endorse new rules.

### Store custom user settings

You can use BizDoc _IProfileManager_ service to store application specific settings.

In your object constructor, consume _IProfileManager_ and use Get() and Set() method to retreive and persist your settings.

```c#
public class MyForm: FormBase<MyFormModel> {
    private readonly IProfileManager _profileManager;
    public MyForm(IProfileManager profileManager) {
        _profileManager = profileManager;
    }
    private void ApplySettings() {
        var profile = _profileManager[myModel.OwnerId];
        var settings = profile.Get<MySettings>();
        settings.MyProperty = false;
        _profileManager.Persist(profile);
    }
    public struct MySettings {
        public bool MyProperty {get; set; }
    }
}
```

## References

BizDoc rely on [Hanfire](https://docs.hangfire.io/) for background tasking. You can add your long-running or period tasks using it's infrastructure. Adminstrative access available through /hangfire url.

BizDoc uses [Syncfusion](https://www.syncfusion.com/angular-ui-components) for charting. If you wish to add your own charts, consider using this library. Licesing reqired.

Issus can be submitted [here](https://github.com/moding-il/bizdoc.core/issues).

> Product updates are relesed as `npm` and `Nuget` packages.
