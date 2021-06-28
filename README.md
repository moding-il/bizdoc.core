# bizdoc.core

BizDoc is a software developer framework for delivering form-flow solution. It includes a workflow engine, a mailbox -like user interface, and set of built-in components for data analysis.

## Setting up

BizDoc is built as a .Net web application, running Angular on the client side.
To author a new BizDoc environment, create a new project from _BizDoc_ template.

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

BizDoc will automatically create the database objects.

## Architecture

BizDoc can be broken into two major parts: backend server objects, responsible for the business logic, and front-end user interface, built as Angular components.
Commonly, a front-end component has a matching backing server object. For example, BizDoc *form* object will have a backend class that manages its lifetime events, while a corresponding front-end Angular component will take care of presenting form data to user and respond to form input.
Communication between the front-end and the backend is done through BizDoc APIs.

BizDoc manages to following objects:

* Form - Application details.
* Report - Retrieve and present data.
* Widget - Dashboard tile.
* Utility - Administrative procedure.
* Type - Data source of list of values.
* Cube - Index to form's data.
* FlowAction - Workflow possible user option.
* FlowNode - Workflow node.
* Rule - Server-side JavaScript expression.

In addition to the managed objects above, BizDoc facilitates server side objects which doesn't have a backend object:

* Folders - Trays of documents and possible display columns.
* States - Document statuses.
* Roles - Positions in the organization.
* Guides - Step-by-step user guides.
* Currencies - Exchange rate.

BizDoc configures both managed and none-managed server-side objects in bizdoc.json file.
Upon run, managed objects found in any of your project assembly or referenced assemblies are registered automatically.

> Open bizdoc.json and review your app's configuration.

The configuration file is updated either by BizDoc, by administrative utilities, or can be edited manually. When the configuration changes, a copy of the previous configuration is kept in the /backups directory.

If a BizDoc object has a front-end Angular component, the two is coupled by annotating the back-end class with the \[Template()\] attribute, and decorating the Angular component with the @BizDoc() attribute with a matching value.

