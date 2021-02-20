# bizdoc.core

BizDoc is a framework for developing form-flow solusion. It includes a workflow engine, a mailbox -like user interface, and set of built-in components for data analysis.

## Setting up

BizDoc is built as a .Net Core web application, running Angular 11. To author a new BizDoc environment, create a new project from _BizDoc_ template.

### Prerequisites

[Visual Studio](https://visualstudio.microsoft.com/vs/) or Visual Code, [.Net 5.0](https://dotnet.microsoft.com/download/dotnet/5.0),
Latest [Node.js](https://nodejs.org/), [Angular CLI](https://cli.angular.io/)
and [EF Core](https://docs.microsoft.com/en-us/ef/core/get-started/install/).

### Installing

To install BizDoc, open Visual Studio and choose *Extensions* menu, *Manage Extensions*. Select *Online* and search for [BizDoc Core](https://marketplace.visualstudio.com/items?itemName=Moding.BizDoc-Core).

Install the package and restart Visual Studio.

Create a new project and choose *BizDoc* as the template.

Update BizDoc Nuget package from Package Manager Console:

> Update-Package [bizdoc.core](https://www.nuget.org/packages/BizDoc.Core/)

Update npm package from PowerShell command-line:

> npm i [bizdoc.core@latest](https://www.npmjs.com/package/bizdoc.core)

Create a database of your choice and set it's _connectionString_ in appsettings.json.
To manually create database objects, run from command-line:

> dotnet ef database update -context BizDoc.Core.Data.Store

## Architecture

BizDoc can be broken into two major parts: a. backend server objects, responsible for the business logic. b. front-end user interface, built as Angular components.
Commonly, a front-end component has a backing server object. For example, BizDoc *form* object will have a backend class that manages its lifetime events, and a corresponding front-end Angular component. Communication between the front-end and the backend is done through BizDoc APIs.

BizDoc manages to following objects:

* Form - Application details.
* Report - Retreive and present data.
* Widget - Dashboard item.
* Utility - An administrative procedure.
* Type - Data source for list of values.
* Cube - Index to form's data.
* FlowAction - Workflow user option.
* FlowNode - Workflow item.
* Rule - Server-side JS expression.

In addition to the managed objects above, BizDoc facilitates unmanaged objects which doesn't have a backend object but rather only configuration:

* Folders - Set columns.
* States - Document statuses.
* Roles - Job description in the organization.
* Guides - User guide.
* Currencies - Facilitating exchange rate.

BizDoc configure its objects in bizdoc.json file. Upon run, Objects found in any of your project assembly are registered in the configuration file.

> Open bizdoc.json and review your app configuration. This file is updated by BizDoc, by administrative utilities, or - can be edited manually.

If a BizDoc object has a front-end Angular component, the two is coupled by annotating the back-end class with the \[Template()\] attribute, and decorating the Angular component with the @BizDoc() attribute with a matching value.

BizDoc objects accepts .Net Core services using Dependency Injection (DI). In addition to .Net services, BizDoc provides built-in services for accessing its functionality.

BizDoc maintains _Roles_. A _role_ is declared per _type_ and assigned _positions_ to type keys. In addition to type keys, role can be assigned positions per *pattern* and *group*.

BizDoc database can be one of SqlServer, MySQl or Oracle. The BizDoc database objects are created under the \[BizDoc\] schema.
Commonly, developer create his/her own database context to access custom database objects. Refer to .Net Core [EF](https://docs.microsoft.com/en-us/ef/core/get-started/index) on how to create and maintain Entity Framework context.

BizDoc user interface is aligned with Material Design guidelines from the [Angular Material](https://material.angular.io/) library.

## Configuration

BizDoc server-side behavior is set in _startup.cs_. You first register BizDoc services using AddBizDoc(), and then consume it using UseBizDoc().

BizDoc configuration at this point includes licensing, SMTP and more.

Setup database provider by installing the relevant Nuget, from either [SqlServer](https://www.nuget.org/packages/BizDoc.Core.SqlServer/), [Oracle](https://www.nuget.org/packages/BizDoc.Core.Oracle/) or [MySql](https://www.nuget.org/packages/BizDoc.Core.MySql/).

```c#
    services.AddBizDoc().
      UseSqlServer(connectionString);

```

Set up authentication from one of: [AspNetIdentity](https://www.nuget.org/packages/BizDoc.Core.AspIdentity) for managing users in database, [DirectoryServices](https://www.nuget.org/packages/BizDoc.Core.DirectoryServices) which uses Microsoft Active Directory, [Office365](https://www.nuget.org/packages/BizDoc.Core.Office) or [Okta](https://www.nuget.org/packages/BizDoc.Core.Okta).
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

> If the available default identity managers donen't answer your organization needs, you can implement your own identity manager. See below how to create a [Custom Identity Manager](#custom).

BizDoc offers additional services:

* AddEscalate() - Escalate unattended documents
* AddSummaryMail() - Send @ of pending documents, notifications and chat summary
* AddMailExecute() - Analyze @ and forward document workflow. Three posible configurations: IMAP, POP3 and Exchange. Exchange require an additional reference to [Exchange](https://www.nuget.org/packages/BizDoc.Core.Exchange/).
* AddExchangeRate() - Update currency exchange rate
* AddSwagger() - Support Swagger

You can set BizDoc client app behavior by updating the BizDocModule.forRoot() in your _app.module.ts_ file.

```typescript
  imports: [BizDocModule.forRoot({
    currencyCode: 'EUR'
    ...
  })]
```

## Objects

An object is a unit of code that implements one of BizDoc base classes. Base classes can be found in BizDoc.Configuration namespace.

### Dependency Injection

BizDoc objects support Dependency Injection. Object may consume services added in your startup.cs or one of BizDoc services.

```c#
public class MyForm : FormBase<MyFormModel> {
    private readonly IWorkflowInstance _workflowInstance;
    public MyForm(IWorkflowInstance workflowInstance) {
        _workflowInstance = workflowInstance;
    }
}
````

The above code uses the `IWorkflowInstance` service to access the currently running workflow.

BizDoc provides the following services:

| Name |Usage | Namespace
| --- | --- | ---
| IHttpContext | Current user identity and geo position | BizDoc.Core.Http
| Store | DbContext to BizDoc database | BizDoc.Core.Data
| DocumentFactory | Create, update and delete document | BizDoc.Core.Data
| IDocumentContext | Currently handled document | BizDoc.Core.Data
| IWorkflowInstance | Start and resume document workflow | BizDoc.Core.Workflow
| IWorkflowContext | Currently running workflow context | BizDoc.Core.Workflow
| SourceService | Retreive data source (Type object values) | BizDoc.Core.Data
| CubeService | Query cube and currencies | BizDoc.Core.Data
| IProfileManager | Access user profile | BizDoc.Core.Identity
| IIdentityManager | Retreive user information | BizDoc.Core.Identity
| IEmailer | Deliver @ | BizDoc.Core.Messaging
| ISmser | Send SMS | BizDoc.Core.Messaging
| NotificationManager | Send notifiction to a user | BizDoc.Core.Messaging
| IOptions\<SystemOptions\> | Access configuration | BizDoc.Core.Configuration.Models
| ScheduledTasks | Enqueue delayed execution | BizDoc.Core.Tasks

> Note that `IDocumentContext` and `IWorkflowInstance` are only available within BizDoc objects and not in other classes, such as Controllers.

#### Angular DI

In an Angular app, you can access BizDoc infrastructure by injecting BizDoc services.

Services include:

| Name | Usage
--- | ---
| SessionService | Session info, including logged user and configuration
| CubeService | Query cube
| DataSourceService | Retrieve _Type_ values
| AccountService |  Get user(s) info
| TranslationService | Add and read internationalization resources, used in conjection with _translate_ pipe
| GuideService | Start a step-by-step tour guide
| MailboxService | Mail related functions
| CubeInfo | Open visual cube
| MapInfo | Open visual map
| DocumentInfo | Preview a document
| AttachmentInfo | Preview an attachment

```typescript
class MyClass {
  constructor(private _cube: CubeInfo) {
  }
  open() {
    this._cube.open({
      company: 201
    }, {
     xAxis: 'month',
     serie: 'balance'
    })
  }
}
```

The above example uses `CubeInfo` to show a matrix of cube axes with company 201 from your code.

> Using the `MapInfo` requires you configure the _maps_ in BizDocModule.forRoot({maps: {apiKey: ...}}), in your app.module.ts file.

### Forms

A _form_ object consists of three parts:

* A data model, representing form properties,
* A backing class, derived from FormBase, responsible for managing form lifetime events,
* And an Angular component, displaying form data and responding to user interaction.

#### Declare data model

```c#
public class MyFormModel {
  public string Subject { get; set; }
  public DateTime? Due { get; set; }
  ...
}
```

You may annotate your model with attributes to instruct BizDoc how to handle it. Attributes include: Subject, Summary, Value, Currency, ExchageRate, Required, Hint and ListType. In addition, model may be annotated with .Net attributes such as DataType, MaxLength and Display.

For examle, to use the model *Purpose* property as the document title, annotate it with the `Subject` attribute.

```c#  
using BizDoc.ComponentModel.Annotations;

public class MyFormModel {
  [Subject]
  public string Purpose { get; set; }
  ...
  public IList<MyFormModelLine> Lines { get; set; }
}
```

#### Declare baking object

Create a class that derived from FormBase\<T\>.
Override base to respond to form events.

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

The above class uses the `Form` attribute to instruct BizDoc to set a title to form when registering it in the configuration file. Tille an other properties can later be applied by editiong the bizdoc.json configuration file.
For example, you can assign an icon from any of the [Material Icons](https://material.io/tools/icons).

##### Mapping database tables

If you wish to store form data as database tables, in addition to the internal BizDoc representation, annotate the class with `Table` attribute.

Assign the `DocumentId` attribute to instruct BizDoc to set its value from the document identity, and the `Line` attribute to set am ordinal of a sub-model collections.

```c#
[Table("MyTableLine")]
public class MyFormLine {
  [DocumentId]
  public int FormId { get; set; }
  [Line]
  public short Line { get; set; }
  ...
}
```

> Use NotMapped attribute on properties you do not wish to store.

##### Mapping a cube

Map a form model to a cube by annotating your data model class with the `CubeMapping` attribute.
This creates an index from the properties, which can later be accesed from various reports and widgets.

```c#
[CubeMapping(nameof(Amount), nameof(Year), nameof(Quarter), nameof(Month), nameof(Balance))]
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
  public decimal Amount { get; set; }
}
```

The `StateAxisResolver` above finds the Balance in the configuration file that matches the document _state_. Set the *Axis* attribute in the state *Options*.  

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

> Mapping should match the ordinal of the _Axes_ declared in the configuration file.

##### Mapping scheduled tasks

Schedule an event using model properties. This allows displaying documents on a calendar.

```c#
[ScheduleMapping(nameof(EventDate))]
public class Line {
  public DateTime EventDate {get; set;}
}
```

#### Designing the User Interface

A BizDoc form front-end is an Angular component.

To create an Angular component run the following from command-line in ./ClientApp folder:

> ng g c myForm

Open ./app/src/my-Form/my-form.component.ts and replace the content of the file with the following:

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
  readonly form = this.fb.group({
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

The above code declares an interface that matches the data model on the server-side, with the same Subject property.The interface is then placed in the component implementation of the FormComponent\<T\> interface.

> Note the the client-side model property names use camel casing, and subject maps to servder-side Subject.

Access form data from the onBind function. Store model in private property or assign it to FormGroup using patchValue() function.

Open my-form.component.html and replace the content of the file with the following:

```html
<form [formGroup]="form" autocomplete="off">
  <mat-form-field>
    <input matInput placeholder="Subject" required formControlName="subject" />
  </mat-form-field>
</form>
```

The formGroup maps the the form declared in the .ts file, while the input maps the the subject form control.

See Angular [reactive forms](https://angular.io/guide/reactive-forms) on how to handle forms and validations.

You can embed BizDoc components in your form. Components include `Select`, `Autocomplete`, `CombinationPicker`, `CombinationPool`, `TimePicker` and `AddressInput`.

```html
<mat-form-field>
  <bizdoc-select type="users" placeholder="My property"></bizdoc-select>
</mat-form-field>
```

In the above example, the *type* attribute matches a predefined object declared in the configuration file Types.

The `CombinationPicker` and `CombinationPool` tags allows the user to pick _combinations_ of _segments_. An axis is considered a segment if its *Combination* attribute is set to true in the configuration file.

```html
<mat-form-field>
  <bizdoc-combination-picker placeholder="My property"
  (optionSelected)='accountPicked($event)'></bizdoc-combination-picker>
</mat-form-field>
```

By default, combinations are stored in _BizDoc.Combinations_ table. You can override CombinationsAsync() method of the cube backend object to populate combinations from a different source.

The `CombinationPool` tag allows the user to pick _combinations_ of _segments_ by projection *constraints*, set in the configuration file.

```html
  <bizdoc-combination-pool [formGroup]="form"><bizdoc-combination-pool>
```

```json
Cubes: [{
  "Name": "myCube",
  "Constraints": [
    {
      "Condition": {
        "compnay": "company1"
      },
      "Projection": {
        "region": ["100-200"]
      }
    }
  ]
}]
```

_Conditions_ and _Projections_ receive *axis expression*, and can represent a range, an array or a mask.

#### Supporting view modes

A form may be visible for editing, previewing or version compare. Template can handle different modes using a NgSwitch:

```html
<ng-container [ngSwitch]="mode">
  <div *ngSwitchCase='"compose"'>
    <!-- editing mode -->
  </div>
  <div *ngSwitchDefault>
    <!-- preview and version mode -->
  </div>
</ng-container>
```

Commonly, in addition to form data, preview mode display document trace or flow diagram, passing the data received in the onBind() function.

```html
<bizdoc-trace [model]=data></bizdoc-trace>
...
<bizdoc-flow [model]=data></bizdoc-trace>
```

#### Mapping Server object To Angular Component

The _Template_ annotation on the server-side object maps to the Angular component using the Template attribute.

```c#  
using BizDoc.ComponentModel.Annotations;

[Template("app-my-form")]
public class MyFormModel {
  ...
  public IList<MyFormModelLine> Lines { get; set; }
}
```

The corresponding Angular component will use the _@BizDoc_ decorator, passing the same value *app-my-form*.

```typescript
import { FormComponent, MailModel, ViewMode, BizDoc } from 'bizdoc.core';

@BizDoc({
  selector: 'app-my-form'
})
export class MyFormComponent implements FormComponent<MyFormModel> {
  ...
}
```

### Types

A _type_ represents a source of key-value pairs.
For example, the type Account can retrieve accounts from your database.

```c#
[Table("Accounts")]
public class Account
{
    public string Id { get; set; }
    public string Name { get; set; }
}
/// <summary>
/// Accounts data source
/// <summary>
public class Accounts : TypeBase<string>
{
    private readonly CustomStore _store;

    public Accounts(CustomStore customStore) => _store = customStore;

    public override Task<Dictionary<string, string>> GetValuesAsync(Void args) =>
        _store.Accounts.ToDictionaryAsync(a => a.Id, a => a.Name);
}
```

Type can be linked to a form model property by setting its ListType attribute.

```c#
[ListType(typeof(Accounts))]
public string AccountId {get; set }
```

#### Built-In Types

BizDoc has several built-in types, including Years, Quarters, Months and Users. See BizDoc.Configuration.Types namespace for the complete list.

You can control Type object behavior by setting its Options in the configuration file.

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

Alternatively, you can manage the values within the configuration file.

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

Another built-in type is Segments, which retrive values from the _BizDoc.Segments_ datablase table, accepting SegmentId as an option.

```json
{
  "Types":[{
    "Type": "BizDoc.Configuration.Types.Segments",
    "Name": "segment1",
    "Options": {
      "SegmentId": "segment1"
    }
  }]
}
```

> You can make your own object configurable by adding public properties to it, and setting the properties from the configuration Option.

### Reports

A _report_ component consists of a data model, a backing class, and an arguments class.

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

The above PopulateAsync method accepts MyReportArgsModel and returns a dictionary of MyReportDataModel retrieved from database.

A report object may have an Angular component presenting it. In which case, the component should implement the IReportComponent\<T\>.

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

The ReportRef above enables the report to access executing context, such as progress report events of the server-side.

If no Angular component is registered for the report, BizDoc treats the model properties as columns and the arguments as fields.

> Use Display and DataType attributes to control layouting.

You can also customize the arguments pane by implementing IArgumentComponent\<T\> and annotating the arguments model with the Template attribute.

Use the buit-in pipes to display value of a key. Pipes include `StateNamePipe`, `ActionNamePipe`, `UserNamePipe`, `FormNamePipe`, `RoleNamePipe`, and `TypeValuePipe`.

#### Customizing built-in Reports

BizDoc built-in reports can be customized by setting the Options of it in the configuration.

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

To find out which reports accepts which options, use the Object Browser to view its declration.

### Cube

A _cube_ is the mechanizm for indexing forms data. Data can then be visualized in using cube _views_ or one of the built-in reports and widgets.

#### Axes

A cube declares columns called _Axes_. Each axis maps to a _Type_ representing axis values.

You can use one of the built-in types or declare new axis. For example, you can add a type that pulls accounts from a 3rd party app.

Alternatively, you can choose to use the _BizDoc.Segments_ database table to store values. In which case, a built-in _Segments_ type can be set in the configuration file:

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

You map a cube to form data model by annotating the _CubeMapping_ attribute as explained above in the [Form](#mapping-a-cube) section.

#### Backing Cube Object

Create a class and inherit from CubeBase.

```c#
public class MyCube : CubeBase
{
}
```

Override base methods, such as the CanView() method, to control aspects of cube behaviors.

#### Configuring

A cube uses _views_ to show a segment of its data. A view typically has an X axis and series, and can present data as either chart, grid or pivot.

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

An _index_ represents a linear data such as budgeted values or target performance. Index data are stored in _BizDoc.Indices_ table.

> Open bizdoc.json and find Cubes section. Add, modify and reorder axes and views.

#### Understanding Patterns

A cube may have _patterns_, which represents a set of axes values which are assigned permissions to one or more user roles and _rules_.
Use patterns to restrict access to cube data. Axes can be assigned a range, an array or a mask.

For example, to restrict view to years 20` for companies 201 and 202 and regions 11 through 99 to system role, add the following configuration:

```json
    "Patterns": [
      {
        "Axes": {
          "year": "20*",
          "company": [201, 202],
          "region": "11-99"
        },
        "Roles": [
          "System"
        ],
        "Name": "y2",
        "Title": "20`"
      }
    ]
```

Mask value accepts a dot (.) for a single character, asterisk (*) for more than one character and hashtag (#) for replacing an individual character with a character at the same position in the base account.
Hashtags patterns enable drilling up from a base code.

In addition to roles, a pattern can be set a _rule_ expression. See [Rules](#rules) section on how to add an expression.

The built-in CubePatternUsage report use patterns to selectivly show data relevant to the user.

You can test if the user has privileges to a cirtain set of axes using the Authorize() method of the CubeService service.

By default, the CanView() method of the cube uses patterns to restrict access to cube data.

Patterns can be modified using a designated administration utility or, by manually editing the configuration file.

#### Explore data

If you use the cube to store 3rd party app data, such as POs from ERP, you can provide drill down to the 3rd party app by implementing the IBrowsable.

First, override the GetExploreType() method and return the relevant type for the requested axes. Then, implement the CubeBase.IBrowsable&lt;T&gt; QueryAsync() to populate 3rd party data.

```c#
public class MyCube : CubeBase, CubeBase.IBrowsable<PO> {
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

> The implementation of the QueryAsync should be able to handle different Axis values, including range, arrays and patterns. Use the CubeService.FormatAxisPhrase() method.

#### Querying

Use the `CubeService` to preform queries on _cubes_, _indices_ and currencies.

```c#
public class MyForm : FormBase<MyFormModel> {
  private readonly CubeService _cubeService;
  public MyForm(ICubeService CubeService) {
      _CubeService = CubeService;
  }

  public override async Task FlowStartAsync(MyFormModel model) {
    var usage = await _cubeService.GetUsage("myCube",
      2020 /* year axis */,
      Axis.FromArray(1, 2) /* month axis */,
      default /* skip months axis */,
      Balance.Opend);
      ...
  }
}
```

The above retrieves the usage for myCube, year 2020 1st through 2nd quarters of all Opened balance.

The _Axis_ struct can be utilized to specify a range, an array, a mask or - combination of them. Use Join() method to concat several conditions as one.

To show cube from your Angular app client code, use `CubeService`. See [Angular DI](#angular-di) example.

#### Define cube anomaly

By default, anomaly is calculated as the value of all cube records that map to the document *entries* deducted from all cube *indices*.
Only axes marked *sensitive* are inspected.

If you wish to refine how anomaly is calculated, override the cube CalculateAnomalyAsync() method. A negative value is considered an anomaly, whereas a positive or zero  indicates no anomaly.

```c#
public class MyCube : CubeBase
{
  public override Task<decimal> CalculateAnomalyAsync(params Axis[] axes)
  {
    ...
  }
}
```

### Widgets

A _widget_ represents a component displayed in user dashboard, commonly showing relevant data summary.
Widgets have a backing object and an Angular component responding to it.

The backing object derived from WidgetBase.

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

And an Angular component imlementing WidgetComponent\<T\>.
Liek other components, widget Angular component needs to have a _BizDoc_ annotation matching the backing object template.

```typescript
import { WidgetComponent, BizDoc } from 'bizdoc.core';

@Component({
  selector: 'app-my-widget',
  templateUrl: './my-widget.widget.html',
})
@BizDoc({
  selector: 'app-my-widget'
})
export class MyWidget implements WidgetComponent<DataModel[]> {
  onBind(data: DataModel[]) {
    ...
  }
}
interface DataModel {
    ...
}
```

The onBind() function receives data from the GetAsync() method of the server-side object.

> Widgets, as other objects, accepts *options* that can determine their behavior, refer to BizDoc.Configuration.Widgets namespace to inspect core widget properties.

Core widgets can be overridden, and more than one widget with the same Angular template can be configured in the configuration file. See [how to](#customizing-built-in-objects) example.

### Rules

A _rule_ declares a programmatic value. For example, the Anomaly rule returns the cube anomaly for the currently processed document.
Rules can then be evaluated in scenarios like a workflow If condition or object _privileges_.

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

BizDoc logs changes made to document model during workflow. Changes can then be viewed from trace.
To enable the form to show version compare, use the `bizdocCompareGroup`, `bizdocCompareContext` and `bizdocCompareName` directives.

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

You can also access version data programmatically from the onBind() function.

```typescript
onBind(data: MailModel<MyFormModel>, version?: MyFormModel): void {
    if(version && version.subject !== data.model.subject) {
      ...
    }
}
```

### Enable navigation in forms

You can communicate with the form container by injecting _FormRef_.

```typescript
export class MyFormComponent implements FormComponent<MyModel> {
  constructor(@Optional() @Inject(FormRef) private _formRef: FormRef) {
    this._formRef.navigating().subscribe(page => {
      ...
    });
  }
  page() {
    this._formRef.navigate('page1');
  }
}
```

This code pattern is recommended if your form opens a line portal, and the user should be able to navigate back to the form header.

### Providing a user guide

BizDoc can present the user a guide on how to fill a form or how to use a report.

_Guides_ are maintained in bizdoc.json configuration, and can be assigned to either form or report.

```json
"Guides": [
  {
    "Name": "myPurchaseGuide",
    "Title": "Purchase",
    "Steps": [
      {
        "Content": "Purchase form help!"
      },
      {
        "Selector": "[data-help=type]",
        "Content": "Type help!",
        "Position": "End"
      }
    ]
  }
]
```

You can set a guide to any of report, utility, widget or cube view in the configuration file.

```json
"Forms": [
  {
    "Name": "purchase",
    "Title": "Purchase",
    "Guide": "myPurchaseGuide"
  }
]
```

You can also set a guide in Angular code, using the injectable `FormRef`. For instance, if a form provides dfferent guide for line view and header view, or a guide to user in preview mode or edit mode.

### Format delivered emails

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

### Customizing built-in objects

BizDoc has several built-in objects, such as widgets and reports.
You can choose to change an object behavior by creating your own object and overrding its behaviour.

```c#
public class MyDepartmentsCompare: DepartmentsCompareBase {
  private readonly IIdentityContext _identityContext;
  protected override async Task<string[]> GetUsersAsync(string groupId) => ... // provide list of identities
}
```

In BizDoc configuration file, set the Type of your object to the new object with your implementation.

```json
Widgets: [{
  "Type": "MyProject.MyDepartmentsCompare, MyProject, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null",
  "Name": "myDepartmentsCompare"
}]
```

BizDoc built-in objects can be found under the following namespaces:

* BizDoc.Workflow.Activities,
* BizDoc.Workflow.Actions,
* BizDoc.Configuration.Types,
* BizDoc.Configuration.Rules,
* BizDoc.Configuration.Reports and
* BizDoc.Configuration.Widgets.

### Support Internationalization

Server-side objects internationalization is achieved by setting the _ResourceType_ attribute to a .resx public file.

```json
"Folders": [
  {
    "Icon": "drafts",
    "Name": "df",
    "Title": "Drafts",
    "ResourceType": "BizDoc.Core.Resources.Strings"
  }]
```

In a custom object code:

```c#
[Form(Title = "MyForm", ResourceType = typeof(Properties.Resources))]
public class MyForm : FormBase<MyFormModel> {
}
```

The above Properties.Resources maps to the project level resources, found in project properties.

In Angular side, you can introduce string respurces using the `TranslationService`:

```typescript
TranslationService.Set('es', {
  myField: 'My Field {0}'
});
```

Consume the reource using the `translate` pipe:

```html
<div>{{'myField' | translate : '!'}}</div>
```

In the above code, translate pipe accepts ! as a parameter, replacing the {0} in the resource.

### Disable existing objects

From bizdoc.json configuration file, locate the object you wish to disable and add Disabled property.

```json
{
  "Disabled": true
}
```

### Set privileges to form fields and sections

BizDoc has an administrative utility for assigning _roles_ to _rules_. Rules are declared per form in bizdoc.config.

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

In your form component, test privileges by providing the permission name to either `bizdocDisabled` or `bizdocHidden` directive.

```html
<input bizdocDisabled="myField" />
...
<div bizdocHidden="myField"></div>
```

You can get programatic access to rules in runtime from the onBind() method of the form component.

```typescript
onBind(data: MailModel<MyFormModel>): void {
    if (!data.rules['myField']) {
      ...
    }
}
```

In addition to _roles_, a rule may reflect an _expression_, which evaluates to either true or false. See [rules](#Rules) above on how to endorse a new rule or use the existion ones.

### Store custom user settings

You can use BizDoc _IProfileManager_ service to store user specific settings.

In your object constructor, consume _IProfileManager_ and use Get() and Set() methods to retrieve and persist your settings.

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

### Add Guided Tour

Guides are declared in the configuration file. A guide may have one or more _step_, when each step can be mapped to UI element using css selector.

Guides can be linked to *form*, *report*, *widget*, cube *view* or *utility* by settings their Guide property to the guide name.

Guides can also be started using the Angular `GuideService`.

## Database

BizDoc databse tables are self-maintained under the _BizDoc_ schema.
You can access the database using the `Store` service. If you wish to access the _cube_, we recommand using the `CubeService` as explained in the [Cube](#querying) section.

Datanase tables:

| Table       | Usage |
----          | ---   |
| Documents | Document header and data model
| Recipients | Document recipients
| Events | Events of documents
| Locations |
| Comments | Comments of documents
| Entries | Cube Axes mapping of a document
| Log | Document log. May be one of _ActionTaken_, _Submit_, _Escalate_, _ModelChange_, _Downloaded_, or _StateChange_. Log models can be found in BizDoc.Core.Data.Models.Log namespace.
| Devices | (Internal, registry of user devices)
| Chats | Conversations (when applicable)
| Cube | Reflects document data from _Entries_ table and data from 3rd party app
| Indices | Indices for cube
| Segments | Account segments code names (default implementation)
| Combinations | Account segments combinations (default implementation)
| Sequences | (Internal, unique form sequence)

You can access a document data model using the Document GetModel\<TModel\>() method. This practice is not intended for large queries. Use TableMapping as explained above when dealing with a large datasets.

> As _Cube_ and _Indices_ tables grow significantly large, consider adding indexes to the axes you use.

If you add 3rd party information to _Cube_ table, use separate records than the ones BizDoc creates.

_Segments_ and _Combinations_ tables are used by Segments built-in type, `CombinationPicker` and `CombinationPool`. You may override cube CombinationsAync() method to retrieve combinations from a source of your choice.

## References

BizDoc rely on [Hanfire](https://docs.hangfire.io/) for background tasking. You can add your long-running or periodic tasks using this library. Administrative control available in /hangfire url on the app web server.

BizDoc uses [Syncfusion](https://www.syncfusion.com/angular-ui-components) for charting. If you wish to add charts to your custom components, we strongly recommand you consider using this library. Licensing required.

If you use the currency exchange rate job, register at <http://data.fixer.io> and set the appropriate options in startup.cs.

Issus can be submitted [here](https://github.com/moding-il/bizdoc.core/issues).

> Product updates are released through npm and Nuget packages. Kepp your project updated!
