# bizdoc.core

BizDoc is a developer framework for designing organization forms. It includes a mailbox -like user interface, a worflow engine, and set of business intelligence feature.

## Setting up

BizDoc is a .Net Core web application, running Angular 10. To author a new BizDoc environment, create a new project from _BizDoc template_,.

### Prerequisites

[Visual Studio](https://visualstudio.microsoft.com/vs/) or Visual Code, [Net Core 3.1](https://dotnet.microsoft.com/download/dotnet-core/3.1),
Latest [Node.js](https://nodejs.org/), [Angular CLI](https://cli.angular.io/)
and [EF Core](https://docs.microsoft.com/en-us/ef/core/get-started/install/).

### Installation

To install BizDoc, open Visual Studio. Choose *Extensions* menu, *Manage Extensions*. Select *Online* and search for [BizDoc Core](https://marketplace.visualstudio.com/items?itemName=Moding.BizDoc-Core).

Install the package. Restart Visual Studio and accept installation.

Open Visual Studio again, and create a *New Project*. Select *BizDoc* as the template to the new project.

Update BizDoc Nuget package. From Package Manager Console, type:

> Update-Package [bizdoc.core](https://www.nuget.org/packages/BizDoc.Core/)

Update npm package from Windows command-line:

> npm i [bizdoc.core@latest](https://www.npmjs.com/package/bizdoc.core)

Create a database of your choice and set it's _connectionString_ in _appsettings.json_.  
From command-line, create the database schema.

> dotnet ef database update -context BizDoc.Core.Data.Store

## Architecture

BizDoc can be broken into two major parts: backend server objects, controllers and configuration; and front-end user interface, built as Angular components.
Commonly, a front-end *component* has a backing server *object*. For example, BizDoc object such as a *form*, will have a class that manages it's lifetime events. Core communication between the front-end and the backend is done through BizDoc infrasructure.

BizDoc objects can be one of:

* Form
* Type
* Report
* Widget
* Utility
* Action
* Cube
* Rule.

BizDoc also facilitates unmanaged objects, which does'nt have a backend class. Including:

* Currencies
* Folders - Set columns.
* States - Document statuses.
* Roles - Declare a role per _type_, add *patterns* and *groups*, and assign positions

Control these settings by editing the relevent section in the configuration file.

BizDoc registers objects in _bizdoc.json_ configuration file. Upon run, if objects classes are found in your project they are added to the configuration file.
You may instruct BizDoc to register an object with specific settings by annotating the class with the respective attribute, as explained below.

> Open _bizdoc.json_ and review your app configuration.

You can manually edit the configuration file, providing they confirm with the provided JSON schema.

As mentioned, a BizDoc object may have a fromt-end Angular component. The backend class is coupled with the front-end component by annotating the \[Template()\] attribute with a unique value. The Angular component is then decorated with the @BizDoc() attribute with a matching value.

BizDoc objects accepts .Net Core services using Dependency Injection (DI). It provides several built-in services you can consume.

Find _ClientApp\src\app_ in your project to create and update Angular components.

> Use `ng` command-line to generate new components. See <https://angular.io/cli/generate> for more.

BizDoc user interface is aligned with Material Design guidelines, using the [Angular Material](https://material.angular.io/) library.
Consult Angular Material documentation on how to use components.

BizDoc database can be one of SqlServer, MySQl or Oracle. The BizDoc database objects are created in the \[BizDoc\] schema.
You'll probably want to create your own database context to access custom database tables. Refer to .Net Core [EF](https://docs.microsoft.com/en-us/ef/core/get-started/index) on how to create and maintain Entity Framework context.
To access BizDoc database objects using EF, use the `Store` service, from *BizDoc.Core.Data* namespace.

## Configuration

BizDoc behaviour is set in _startup.cs_. You first register BizDoc services using AddBizDoc(), and then consume it using UseBizDoc().
BizDoc configuration includes licensing and messaging.

Configure SMTP for outgoing mailing.

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

> Sometimes, the default identity managers will not answer all your organization needs. In which case, you can implement your own identity manager. See below how to create a custom identity manager.

BizDoc offers additional services. These include:

* AddEscalateJob() - Escaltes unattended documents
* AddSummaryMailJob() - Pending documents, notifications and chat summary
* AddMailExecuteJob() - Analize returning emails for action and forward document workflow. Feature comes in three configurtions: IMAP, POP3 and Exchange. Exchange require an additional reference to [Exchange](https://www.nuget.org/packages/BizDoc.Core.Exchange/).
* AddExchangeRateJob() - Update currency exchange rate
* AddSwagger() - Support Swagger

To set BizDoc client app behaviour, update BizDocModule.forRoot() in your *app.module.ts* file.

```typescript
  imports: [BizDocModule.forRoot({
    currencyCode: 'EUR'
    ...
  })]
```

## Objects

You control BizDoc flow by authoring _objects_. An object is a unit of code that implements one of BizDoc base classes. Base classes can be found in BizDoc.Configuration namespace.

### Dependecy Injection

BizDoc objects support Dependency Injection. You consume services added in your startup.cs file in the object constructor, including BizDoc services.

The following example uses the `IWorkflowInstance` service to access the currently running workflow instance.

```c#
public class MyForm : FormBase<MyFormModel> {
    private readonly IWorkflowInstance _workflowInstance;
    public MyForm(IWorkflowInstance workflowInstance) {
        _workflowInstance = workflowInstance;
    }
}
````

BizDoc provides the following services:

* BizDoc.Core.Http.IHttpContext - Current identity.
* BizDoc.Core.Data.Store - BizDoc database.
* BizDoc.Core.Data.DocumentFactory - Document manager.
* BizDoc.Core.Data.IDocumentContext - Current document.
* BizDoc.Core.Workflow.WorkflowService - Workflow manager.
* BizDoc.Core.Workflow.IWorkflowInstance - Start, resume and access workflow.
* BizDoc.Core.Data.CubeService - Query cube.
* BizDoc.Core.Identity.IProfileManager - User profile.
* BizDoc.Core.Identity.IIdentityManager - User information.
* BizDoc.Core.Messaging.IEmailer - Deliver @.
* BizDoc.Core.Messaging.ISmser - Send SMS.
* BizDoc.Core.Messaging.NotificationManager - Send text notifiction to a user.
* IOptions<BizDoc.Core.Configuration.Models.SystemOptions> - Configuration.
* BizDoc.Core.Tasks.ScheduledTasks - Delayed execution.

> `IDocumentContext` and `IWorkflowInstance` are only available within BizDoc objects.

### Form

Forms are the core of BizDoc.
A _form_ object has three parts:

* A data model, representing form structure.
* Backing class, drived from FormBase, responsible for managing events in form lifetime.
* An Angular component, responsible for displaying data and responding to user interaction.

#### Declare data model

```c#
public class MyFormModel {
  public string Subject { get; set; }
  public DateTime? Due { get; set; }
  ...
}
```

You can decorate properties with attributes, controlling how the model is read by BizDoc, and controling default layout.

Attribues include: Subject, Summary, Value, Currenc, Required, DataType, MaxLength, Display, Hint and ListType.

```c#  
using BizDoc.ComponentModel.Annotations;

[Temlate("app-my-form")]
public class MyFormModel {
  [Subject]
  public string Subject { get; set; }
  ...
}
```

The above instructs BizDoc to use the Subject proerty as the document title.
The Template annotation names the Angular component for this form.

#### Declare baking object

Override backend methods, such as FlowEndAsync(), to respond to form events.

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

The above Form annotation is used to apply a title to form configuration. See the configuratino file for more.

##### Mapping database tables

You can map form model and sub models to database tables by annotating the class with Table, Key, DocumentId and Line attributes.
Assign the DocumentId attribute to instruct BizDoc to set it's value from the document identity.

```c#
[Table("MyTable")]
public class MyFormLine {
  [Key, DocumentId]
  public int FormId { get; set; }
  [Line] // unique
  public short Line { get; set; }
  ...
}
```

##### Mapping a cube

Map a form model to a cube by annotating the `CubeMapping` attribute.

```c#
[CubeMapping(nameof(Amount), new [] { nameof(Year), nameof(Quarter), nameof(Month), nameof(Balance) })]
public class Line {
  public DateTime Date { get; set; }
  [JsonIgnore, ListType(typeof(Years))]
  public short Year => (short)Date.Year;
  [JsonIgnore, ListType(typeof(Months))]
  public byte Month => (byte)Date.Month;
  [JsonIgnore, ListType(typeof(Quarters))]
  public byte? Quarter => Date.Quarter();

  [ListType(typeof(Balances)), ValueResolver(typeof(StateAxisResolver<Balance?>))]
  public Balance? Balance { get; set; }
}
```

The `StateAxisResolver` above finds the Balance in _bizdoc.config_ by the document _state_ *Options*.

```json
"States": [
{
  "Past": "Opened",
  "Color": "green",
  "Name": "open",
  "Title": "Open",
  "ResourceType": "BizDoc.Core.Resources.Strings",
  "Options": {
    "Axis": "Open"
  }
}]
```

> Mapping should match the ordinal and types of the _Axes_ declared for the cube in the configuration file.

##### Mapping scheduled tasks

Schedule an event using model properties.

```c#
[ScheduleMapping(nameof(EventDate))]
public class Line {
  public DateTime EventDate {get; set;}
}
```

#### Designing user interface

From ./ClientApp PowerShell, type:

> ng g c myForm

Open ./app/src/myForm/myForm.component.ts

```typescript
import { FormComponent, MailModel, ViewMode, BizDoc } from 'bizdoc.core';
@Component({
  selector: 'app-my-form',
  templateUrl: './my-form.component.html',
  styleUrls: ['./my-form.component.scss']
})
@BizDoc({
  selector: 'app-my-form'
})
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

The above code declares an interface that matches the data model on the server-side, and a component implementing the FormComponent\<T\> interface.

> The `@BizDoc` decorator _selector_ has to match the `Template` attribute of the form model on the server code.

Access form data from the onBind function of the FormComponent&lt;T&gt; interface.

You can inject BizDoc angular services in your component constructor to gain access to BizDoc infrastructure.
Services include `SessionService`, `CubeService`, `DataSourceService` and `TranslationService`.

Open my-form.component.html to edit the template.

```html
<form [formGroup]="form" autocomplete="off">
  <mat-form-field>
    <input matInput placeholder="Subject" required formControlName="subject" />
  </mat-form-field>
</form>
```

See Angular [reactive forms](https://angular.io/guide/reactive-forms) on how to handle forms and validations.

You can incorporate BizDoc `Select` and `Autocomplete`, `AccountPicker` and `Trace` in your template.

```html
<mat-form-field>
  <bizdoc-select formControlName="myProperty" type="users" placeholder="My property"></bizdoc-select>
</mat-form-field>
```

In the above example, the *type* attribute matches a TypeBase class declared in the configuration file.

The `AccountPicker` allows the user to pick *combination* of _segments_. An axis is considered a segment if it's *combination* is set to true.

```html
<mat-form-field>
  <bizdoc-account-picker formControlName="myProperty" placeholder="My property"
  (optionSelected)='accountPicked($event)' [exploreSettings]='{series: "balance", xAxis: "month"}'></bizdoc-select>
</mat-form-field>
```

By default, combinations are driven from the _BizDoc.Combinations_ table. You can override CombinationsAsync() of the cube backend to provide combination from a different table, like a 3rd party app.

You can change form configuration properties in the configuration file. For example, you can assign an icon to the from from any of the [Material Icons](https://material.io/tools/icons).

### Type

A type represent a source of values, which can be applied to model property.
For example, the type Account can retreive accounts from your database.

```c#
[Table("Accounts")]
public class Account
{
    public string Id { get; set; }
    public string Name { get; set; }
}
public class Accounts : TypeBase<string>
{
    private readonly CustomStore _store;

    public Accounts(CustomStore customStore) => _store = customStore;

    public override Task<Dictionary<string, string>> GetValuesAsync(Void args) =>
        _store.Accounts.ToDictionaryAsync(a => a.Id, a => a.Name);
}
```

Link a *Type* to a form data model property by setting it's ListType attribute.

```c#
[ListType(typeof(Accounts))]
public string AccountId {get; set }
```

BizDoc has several built-in types, including Years, Quarters, Months and Users. See BizDoc.Configuration.Generic namespace for others.

You can control objects such as a Type behaviour by setting it's Options in the configuration file.

```json
Types: [
  {
    "Name": "products",
    "Type": "BizDoc.Configuration.Generic.SqlDataSource",
    "Options":{
      "ConnectionString": "...",
      "CommandText": "SELECT Id, Name FROM Products"
    }
  }
]
```

### Report

A report component has a data model, a backing class and arguments class.

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

A report may have an Angular component mapping to it, in which case the component should implement the IReportComponent\<T\>.

```typescript
import {ReportComponent, BizDoc, ReportRef} from 'bizdoc.core';

@Component({...})
@BizDoc({...})
export class MyReport implements ReportComponent<MyReportModel, MyReportArgs> {
  constructor(@Inject(ReportRef) private _ref: ReportRef) { }
  onBind(data: MyReportModel[]) {
    ...
  }
}
interface MyReportModel { ... }
interface MyReportArgs { ... }
```

The ReportRef above enables the report to access running context functionality, such as progress events of the server-side code.

> If no component is registered using the _Template_ annotation, BizDoc treats the model properties as columns and the arguments as fields.
> Use Display and DataType attributes to change layout.

BizDoc built-in reports can be customized by setting the Options in the configuration.

```json
Reports: [{
  "Type": "BizDoc.Configuration.Reports.CubeChartUsage",
  "Name": "cube-chart-usage",
  "Title": "ChartUsage",
  "Options": {
    "Series": [
      "year",
      "month"
    ],
    "ChartType": "Column",
    "Collapse": true
  }
}]
```

### Cube

A cube represent a cross-data summary, which can be visualized as a chart or a pivot.

A cube declares _Axes_. Each axis maps to a _Type_ holding the axis possible values.
You can use one of the built-in types or declare a type of your own, for example, a type that pulls accounts from a 3rd party app using SQL.

You may choose to use the _BizDoc.Segments_ database to store possible values. In which case, you can set up a type for each segment in the configuration file types section.

```json
{ "Types":[{
  "Type": "BizDoc.Configuration.Generic.Segments",
  "Name": "accounts",
  "Options": {
    "SegmentId": "account"
  }
}]
}
```

You map a cube to form data model by annotating the `CubeMapping` attribute as explained above.

#### Backing object

Create a class that drives from CubeBase.

```c#
public class MyCube : CubeBase
{
}
```

Override base methods, such as the CanView() methon, to control aspects of the cube.

#### Configuring

A cube uses _views_ to decide what cut to show of the data. A view typecly has X-Axis and Series.

```json
"Cubes": [
  {
    "Axes": [
      {
        "DataType": "years",
        "Name": "year",
        "Title": "Year"
      },
      {
        "DataType": "quarters",
        "Name": "quarter",
        "Title": "Quarter"
      }
    ],
    "Views": [
      {
        "XAxis": [
          "year",
          "month"
        ],
        "Series": "balance",
        "Indices": "budget",
        "ChartType": "StackingColumn",
        "Name": "balance",
        "Title": "Balance"
      }
    ],
    "Patterns": [
      {
        "Roles": [
          "System"
        ],
        "Axes": {
          "year": "20*"
        },
        "Name": "y2",
        "Title": "20`"
      }
    ],
    "Indices": [
      {
        "Name": "budget",
        "Title": "Budget"
      }
    ],
    "Name": "myCube",
    "Title": "My cube"
  }]
```

A cube may have one or more _Index_. An index represent a linear data such as budgeted values or target performance.
Patterns are maintained either by editing the file or using an administrative utility.

> Open _bizdoc.json_ and find Cubes section. Reorder, modify and add axes and views to your cube.

#### Explore data

You can extend the default drill down cpabilities by implementing a custom dill down, into 3rd party app.

First, implement the CubeBase.IExplore&lt;T&gt; QueryAsync(). Then override the GetExploreType() methon and return the relevant type for the requested axes.

```c#
public class MyCube : CubeBase, CubeBase.IExplore<PO> {
  public override GetExploreType(params string[] axes) {
      if (axes.ElementAt(4 /* position of the balance axis */).Equals(Balance.PO.ToString())
        return typeof(PO);
      return base.GetExploreType();
  }
}
```

#### Quering

Use the `CubeService` to preform quries on cubes and indices.

```c#
public class MyForm : FormBase<MyFormModel> {
    private readonly CubeService _cubeService;
    public MyForm(ICubeService CubeService) {
        _CubeService = CubeService;
    }

    public override async Task FlowStartAsync(MyFormModel model) {
      var usage = await _cubeService.GetUsage("myCube", 2020, Axis.FromArray(1, 2), default, Balance.Opend);
      ...
    }
}
```

The above retrieves the usage for myCube, year 2020 1st-2nd querters of all Opened balance.

The _Axis_ struct can be utilized to specify range, collection, pattern or combination of them. Patterns support _*_ and _._ charaters.

#### Define cube anomely

By default, anomaly is calculated as the value of all cube records that map to the document *entries* dedected from all of the cube *indices*, where axis marked as *sensitive* are included.

If you wish to refine how anomely is calculated, override the cube CalculateAnomalyAsync() method. A negative value is considered an anomaly.

#### Database

Cubes are stored in database _BizDoc.Cube_ and _BizDoc.Indices_ tables, where _BizDoc.Cube_ reflect document data stored in _BizDoc.Entries_ table. Two more tables are _BizDoc.Combinations_ and _BizDoc.Segments_.

If you manipulate tables data to reflect 3rd party information, make sure you use records that were not created by BizDoc.

### Widget

A _Widget_ data on dashboard.

```c#
[Template("app-my-widget")]
public class MyWidget : WidgetBase<PersonalActivity.DataModel>
{
    public override Task<DataModel> GetAsync(Void args)
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

Add a component that matches your widget template in ./ClientApp.

```typescript
import { WidgetComponent, BizDoc } from 'bizdoc.core';

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

The above component implements the WidgetComponent\<T\> interface onBind() function, receiving data from the GetAsync() method on the server-side object.

## How To

### Enable version compare

BizDoc logs changes made to document model during workflow. Changes can then be viewed from trace. To enable the form to show a colorful version compare, use the `bizdocCompareGroup`, `bizdocCompareContext` and `bizdocCompareName` directives.

```html
<ng-container [ngSwitch]="mode">
  <div *ngSwithCase='"version"'>
    <span bizdocCompareName="from,to">{{data.model.from}} - {{data.model.to}}</span>
    <table bizdocCompareGroup="lines">
      <tr *ngFor='let line of data.model.lines' [bizdocCompareContext]='line'>
        <td bizdocCompareName="product">{{line.product}}</td>
      </tr>
    </table>
  </div>
</ng-container>
```

You can access version data programatically from the onBind() function.

```typescript
onBind(data: MailModel<MyFormModel>, version?: MyFormModel): void {
    if(version && version.subject !== data.model.subject) {
      ...
    }
}
```

### Format email delivered

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

> Use the schama to learn the structure.

In startup.cs services.AddBizDoc(), set BodyTemplate to your xslt file path.

You can pass data to CustomData node by overriding the GetCustomData() method on your form object.

### Creating custom Identity Manager

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
BizDoc.Workflow.Activities,
BizDoc.Workflow.Types,
BizDoc.Workflow.Actions,
BizDoc.Configuration.Generic and
BizDoc.Configuration.Widgets.

### Internationalization

BizDoc configuration _ResourceType_ attribute.

```json
"Folders": [
  {
    "Icon": "drafts",
    "Name": "df",
    "Title": "Drafts",
    "ResourceType": "BizDoc.Core.Resources.Strings"
  }]
```

In code:

```c#
[Form(Title = "MyForm", ResourceType = typeof(Properties.Resources))]
public class MyForm : FormBase<MyFormModel> {
    "Disabled": true
}
```

In Angular app.module:

```typescript
TranslationService.Set('es', {myField: 'My Field {0}'});
```

Consume using translation _pipe_.

```html
<div>{{'myField' | translate : '!'}}</div>
```

### Disable existing objects

Open bizdoc.json configuration and locate the object you wish to disable.
Add Disabled to the object node.

```json
{
    "Disabled": true
}
```

### Set privileges to form fields and sections

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

In your form component template, test privileges by providing the permission name to either `bizdocDisabled` or `bizdocHidden` directives.

```html
<input bizdocDisabled="myField" />
...
<div bizdocHidden="myField"></div>
```

You can gain programatic access to rules from the onBind() method.

```typescript
onBind(data: MailModel<MyFormModel>): void {
    if (!data.rules['myField']) {
      ...
    }
}
```

In addition to roles, a rule may be assigned an _Expression_, which has to evaluates to true. See _rules_ above on how to endorse a new rule.

### Store custom user settings

You can use BizDoc _IProfileManager_ service to store application specific settings.

In your object constructor, consume _IProfileManager_ and use Get() and Set() method to retreive and persist your settings.

```c#
public class MyForm: FormBase<MyFormModel> {
    private readonly IProfileManager _profileManager;
    private readonly IHttpContext _httpContext;
    public MyForm(IHttpContext httpContext, IProfileManager profileManager) {
        _profileManager = profileManager;
        _httpContext = httpContext;
    }
    private void ApplySettings() {
        var profile = _profileManager[_httpContext.UserId];
        var settings = profile.Get<MySettings>();
        settings.Like = false;
        _profileManager.Persist(profile);
    }
    public struct MySettings {
        public bool Like {get; set; }
    }
}
```

## References

BizDoc rely on [Hanfire](https://docs.hangfire.io/) for background tasking. You can add your long-running or period tasks using it's infrastructure. Adminstrative access available through /hangfire url.

BizDoc uses [Syncfusion](https://www.syncfusion.com/angular-ui-components) for charting. If you wish to add your own charts, consider using this library. Licesing reqired.

Issus can be submitted [here](https://github.com/moding-il/bizdoc.core/issues).

> Product updates are relesed as `npm` and `Nuget` packages.