BizDoc objects accepts .Net Core services using Dependency Injection (DI). BizDoc provides its own services to access its functionalities, as listed in the [services](#managed-objects) section.

BizDoc also maintains non managed objects such as _Roles_. A _role_ is declared per _type_ and assigned _positions_ per type _keys_. In addition to assigning roles to type keys, positions can be assigned to _patterns_, a regular expression, and to _groups_ of keys.

BizDoc maintains its data in a database. Available database providers are SqlServer, MySQl and Oracle. The BizDoc database objects are created under the \[BizDoc\] schema.
In addition to the core database, developer commonly create their own database context to access custom database objects.
Refer to .Net Core [EF](https://docs.microsoft.com/en-us/ef/core/get-started/index) on how to create and maintain Entity Framework context.

BizDoc web user interface is aligned with [Material Design](https://material.angular.io/) guidelines.

User interface is responsive, supporting mobile browsers. If you wish to develop a dedicate Mobile app, we offer libraries for Flutter, Kotlin and [Xamarin](https://www.nuget.org/packages/BizDoc.Core.Xamarin/).

## Configuration

BizDoc server-side behavior is set in startup.cs. You first register BizDoc services using AddBizDoc(), then consume it using UseBizDoc().

BizDoc configuration includes licensing, SMTP and more.

Setup database provider by installing the relevant Nuget, from either [SqlServer](https://www.nuget.org/packages/BizDoc.Core.SqlServer/), [Oracle](https://www.nuget.org/packages/BizDoc.Core.Oracle/) or [MySql](https://www.nuget.org/packages/BizDoc.Core.MySql/).

```csharp
    services.AddBizDoc().
      UseSqlServer(connectionString);

```

Set up authentication from one of: [AspNetIdentity](https://www.nuget.org/packages/BizDoc.Core.AspIdentity) for managing users in database, [DirectoryServices](https://www.nuget.org/packages/BizDoc.Core.DirectoryServices) which uses Microsoft Active Directory, [Office365](https://www.nuget.org/packages/BizDoc.Core.Office) or [Okta](https://www.nuget.org/packages/BizDoc.Core.Okta).
Install the relevant Nuget and add it to services in startup.cs.

```csharp
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

> If the available default identity managers doesn't answer your organization needs, you can implement your own identity manager. See below how to create a [Custom Identity Manager](#provide-a-custom-identity-manager).

BizDoc offers additional services:

* AddEscalate() - Escalate unattended documents.
* AddSummaryMail() - Send @ of pending documents, notifications and chat summary.
* AddMailExecute() - Analyze @ and forward document workflow. Service arrives in three configurations: IMAP, POP3 and Exchange. Exchange require an additional reference to [Exchange](https://www.nuget.org/packages/BizDoc.Core.Exchange/).
* AddExchangeRate() - Update currency exchange rates from the web.
* AddSwagger() - Support Swagger.

You can set BizDoc client app behavior using the BizDocModule.forRoot() function in app.module.ts file.

```typescript
  imports: [BizDocModule.forRoot({
    currencyCode: 'EUR'
    ...
  })]
```

Find product updates in [release notes](./release.md).

## Managed Objects

A managed object is a unit of code that implements one of BizDoc base classes. Base classes are found in BizDoc.Configuration namespace.

### Dependency Injection

A BizDoc object supports Dependency Injection. Object may consume services added in your startup.cs as well as BizDoc services.

```csharp
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
| SourceService | Retrieve data source (Type object values) | BizDoc.Core.Data
| CubeService | Query cube and currencies | BizDoc.Core.Data
| IProfileManager | Access user profile | BizDoc.Core.Identity
| IIdentityManager | Retrieve user information | BizDoc.Core.Identity
| IEmailer | Deliver @ | BizDoc.Core.Messaging
| ISmser | Send SMS | BizDoc.Core.Messaging
| NotificationManager | Send notification to a user | BizDoc.Core.Messaging
| IOptions\<SystemOptions\> | Access configuration | BizDoc.Core.Configuration.Models
| ScheduledTasks | Enqueue delayed execution | BizDoc.Core.Tasks

> Note `IDocumentContext`, `IWorkflowInstance` and `IWorkflowContext` are only available inside BizDoc context in managed objects.

#### Angular DI

In your Angular app, you can access BizDoc functionality by injecting BizDoc services.

Angular services include:

| Name | Usage
--- | ---
| SessionService | Logged user info and available configuration
| CubeService | Query cube
| DataSourceService | Retrieve managed _Type_ values
| AccountService |  Get users info
| TranslationService | Add and query internationalization resources, used in conjunction with the _translate_ pipe
| GuideService | Start a step-by-step guided tour
| MailboxService | Mail related operations
| CubeInfo | Open a cube matrix
| MapInfo | Open a map
| DocumentInfo | Preview a document
| AttachmentInfo | Preview an attachment
| ChatInfo | Chat
| Popup | Open a popup
| SlotsRouter | Navigate to a slot

```typescript
class MyClass {
  constructor(private _cube: CubeInfo) {
  }
  open() {
    this._cube.open({
      company: 201
    }, {
     xAxis: 'month',
     series: 'balance'
    })
  }
}
```

The above example uses `CubeInfo` to show a matrix of cube axes with company 201 showing balance per month.

Using the `MapInfo` requires configuring the _maps_ settings in BizDocModule.forRoot({maps: {apiKey: ...}}), in  app.module.ts file.

### Forms

A _form_ object consists of three parts:

* A data model, representing form properties,
* A backing class, derived from FormBase, responsible for managing form lifetime events,
* And an Angular component, displaying form data.

If you choose to develop a dedicated mobile app, you'll need to develop  the form again in the respective environment.

#### Declare a data model

```csharp
public class MyFormModel {
  public string Purpose { get; set; }
  public DateTime? Due { get; set; }
  ...
}
```

You may annotate your model with attributes to instruct BizDoc how to handle it.

Attributes include:

| Name | Usage
| -- | --
| Subject | Document title
| Summary | Extended document details
| Value | Document value for display
| Currency | Specify document display currency and sub model actual currency
| ExchangeRate | Set exchange rate from internal rates table
| Percentage | _Cube_ value calculate out of Value
| ListType | Bind property to _cube_ and _positions_

In addition to BizDoc behavior attributes above, model properties may be annotated with .Net attributes such as Required, DataType, MaxLength and Display.

For example, to use the model *Purpose* property as the document title, annotate it with the `Subject` attribute.

```csharp  
using BizDoc.ComponentModel.Annotations;

public class MyFormModel {
  [Subject]
  public string Purpose { get; set; }
  ...
}
```

Data model declare sub models, to implement more complex scenarios:

```csharp  
public class MyFormModel {
  ...
  public IList<MyFormModelLine> Lines { get; set; }
}
```

#### Declare baking object

Create a class that derived from FormBase\<T\>.
Override its methods to respond to form events.

```csharp
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

The above example uses the `Form` attribute to instruct BizDoc to set a title to form when registering it in bizdoc.json configuration file. Title an other properties can be later altered by editing the configuration file.

You may assign an icon to the form from [Material Icons](https://material.io/tools/icons).

##### Mapping database tables

BizDoc stores form's data internally. If you wish to store form data as database tables in addition to the internal representation for reporting purposes, annotate the class with `Table` attribute.

Assign the `DocumentId` attribute to instruct BizDoc to set its value from the document identity, and the `Line` attribute to set am ordinal to a sub model collections.

```csharp
[Table("MyTableLine")]
public class MyFormLine {
  [DocumentId]
  public int FormId { get; set; }
  [Line]
  public short Line { get; set; }
  ...
}
```

> Use `NotMapped` attribute on properties you wish to exclude.

##### Mapping a cube

Map form model to _cube_ by annotating your model class with `CubeMapping` attribute.
This creates an index from model properties, which can later be accessed from various reports and widgets.

```csharp
[CubeMapping(nameof(Year), nameof(Quarter), nameof(Month), nameof(Balance))]
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
  [Value, JsonIgnore]
  public decimal Total => Amount * Qty;
  public decimal Amount { get; set; }
  public decimal Qty { get; set; }
}
```

Axes mapped has to be a known model property - or parent model property.

The `Value` attribute directs BizDoc which property holds the cube value. You can also set the `Currency`, `ExchangeRate` and `Percentage` attributes.

The `StateAxisResolver` above finds the Balance in the configuration file that matches the document _state_. Set the *Axis* attribute of state *Options*:

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

> `CubeMapping` axes should match the ordinal of the _Axes_ declared in configuration file.

##### Mapping scheduled tasks

Schedule one or more events from model properties, allowing documents to be presented on a calendar.

```csharp
[ScheduleMapping(nameof(EventDate))]
public class Line {
  public DateTime EventDate {get; set;}
}
```

#### Designing the User Interface

A BizDoc form front-end is represented as an Angular component.

To create an Angular component, run the following from terminal in project ./ClientApp folder:

```bash
ng g c myForm
```

Open ./app/src/my-Form/my-form.component.ts and replace the content of the file with the following:

```typescript
import { FormComponent, RecipientModel, ViewMode, BizDoc } from 'bizdoc.core';

@Component({
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
  onBind(model: RecipientModel<MyFormModel>): void {
  }
}
interface MyFormModel {
    subject: string;
}
```

The above code declares *MyFormModel* interface matching the server-side data model, with Subject property using camel-casing. The interface is then given as a generic parameter to the FormComponent\<T\> interface.

> Note the the client-side model properties names use camel casing.

Access form data from the onBind() function.

Open my-form.component.html and replace the content of the file with the following:

```html
<form [formGroup]="form" autocomplete="off">
  <mat-form-field>
    <input matInput placeholder="Subject" required formControlName="subject" />
  </mat-form-field>
</form>
```

The formGroup attribute maps to the FormGroup declared in the .ts file, while the input tag maps to the *subject* form control.

See Angular [reactive forms](https://angular.io/guide/reactive-forms) on forms options and validations.

> Complex forms may separate behavior to more than one Angular component.

You can embed BizDoc components in your form. Components can be `Select`, `Autocomplete`, `CombinationPicker`, `CombinationPool`, `TimePicker` and `AddressInput`.

```html
<mat-form-field>
  <bizdoc-select type="users" placeholder="My property" formControlName="requesterId"></bizdoc-select>
</mat-form-field>
```

In the above example, the *type* attribute matches a predefined object declared in the configuration file _types_.

The `CombinationPicker` and `CombinationPool` tags allows the user to pick _combinations_ of _segments_.

```html
<mat-form-field>
  <bizdoc-combination-picker placeholder="My property"
  (optionSelected)='accountPicked($event)'></bizdoc-combination-picker>
</mat-form-field>
```

An axis is considered a segment if its Combination attribute is set to true.

By default, combinations are stored in BizDoc.Combinations database table. You can override CombinationsAsync() method of the cube backend object to populate combinations from a different source.

The `CombinationPool` tag allows the user to pick _combinations_ of _segments_ by _constraints_, set too in configuration file.

```html
  <bizdoc-combination-pool [formGroup]="form"><bizdoc-combination-pool>
```

```json
Cubes: [{
  "Name": "myCube",
  "Constraints": [
    {
      "Condition": {
        "company": "company1"
      },
      "Projection": {
        "region": ["100-200"]
      }
    }
  ]
}]
```

_Conditions_ and _projections_ accepts *axis expression*, presenting either a value, a range of values, an array of values or a mask. For explanation on axis options see [Understanding Patterns](#understanding-patterns).

#### Supporting view mode

A form may be visible in one of three ways: editing, previewing or version compare. Template may handle the different cases using an ngSwitch:

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

#### Mapping Server Object To Angular Component

The server-side object maps to the Angular component using the Template attribute.

```csharp  
using BizDoc.ComponentModel.Annotations;

[Template("app-my-form")]
public class MyFormModel {
  ...
}
```

The corresponding Angular component use the @BizDoc decorator, with the same value, here *app-my-form*.

```typescript
import { FormComponent, RecipientModel, ViewMode, BizDoc } from 'bizdoc.core';

@BizDoc({
  selector: 'app-my-form'
})
export class MyFormComponent implements FormComponent<MyFormModel> {
  ...
}
```

In addition, you'll need to register the component in your app.module.ts:

```typescript
  imports: [BizDocModule.forRoot({
    components: [MyFormComponent]
    ...
  })]
```

### Types

A _type_ represents a source of key-value pairs.
For example, an *Account* type may retrieve accounts from a database, and make their values available using a type.

```csharp
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

```csharp
[ListType(typeof(Accounts))]
public string AccountId {get; set }
```

#### Built-In Types

BizDoc has several built-in types, including Years, Quarters, Months and Users. See BizDoc.Configuration.Types namespace for the complete list of available types.

You control Type object behavior by setting its Options in the configuration file.

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

Alternatively, you may manage type values in the configuration file itself.

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

> You can make your own object configurable by adding public properties to it and setting default values to those properties in configuration Option.

### Reports

A _report_ component consists of a data model, a backing class, and an arguments class.

```csharp
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

The above PopulateAsync method accepts MyReportArgsModel and returns a list of MyReportDataModel retrieved from database.

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

The MyReportModel and MyReportArgs above maps to the server-side models.

The `ReportRef` enables the report to access executing context, such as subscribing to report progress events of the server-side.

If no Angular component is registered for the report, BizDoc treats the model properties as columns and the arguments as filters.

> Annotate model properties with Display and DataType attributes to control their layout.

You can also customize the arguments pane by implementing IArgumentComponent\<T\> and annotating the arguments model with the Template attribute.

Use one of the built-in pipes to display BizDoc keys as values. Pipes include `StateNamePipe`, `ActionNamePipe`, `UserNamePipe`, `FormNamePipe`, `RoleNamePipe`, and `TypeValuePipe`. UserName and TypeValue pipes are async.

#### Customizing built-in Reports

BizDoc has several built-in reports which can be customized by setting Options in the configuration.

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

> To find out which reports accepts which options, use the Object Browser to discover class properties.

### Cube

A _cube_ is a BI for indexing forms data. Data can then be visualized using cube _views_ or one of the built-in reports and widgets.

#### Axes

A cube declares columns as _axes_. Each axis maps to a _type_, representing possible values.

You map a cube to form data model by annotating the `CubeMapping` attribute as explained above in the [Form](#mapping-a-cube) section.

#### Backing Cube Object

Create a class that inherits from CubeBase.

```csharp
public class MyCube : CubeBase
{
}
```

Override base methods, such as CanView(), to control cube behavior.

#### Configuring

A cube uses _views_ to show a segment of its data. A view typically has an X axis and series, and can present data as either chart, grid, pivot or spreadsheet.

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

An _index_ represents a linear data such as budgeted values or target performance. Index data are stored in BizDoc.Indices database table.

As per document, cube database table is BizDoc.Entries.

> Open bizdoc.json and find Cubes section. Add, modify and reorder axes and views.

#### Understanding Patterns

A cube may declare _patterns_. Each _pattern_ represents a set of axes values which can be assigned permissions to one or more _user roles_ and _rules_.

Use patterns to restrict access to cube data.
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

Mask value accepts a dot (.) for a single character, asterisk (*) for more than one character and hashtag (#) for replacing an individual character with a character at the same position in a previously selected combination.
Hashtags patterns enable drilling up from a base combination.

In addition to roles, a pattern can be set a programmatic _rule_ expression. See [Rules](#rules) section on how to add an expression.

The built-in CubePatternUsage report uses patterns to selectively show data relevant to the user.

You can test if the user has privileges to a certain set of axes using the Authorize() method of the `CubeService` service.

By default, the cube CanView() method uses patterns to restrict access to cube data.

Patterns can be modified using the designated administration utility or by manually editing the configuration file.

#### Explore data

If you use the cube to store 3rd party app data, such as POs from ERP, you can provide drill down to the 3rd party app by implementing the IBrowsable interface.

First, override the ExploreType() method and return the relevant type for the requested axes. Then, implement the CubeBase.IBrowsable&lt;T&gt; QueryAsync() to populate 3rd party data.

```csharp
public class MyCube : CubeBase, CubeBase.IBrowsable<PO> {
  private const byte BalanceAxisPosition = 4;
  public override async Task<IEnumerable<PO>> QueryAsync(params Axis[] axes) {
    ...
  }
  public override ExploreType(params string[] axes) {
      if (axes.ElementAt(BalanceAxisPosition).Equals(Balance.PO.ToString())
        return typeof(PO);
      return base.ExploreType();
  }
}
```

> The implementation of the QueryAsync should be able to handle different Axis values, including range, arrays and patterns. Use the CubeService.FormatAxisPhrase() method to build an SQL phrase that supports these patterns.

#### Querying

Use the `CubeService` to preform queries on cubes, indices and currencies.

```csharp
public class MyForm : FormBase<MyFormModel> {
  private readonly CubeService _cubeService;
  public MyForm(ICubeService CubeService) {
      _CubeService = CubeService;
  }

  public override async Task FlowStartAsync(MyFormModel model) {
    var usage = await _cubeService.GetUsage("myCube",
      2020 /* year axis */,
      Axis.FromArray(1, 2) /* quarter axis */,
      default /* skip months axis */,
      Balance.Opened /* open only */);
      ...
  }
}
```

The above retrieves the usage for myCube, year 2020 1st through 2nd quarters of all Opened balance.

The Axis struct can be utilized to specify a range, an array, a mask or - combination of them using the static Join() method.

To show cube from your Angular app, use Angular `CubeService`. See [Angular DI](#angular-di) example.

#### Define anomaly

Anomaly is when the usage accedes index value. By default, anomaly is calculated as the value of all cube records that map to the document _entries_ deducted from all _indices_ values.

BizDoc notifies recipients of any anomaly found in any of the axes.
To make BizDoc ignore one of more segment, use the `AnomalyPolicy` option in AddBizDoc() startup.

```csharp
services.AddBizDoc(o => {
  o.AnomalyPolicy &= ^ AnomalyPolicy.Axis3 | AnomalyPolicy.Positions;
});
```

If the 3rd axis is, for example, months, the anomaly will be calculated in a higher lever of quarters.

You may also change the default behavior of notifying recipients to notifying users who where assigned to roles by adding the AnomalyPolicy.Positions.

To refine how anomaly is calculated, override cube CalculateAnomalyAsync() method. A negative value is considered an anomaly, whereas a positive or zero indicates no anomaly.

```csharp
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
Widgets have an Angular component and a backing server-side object.

The backing object derived from WidgetBase.

```csharp
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

And an Angular component implementing WidgetComponent\<T\>.

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

Like other components, Angular widget component must have a @BizDoc decoration matching the backing object Template attribute.

The onBind() function receives the data returned by the server-side GetAsync() method.

> Widgets, as other objects, accepts _Options_ to control their behavior. Refer to BizDoc.Configuration.Widgets namespace to inspect core widget properties.

Core widgets server-side objects can be overridden. See [how to](#customizing-built-in-objects) example.

### Rules

A _rule_ declares a programmatic value. For example, the Anomaly rule returns the cube anomaly for the currently processed document.
Rules can then be evaluated in scenarios like a workflow _if_ condition or object _privileges_.

A rule object inherits from RuleBase.

```csharp
public class ValueRule : RuleBase<decimal?>
{
    private readonly IDocumentContext _documentContext;
    public ValueRule(IDocumentContext documentContext) => _documentContext = documentContext;

    public override decimal? GetValue() => _documentContext.Document.Value;
}
```

You can then use rules in configuration file.

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

BizDoc logs changes made by users to documents model. Changes can then be viewed from document trace.
To enable a form to show version compare, use the `bizdocCompareGroup`, `bizdocCompareContext` and `bizdocCompareName` directives.

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

You may also access version data programmatically from the onBind() function.

```typescript
onBind(data: RecipientModel<MyFormModel>, version?: MyFormModel): void {
    if(version && version.subject !== data.model.subject) {
      ...
    }
}
```

### Enable navigation in forms

You communicate with form container by injecting _FormRef_.

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

This code pattern is recommended if your form opens internal portals, and the user should be able to navigate back to previous view.

### Inject custom slot

BizDoc uses *slots* to display different content parts to desktop users. Slot can be pinned, resized, etc.

If you wish to open a custom component on a new slot next to your form, use the `SlotsRouter` service.

```typescript
constructor(private _router: SlotsRouter) {}
open() {
  this._router.navigate(MySlotComponent);
}
```

You may also register slots with paths in advance. See slots [issue](https://github.com/moding-il/bizdoc.core/issues/10) for more.

### Providing a user guide

BizDoc can present the user with a guide of component functionality and use.

_Guides_ are maintained in bizdoc.json configuration.

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

You can set a guide to a form, report, utility, widget or cube view.

```json
"Forms": [
  {
    "Name": "purchase",
    "Title": "Purchase",
    "Guide": "myPurchaseGuide"
  }
]
```

You can also set a guide at runtime using `FormRef`. For example, a form may provide different guide for line view and header view, or a different guide in preview and edit mode.

### Format delivered emails

BizDoc delivers emails to users. Emails can be customized using XSLT.

To change the default XSLT, create a new XSLT file,
choose 'Copy Always' in its file properties.

Edit file:

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

In startup.cs services.AddBizDoc(), set BodyTemplate to your xslt file path.

> Study the schema to learn about the structure of the XML representing document data.

Some limitations may apply to data models to allow them to be serialized as XML. Annotate your model with XmlIgnore, XmlAttribute, XmlArray and XmlArrayItem to control the XML structure.

You can pass data to XML CustomData node by overriding the GetCustomData() method of your form server-side object.

### Provide a Custom Identity Manager

Create new class in your project implementing BizDoc.Core.Identity.IIdentityManager and BizDoc.Core.Identity.ISignInProvider interfaces.
Register each of them separately in startup.cs as scoped service for the respective interface.

### Customizing built-in components

BizDoc built-in components, such as widgets and reports, can be extended to alter their behavior. For example, an existing widget component implementation can be overridden to determine data scope.

```csharp
public class MyDepartmentsCompare: DepartmentsCompareBase {
  private readonly IIdentityContext _identityContext;
  protected override async Task<string[]> GetUsersAsync(string groupId) => ... // provide list of identities
}
```

In BizDoc configuration file, change the Type of the widget to your object implementation.

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

Server-side objects internationalization may be applied by setting the ResourceType attribute to a .resx public file.

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

```csharp
[Form(Title = "MyForm", ResourceType = typeof(Properties.Resources))]
public class MyForm : FormBase<MyFormModel> {
}
```

The above Properties.Resources maps to project-level resources, found under project properties.

In Angular side, you can introduce a string resource using the `TranslationService`:

```typescript
TranslationService.Set('es', {
  myField: 'My Field {0}'
});
```

Consume the resource by using the `translate` pipe:

```html
<div>{{'myField' | translate : '!'}}</div>
```

In the above code, translate pipe accepts ! as a parameter, replacing the {0} in the resource string.

### Disabling Objects

In bizdoc.json file, locate the object you wish to disable and set the Disabled property.

```json
{
  "Disabled": true
}
```

### Set Privileges To Forms

Create _rules_ in form configuration. Use administration utility to assign _roles_ to _rules_.

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

In your form component, test privileges for a field or a section of your code by adding bizdocDisabled or bizdocHidden directive.

```html
<input bizdocDisabled="myField" />
...
<div bizdocHidden="myField"></div>
```

You can gain programmatic access to rules from form component onBind() method.

```typescript
onBind(data: RecipientModel<MyFormModel>): void {
    if (!data.rules['myField']) {
      ...
    }
}
```

In addition to _roles_, a rule may grant privilege per _rules_ expression. See [rules](#Rules) above on how to endorse a new rule or use the existing ones.

### Store custom user settings

Use BizDoc `IProfileManager` service to store user specific settings.

In your object constructor, consume IProfileManager and use Get() and Set() methods to retrieve and set a predefined model. Persist your changes using the Persist() method.

```csharp
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

BizDoc database tables are self-maintained under the BizDoc schema.
You can access database objects using the `Store` service. If you wish to access the _cube_ to query data, we recommend using the `CubeService` as explained in the [Cube](#querying) section.

Database tables:

| Table       | Usage |
----          | ---   |
| Documents | Document header and data model
| Recipients | Document recipients
| Events | Events of documents
| Locations | Document geo data
| Attachments | Document attachments (Using BizDocService.UseDatabaseFileStore)
| Comments | Comments of documents
| Entries | Cube Axes mapping of a document
| Log | Document log. May be one of ActionTaken, Submit, Escalate, ModelChange, Downloaded, or StateChange. Log models can be found in BizDoc.Core.Data.Models.Log namespace.
| Cube | Reflects document data from Entries table and data from 3rd party app
| Indices | Indices for cube
| Segments | Account segments code names (default implementation)
| Combinations | Account segments combinations (default implementation)
| Chats | Conversations (when applicable)
| Devices | (Internal, registry of user devices)
| Sequences | (Internal, unique form sequence)

You can access a document data model using the Document GetModel\<TModel\>() method. This practice is not intended for large queries. Use `TableMapping` as explained above when dealing with a large datasets.

> As Cube and Indices tables grow significantly large, consider adding indexes to the axes you use.

If you add 3rd party information to Cube table, use separate records than the ones BizDoc creates.

Segments and Combinations tables are used by Segments built-in type, `CombinationPicker` and `CombinationPool`. You may override cube CombinationsAync() method to retrieve combinations from a source of your choice.

## References

BizDoc rely on [Hanfire](https://docs.hangfire.io/) for background execution. You can add your long-running or periodic jobs using this library. Administrative control available in /hangfire url on your web app server.

BizDoc uses [Syncfusion](https://www.syncfusion.com/angular-ui-components) for charting. If you wish to add charts to your custom components, we recommend using this library. Licensing required.

If you use the currency exchange rate job, register at <http://data.fixer.io> and set the appropriate options in startup.cs.

Issus can be submitted [here](https://github.com/moding-il/bizdoc.core/issues).

> Product updates are released regularly via [npm](https://www.npmjs.com/package/bizdoc.core) and [Nuget](https://www.nuget.org/packages/BizDoc.Core/) packages.
> Keep your project up to date!
