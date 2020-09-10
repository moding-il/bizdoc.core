# bizdoc.core

BizDoc is a developer framework for designing organization forms. It includes a mailbox -like user interface, a workflow engine, and set of business intelligence feature.

## Setting up

BizDoc is a .Net Core web application, running Angular 10. To author a new BizDoc environment, create a new project from _BizDoc template_,.

### Prerequisites

[Visual Studio](https://visualstudio.microsoft.com/vs/) or Visual Code, [Net Core 3.1](https://dotnet.microsoft.com/download/dotnet-core/3.1),
Latest [Node.js](https://nodejs.org/), [Angular CLI](https://cli.angular.io/)
and [EF Core](https://docs.microsoft.com/en-us/ef/core/get-started/install/).

### Installation

To install BizDoc, open Visual Studio and choose *Extensions* menu, *Manage Extensions*. Select *Online* and search for [BizDoc Core](https://marketplace.visualstudio.com/items?itemName=Moding.BizDoc-Core).

Install the package and restart Visual Studio.

Create a *New Project*, choose *BizDoc* as the template of the project.

Update BizDoc Nuget package from Package Manager Console:

> Update-Package [bizdoc.core](https://www.nuget.org/packages/BizDoc.Core/)

Update npm package from PowerShell command-line:

> npm i [bizdoc.core@latest](https://www.npmjs.com/package/bizdoc.core)

Create a database of your choice and set it's _connectionString_ in _appsettings.json_.  
From command-line, create the database schema.

> dotnet ef database update -context BizDoc.Core.Data.Store

## Architecture

BizDoc can be broken into two major parts: a. backend server objects, controllers and configuration; b. front-end user interface, built as Angular components and services.
Commonly, a front-end *component* has a backing server *object*. For example, BizDoc object such as a *form*, will have a class that manages it's lifetime events. Core communication between the front-end and the backend is done through BizDoc infrastructure.

BizDoc objects can be one of:

* Form
* Action - Workflow user option
* Node - Workflow item.
* Report - Retrive data and present it, commonly as a table.
* Type - Data source for list of values. Can declare *patterns* and *groups*.
* Utility - Unit of work.
* Widget - Dashboard item.
* Cube - Charting index.
* Rule - Condition.

In addition to the managed objects above, BizDoc facilitates unmanaged objects which doesn't have a backend object, including:

* Folders - Set columns.
* States - Document statuses.
* Roles - Declare a role per _type_ and assign *positions*.
* Currencies

BizDoc registers objects in _bizdoc.json_ configuration file. Upon run, if objects are found in your project assembly, they are added to the configuration file.

> Open _bizdoc.json_ and review your app configuration. This file is updated by BizDoc, updated by administrative utilities, or - can be edited manually.

You can manually edit the configuration file, providing the changes confirm with the attached JSON schema.

BizDoc objects may have a front-end Angular component, in which case, the backend class is coupled with the front-end component by annotating it with the \[Template()\] attribute. The Angular component needs to be decorated with the @BizDoc() attribute with a matching value.

BizDoc objects accepts .Net Core services using Dependency Injection (DI). It provides several built-in services you can consume.

BizDoc user interface is aligned with Material Design guidelines, using the [Angular Material](https://material.angular.io/) library. Consult Angular Material documentation on how to use components.

BizDoc database can be one of SqlServer, MySQl or Oracle. The BizDoc database objects are created in the \[BizDoc\] schema.
Commonly, developers create their own database context to access database tables. Refer to .Net Core [EF](https://docs.microsoft.com/en-us/ef/core/get-started/index) on how to create and maintain Entity Framework contexts.
To access BizDoc database objects using EF, use the `Store` service, from *BizDoc.Core.Data* namespace.

## Configuration

BizDoc behavior is set in _startup.cs_. You first register BizDoc services using AddBizDoc(), and then consume it using UseBizDoc().
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

* AddEscalateJob() - Escalates unattended documents
* AddSummaryMailJob() - Pending documents, notifications and chat summary
* AddMailExecuteJob() - Analyze returning emails for action and forward document workflow. Feature comes in three configurations: IMAP, POP3 and Exchange. Exchange require an additional reference to [Exchange](https://www.nuget.org/packages/BizDoc.Core.Exchange/).
* AddExchangeRateJob() - Update currency exchange rate
* AddSwagger() - Support Swagger

You can set BizDoc client app behavior by updating the BizDocModule.forRoot() in your *app.module.ts* file.

```typescript
  imports: [BizDocModule.forRoot({
    currencyCode: 'EUR'
    ...
  })]
```

## Objects

An object is a unit of code that implements one of BizDoc base classes. Base classes can be found in BizDoc.Configuration namespace.

### Dependency Injection

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
A _form_ object consists of three parts:

* A data model, representing form structure
* Backing class, derived from FormBase, responsible for managing form lifetime
* And an Angular component, displaying data and responding to user interaction.

#### Declare data model

```c#
public class MyFormModel {
  public string Subject { get; set; }
  public DateTime? Due { get; set; }
  ...
}
```

You can decorate properties with attributes to control how the model is handled by BizDoc. These include: Subject, Summary, Value, Currency, Required, DataType, MaxLength, Display, Hint and ListType.

To use the model Purpose property as the document title, use the Subject attribute.

```c#  
using BizDoc.ComponentModel.Annotations;

[Template("app-my-form")]
public class MyFormModel {
  [Subject]
  public string Purpose { get; set; }
  ...
  public IList<MyFormModelLine> Lines { get; set; }
}
```

The Template annotation name the Angular component for this form.

#### Declare baking object

Create a class that drives from FormBase\<T\>. Override base methods, such as FlowEndAsync(), to respond to form events.

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

The above class has a _Form_ annotation, instructing BizDoc to set a title to form when registering it in the configuration file.

##### Mapping database tables

You can map form model and sub models to database tables by annotating the class with Table, Key, DocumentId and Line attributes.
Assign the DocumentId attribute to instruct BizDoc to set its value from the document identity, and the Line attribute to set am ordinal on model collections.

```c#
[Table("MyTableLine")]
public class MyFormLine {
  [Key, DocumentId]
  public int FormId { get; set; }
  [Line]
  public short Line { get; set; }
  ...
}
```

##### Mapping a cube

Map a form model to a cube by annotating any of your data model classes with the `CubeMapping` attribute.

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

The `StateAxisResolver` finds the Balance in the configuration file that matches the document _state_. Set the *Axis* attribute in the state *Options*.  

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

> Mapping should match the types and ordinal of the cube _Axes_ declared in the configuration file.

##### Mapping scheduled tasks

Schedule an event using model properties.

```c#
[ScheduleMapping(nameof(EventDate))]
public class Line {
  public DateTime EventDate {get; set;}
}
```

#### Designing user interface

Open PowerShell in ./ClientApp folder and type:

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

> The `@BizDoc` decorator _selector_ must match the `Template` attribute of the form model on the server code.

Access form data from the onBind function of the FormComponent&lt;T&gt; interface.

You can inject BizDoc angular services in your component constructor to gain access to BizDoc infrastructure.
Services include:

* `SessionService`,
* `CubeService`,
* `DataSourceService`,
* `TranslationService`,
* `GuideService`,
* `CubeInfo`,
* `MapInfo`,
* `DocumentInfo`,
* `AttachmentInfo`.

Open my-form.component.html to edit the template.

```html
<form [formGroup]="form" autocomplete="off">
  <mat-form-field>
    <input matInput placeholder="Subject" required formControlName="subject" />
  </mat-form-field>
</form>
```

See Angular [reactive forms](https://angular.io/guide/reactive-forms) on how to handle forms and validations.

You can incorporate BizDoc `Select`, `Autocomplete`, `AccountPicker`, `TimePicker`, `AddressInput` and `Trace` in your template.

```html
<mat-form-field>
  <bizdoc-select type="users" placeholder="My property"></bizdoc-select>
</mat-form-field>
```

In the above example, the *type* attribute matches a TypeBase class declared in the configuration file.

The `AccountPicker` allows the user to pick _combinations_ of _segments_. An axis is considered a segment if its *Combination* attribute is set to true.

```html
<mat-form-field>
  <bizdoc-account-picker placeholder="My property"
  (optionSelected)='accountPicked($event)' [exploreSettings]='{series: "balance", xAxis: "month"}'></bizdoc-select>
</mat-form-field>
```

By default, combinations are stored in _BizDoc.Combinations_ table. You can override CombinationsAsync() in the cube backend to populate combinations from a different source, such as a 3rd party app.

#### Supporting view mode

A form may be visible for editing, previewing or version compare. Template can handle different modes using a NgSwitch:

```html
<ng-container [ngSwitch]="mode">
  <div *ngSwitchCase='"compose"'>
    <!-- form comes here -->
  </div>
  <div *ngSwitchDefault>
    <!-- preview and version mode -->
  </div>
</ng-container>
```

Commonly, in addition to form data, preview mode display document trace.

```html
<bizdoc-trace [model]=data></bizdoc-trace>
```

You can change form configuration properties in the configuration file. For example, you can assign an icon from any of the [Material Icons](https://material.io/tools/icons).

### Type

A _type_ represents a source of values, which can be applied to model property.
For example, the type Account can retrieve accounts from your database.

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

BizDoc has several built-in types, including Years, Quarters, Months and Users. See BizDoc.Configuration.Types namespace for others.

You can control objects such as a Type behavior by setting it's Options in the configuration file.

```json
Types: [
  {
    "Name": "products",
    "Type": "BizDoc.Configuration.Types.SqlDataSource",
    "Options":{
      "ConnectionString": "<connection name here>",
      "CommandText": "SELECT Id, Name FROM Products"
    }
  }
]
```

The code above queries a database for products.

Or, you can manage the values within the configuration file.

```json
{
  "Types":[{
    "Type": "BizDoc.Configuration.Types.ConfigurationDataSource",
    "Name": "types",
    "Options": {
      "Items": {
          "Type1": "Type 1",
          "Type2": "Type 2"
      }
    }
  }]
}
```

### Report

A report component has a data model, a backing class and an arguments class.

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
        Price = l.Price,
        ...
      }).ToListAsync();
}
```

A report object may have an Angular component handling it, in which case, the component should implement the IReportComponent\<T\>. You can also customize the arguments by implementing IArgumentComponent\<T\> and annotating the arguments model with the Template attribute.

```typescript
import {ReportComponent, BizDoc, ReportRef} from 'bizdoc.core';

@Component({...})
@BizDoc({ selector: 'my-report' })
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
> Use Display and DataType attributes to control layouting.

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

A cube represents a cross-data summary, which can be visualized as a chart or a pivot.

A cube declares _Axes_. Each axis maps to a _Type_ holding the axis possible values.
You can use one of the built-in types or declare new ones. For example, you can add a type that pulls accounts from a 3rd party app.

You may choose to use the _BizDoc.Segments_ database table for this purpose. In which case, the built-in _Segments_ type can be set in the configuration file for each segment in the Types section.

```json
{
  "Types":[{
    "Type": "BizDoc.Configuration.Types.Segments",
    "Name": "accounts",
    "Options": {
      "SegmentId": "account"
    }
  }]
}
```

You map a cube to form data model by annotating the _CubeMapping_ attribute as explained above in the *Form* section.

#### Backing object

Create a class that drives from CubeBase.

```c#
public class MyCube : CubeBase
{
}
```

Override base methods, such as the CanView() method, to control aspects of the cube.

#### Configuring

A cube uses _views_ to show a cut of the data. A view typically has X-Axis and Series.

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

A cube may have one or more _Index_. An index represents a linear data such as budgeted values or target performance.
Patterns are maintained either by editing the file or using an administrative utility.

> Open _bizdoc.json_ and find Cubes section. Add, modify and reorder axes and views of your cube.

#### Explore data

You can extend the default drill down capabilities by implementing a custom dill down, into 3rd party app.

First, implement the CubeBase.IExplore&lt;T&gt; QueryAsync(). Then override the GetExploreType() method and return the relevant type for the requested axes.

```c#
public class MyCube : CubeBase, CubeBase.IExplore<PO> {
  private const byte BALANCE_AXIS_POSITION = 4;
  public override async Task<IEnumerable<PO>> QueryAsync(params Axis[] axes) {
    ...
  }
  public override GetExploreType(params string[] axes) {
      if (axes.ElementAt(BALANCE_AXIS_POSITION).Equals(Balance.PO.ToString())
        return typeof(PO);
      return base.GetExploreType();
  }
}
```

> The implementation of the QueryAsync should handle different Axis types, such as range and patterns.

#### Querying

Use the `CubeService` to preform queries on cubes and indices. It maintains clear syntax and avoid SQL phrasing in your project.

```c#
public class MyForm : FormBase<MyFormModel> {
    private readonly CubeService _cubeService;
    public MyForm(ICubeService CubeService) {
        _CubeService = CubeService;
    }

    public override async Task FlowStartAsync(MyFormModel model) {
      var usage = await _cubeService.GetUsage("myCube", 2020, Axis.FromArray(1, 2), default /* skip months axis */, Balance.Opend);
      ...
    }
}
```

The above retrieves the usage for myCube, year 2020 1st-2nd quarters of all Opened balance.

The _Axis_ struct can be utilized to specify range, collection, pattern or combination of them. Patterns support **\*** and **.** characters.

#### Define cube anomaly

By default, anomaly is calculated as the value of all cube records that map to the document *entries* deducted from all of the cube *indices*, where axis marked as *sensitive* are included.

If you wish to refine how anomaly is calculated, override the cube CalculateAnomalyAsync() method. A negative value is considered an anomaly.

```c#
public class MyCube : CubeBase
{
  public override Task<decimal> CalculateAnomalyAsync(params Axis[] axes)
  {
    ...
  }
}
```

#### Database

Cubes are stored in database _BizDoc.Cube_ and _BizDoc.Indices_ tables, where _BizDoc.Cube_ reflect document data stored in _BizDoc.Entries_ table.

> As these tables graw significantly large, consider adding indexes on the axes your code access.

The tables _BizDoc.Combinations_ and _BizDoc.Segments_ are used for default implementation for account segments.

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

### Rule

A _rule_ declares a programmatic value. For example, the _anomaly_ rule returns the cube anomaly for the document being processed. Rules can then be evaluated in a workflow *condition* or object *privileges*.

A rule inherits from RuleBase.

```c#
public class ValueRule : RuleBase<decimal?>
{
    private readonly IDocumentContext _documentContext;
    public ValueRule(IDocumentContext documentContext) => _documentContext = documentContext;

    public override decimal? GetValue() => _documentContext.Document.Value;
}
```

In configuration file.

```json
{
  "Type": "BizDoc.Configuration.Reports.CubeUsage",
  "Name": "usage",
  "Privileges": {
    "Rule": "devEnvOnly",
    "Roles": ["System"]
  }
}
```

## How To

### Enable version compare

BizDoc logs changes made to document model during workflow. Changes can then be viewed from trace. To enable the form to show a colorful version compare, use the `bizdocCompareGroup`, `bizdocCompareContext` and `bizdocCompareName` directives.

```html
<ng-container [ngSwitch]="mode">
  <div *ngSwitchCase='"version"'>
    <span bizdocCompareName="from,to">{{data.model.from}} - {{data.model.to}}</span>
    <table bizdocCompareGroup="lines">
      <tr *ngFor='let line of data.model.lines' [bizdocCompareContext]='line'>
        <td bizdocCompareName="product">{{line.product}}</td>
      </tr>
    </table>
  </div>
</ng-container>
```

You can access version data programmatically from the onBind() function.

```typescript
onBind(data: MailModel<MyFormModel>, version?: MyFormModel): void {
    if(version && version.subject !== data.model.subject) {
      ...
    }
}
```

### Formatting delivered emails

Format delivered emails to include custom form information using XSLT.

To change the default XSLT, create a new XSLT file,
in file properties, choose 'Copy Always'.

Edit your file:

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

> Study the schama to learn about the structure of the XML representing document data.
> Some limitations apply to data models to allow them to be serialized as XML. Annotate your model with _XmlIgnore_, _XmlAttribute_, _XmlArray_ and _XmlArrayItem_ to control the XML structure.

In startup.cs services.AddBizDoc(), set BodyTemplate to your xslt file path.

You can pass data to CustomData node by overriding the GetCustomData() method on your form object.

### Provide a custom Identity Manager

Create new class in your project and make it implement _BizDoc.Core.Identity.IIdentityManager_ and _BizDoc.Core.Identity.ISignInProvider_.
Register each of them separately in _startup.cs_ as scoped service for the respective interface, prior to calling AddBizDoc().

### Customize built-in objects

BizDoc comes with several built-in objects. You can extend these objects behavior by creating an  object that inherits from the built-in object.

```c#
public class MyDepartmentsCompare: DepartmentsCompareBase {
  private readonly IIdentityContext _identityContext;
  protected override async Task<string[]> GetUsersAsync(string groupId) => ... // provide list of identities
}
```

In BizDoc configuration file, disable the built-in object, and set the Type of the new object to your implementation.

```json
Widgets: [{
  "Type": "BizDoc.Configuration.Widgets.DepartmentsCompare",
  "Disabled": true,
  "Name": "_departmentsCompare"
},
{
  "Type": "MyProject.MyDepartmentsCompare, MyProject, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
  "Name": "myDepartmentsCompare"
}]
```

BizDoc built-in objects can be found under the following namespaces:
BizDoc.Workflow.Activities,
BizDoc.Workflow.Actions,
BizDoc.Configuration.Types,
BizDoc.Configuration.Rules,
BizDoc.Configuration.Reports and
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
}
```

In Angular app.module:

```typescript
TranslationService.Set('es', {myField: 'My Field {0}'});
```

Consume using translation _pipe_, which accepts parameters.

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
Forms:[{
  "Rules": {
    "myField": {
      "Roles": [
        "role1"
      ]
    }
  },
  "Name": "myForm"
}]
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

In your object constructor, consume _IProfileManager_ and use Get() and Set() method to retrieve and persist your settings.

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

## Database

BizDoc databse schema is _BizDoc_ schema.

_Documents_ _Recipients_

## References

BizDoc rely on [Hanfire](https://docs.hangfire.io/) for background tasking. You can add your long-running or period tasks using it's infrastructure. Administrative access available through /hangfire url.

BizDoc uses [Syncfusion](https://www.syncfusion.com/angular-ui-components) for charting. If you wish to add your own charts, consider using this library. Licensing required.

If you use the currency exchange rate job, register at <http://data.fixer.io>.

Issus can be submitted [here](https://github.com/moding-il/bizdoc.core/issues).

> Product updates are released pariodically as npm and Nuget packages.
