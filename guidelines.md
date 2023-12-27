# Developer Guidelines

This document covers best practices in developing BizDoc.

## Modeling

Start by declaring the data model of your form.

### Server-side

```c#
public class MyFormModel {
    public string Topic { get; set; }
    public List<Line> Lines { get; set; }
    public class Line {
        public string CatalogNumber { get; set; }
        public decimal Price {get; set; }
    }
}
```

Apply attributes to the model to control it's behavior.

```c#
[Subject] // BizDoc reads Topic property as document subject
public string Topic { get; set; }
```

See full list [here](../../wiki/Attributes).

#### Link Cube

_Cube_ index form properties, enabling BizDoc to aggregate data in various views.

To use cube, the properties which participate in the index are provided as _axes_ to the CubeMapping attribute.

```c#
[CubeMapping(nameof(Price), nameof(Segment1), ...)]
public class Line {

}
```

You can use calculated properties as an axis. For example, extracting the quarter from a specific date property.

```c#
public byte Quarter => ShippingDate.Quarter();
```

### Extra Data

Provide on demand data for serialization. by overriding the GetCustomDataAsync method.

```c#
public class MyForm : FormBase<MyFormModel, MyExtraModel> {
    public async Task<object> GetExtraDataAsync() => new MyExtraModel {
        Data1 = ...
    };
}
```

### Angular

Declare the model above in TypeScript in my-form/declarations.ts using camel-casing.

```ts
export interface MyFormModel {
    topic: string;
    lines: LineModel[];
}
export interface LineModel {
    catalogNumber: string;
    price: number;
    ...
}
```

> Keep naming conventions.

## User Interface

Create an Angular component for your form:

```bash
ng generate component MyForm // same as ng g c MyForm 
```

```ts
export class MyFormComponent implements FormComponent<MyFormModel> {
    mode: ViewMode;
    readonly form = new FormGroup({ });
    onBind(data: DocumentModel<MyFormModel>) {
        ...
    }
}
```

In [Reactive Forms](https://angular.io/guide/reactive-forms), each field map to a FormControl in FormGroup.

### Embed Components

Html may include [Angular components](https://material.angular.io/components/categories) as well as BizDoc built-in tags.

| Name | Usage |
| -- | -- |
| IdentityName | \<identity-name [identity]=identity\>
| ActionPicker | Move actions to form body. \<bizdoc-action-picker [data]=data\>

See full list [here](../../wiki/Angular#Components).

```html
<mat-form-field>
    <bizdoc-address formControlName="businessAddress"></bizdoc-address>
</mat-form-field>
```

Form component may inject BizDoc services:

```ts
export class MyFormComponent {
    constructor(private _cube: CubeInfo) {
    }
    info() {
        this._cube.open({year: new Date().getFullYear()});
    }
}
```

### View Mode

Support form view mode: compose, preview and version.

### Internationalization

Support multi-language user interface.

#### Server

Add resource file and change it's access to PublicResXFileCodeGenerator.

Apply ResourceType to BizDoc components:

```json
    {
      "Template": "bizdoc-personal-activity",
      "Type": "BizDoc.Configuration.Widgets.PersonalActivity",
      "Name": "personalActivity",
      "Title": "YourActivity",
      "ResourceType": "BizDoc.Core.Resources.Strings"
    },
```

Models that are used in reports and widgets which do not have an angular template should be decorated with Display attribute:

```c#
public class MyReportArgs {
    [Display(Name = "Search", ResourceType = typeof(Strings))]
    public string Search { get; set; }
}
```

#### Angular i18n

```ts
TranslateService.set({'en-US': {
    MyField: "My field!"
}})
```

Use in html:

```html
<span>{{'MyField' | translate }}</span>
```

#### Version Compare

bizdocCompare, bizdocCompareName attributes.

### Form Permissions

In scenario in which a portion of the form may be available to one or more users, while others should not, use form _rules_.  

In bizdoc.config Forms section.

```json
{
    "Rules": {
        "section1": {
            "Roles": ["directManager"] 
        }
    }
}
```

```html
<div *ngIf="data.rules.section1">
...
</div>
```

### Mobile Responsive

[fxLayout](https://github.com/angular/flex-layout/wiki/fxLayout-API)

```html
<form fxLayout=column>
    <div fxLayout=row fxLayout.gt-sm=column>
    </div>
</form>
```

### Map Angular to Server Model

Angular BizDoc components:  

```ts
@BizDoc({
    selector: 'my-form'
})
```

Server data model or component attribute:

```c#
[Template("my-form")]
```

Register component in AppModule:

```ts
BizDocModule.forRoot({ components: [MyFormComponent] })
```

## Database

```c#
[Table("Parts", Schema = "service")]
public class Part {
    [Key]
    public string CatalogNumber {get; set; }
    ...
}

public class DbStorage: DbContext {
    public DbSet<Part> Parts { get; set; }
}
```

startup.cs.

```c#
services.AddBizDoc().AddDbContext<DbStorage>();
```

> Use database schema for code clearance.
> Keep naming conventions using human readable names.

### Model Mapping

```c#
[Table("MyForms", Schema = "forms")]
public class MyFormModel {
    [DocumentId]
    public int DocumentId { get; set; }

    [Table("MyFormLines", Schema = "forms")]
    public class Line {
        [MaxLength(128)]
        public string CatalogNumber { get; set; }
        [Column(DataType = "MONEY")]
        public decimal Price {get; set; }
    }
}
```

> Form model is accessible from Document.GetModel\<T\>(). If you do not require model for reporting, avoid mapping Table attribute.

### Migration

EF Code-first

```bash
dotnet ef add-migration "Initial" // -context MyProject.DbStorage
```

## Managed Components

Managed components are registered in bizdoc.json on initial run.

Components may use Dependency Injection.

### Form

Create backend object to support form lifetime events.

```c#
[Form(...)]
public class MyForm : FormBase<MyFormModel> {

}
```

Override base methods to tap into lifetime events.

### Type

A _Type_ is a data source. It returns a map of key-value. You may author your own types to provide values from database or remote app.

```c#
public class Customers : TypeBase {
    public override Task<Dictionary<string, string>> GetItemsAsync() => 
        _storage.Customers.ToDictionaryAsync(c=> c.Id, c=> c.Name);
}
```

API example:

```c#
public abstract class ApiTypeBase : TypeBase {
    public string Url {get; set; }
    public override Task<Dictionary<string, string>> GetItemsAsync() { 
        using var httpClient = new HttpClient();
        var response = await httpClient.Get(Url);
        if(response.StatusCode != 200) 
            throw new Exception($"{Url} returned {response.StatusCode}");
        return JsonSerializer.Deserialize<IEnumerable<Customer>(response.Body).
            ToDictionary(c=> c.Id, c=> c.Name);
    }
}
```

#### Self-Managed Type

One option is to manage type values in bizdoc.json.

```json
{
  "Types":[
      {
        "Type": "BizDoc.Configuration.Types.ConfigurationDataSource",
        "Name": "categories",
        "Options": {
        "Items": {
            "Category1": "Category 1",
            "Category2": "Category 2"
        }
        }
    }
  ]
}
```

### Cube

Component lifetime events.

```c#
public class MyCube : CubeBase {

}
```

Commonly, one a cube axes is the balance _axis_.
Declare an Enum:

```c#
public enum Balance {
    Open,
    Po,
    ...
}
```

Add balance property to form data model:

```c#
using BizDoc.ComponentModel.Annotations;
using BizDoc.ComponentModel.Resolvers;

public class MyFormModel {
    [ValueResolver(typeof(StateAxisResolver<Balance?>))]
    public Balance? Balance { get; set; }
}
```

> All cube _axes_ has to have a matching _Type_.

### Explore

As cube shows aggregated data, user may want to drill down into actual data. Use IExplore interface to enable drill down into data and implement BrowseType to resolve type.

```c#
public class MyCube : CubeBase, CubeBase.IExplore<Po> {
    Task<IEnumerable<PO>> IBrowsable<PO>.QueryAsync(params Axis[] axes)
    {
        ...
    }
    public override Type BrowseType(params Axis[] axes)
    {
        return typeof(PO);
    }
}
```

## Services

Forms often require access to additional resources, such as database tables. The design pattern to use in this case if Angular service.

### Server-side API

Add a Controller to your project and implement the API.

```c#
[ApiController]
[Produces("application/json")]
[Route("api/[controller]")]
public class CatalogController : ControllerBase {
    [Route("[action]")]
    public IEnumerable<Part> Parts () => _storage.Parts.
        OrderBy(p=> p.CatalogNumber).
        Take(20);

}
```

> Return small chunks of data using Take.

#### Cache Server Response

Static resources may cache response for better performance.

```c#
[ResponseCache(Duration = 3600 /* an hour */)]
```

Configure startup.cs to support [caching](https://docs.microsoft.com/en-us/aspnet/core/performance/caching/middleware?view=aspnetcore-5.0).

### Angular Service

Create Angular service to consume API.

```bash
ng generate service MyService // same as ng g s My 
```

```ts
export class MyService implements OnInit {
    constructor(private _http: HttpClient) {
    }
    parts$: Observable<PartInfo[]>;
    ngOnInit() {
        this.parts$ = this._http.get<PartInfo[]>('/api/catalog/parts')
    }
}
interface PartInfo {
   ...
}
```

In your component, inject service and call its method.

```ts
export class MyLineComponent implements OnInit {
    constructor(private _service: MyService) {}
    ngOnInit() {
        this.parts = this._service.parts();
    }
}
```

## Configure

BizDoc configuration is managed in bizdoc.json file. File includes all managed and non-managed components.

### Cubes

Declare cube _axes_ and _views_. An axis has to map to a _type_, declared in Types section of the file.

```json
 {
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
          "SelectionMode": "Multiple",
          "Name": "quarter",
          "Title": "Quarter"
        },
      ],
      "Views": [
        {
          "XAxis": "year",
          "Series": "quarter",
          "Type": "Chart",
          "Name": "balance0",
          "Title": "Balance0"
        }
      ]
    }
  ]
}
```

### Widgets

Managed object, such as a widget, may have extended properties. Extended properties are managed in component _Options_.

```json
{
"Widgets" : [
    {
      "Template": "bizdoc-cube-analysis",
      "Type": "BizDoc.Configuration.Widgets.CubeAnalysis",
      "Name": "periods",
      "Title": "Periods",
      "Options": {
        "ChartType": "Doughnut",
        "XAxis": [
          "month"
        ]
      }
    },
    ]
}
```

> Refer to the class declared in Type property to explore its properties.

### Reports

Reports are managed components which has a server-side class that inherit from ReportBase and an Angular side that implements ReportComponent interface.

As with widgets and forms, reports may have extended properties that can be set in Options.

### Utilities

### Actions

BizDoc _action_ is an option presented to the user choice on the document. An action inherits from ActionBase and may have an Angular template.

### Guides

Maintain user guide. Set Guide name on any of the widgets, reports or forms.

```html
<bizdoc-help-tip name="guide-name"></bizdoc-help-tip>
```

### Rules

A _Rule_ is a JavaScript code that can be tested inside expressions, such as form workflow If condition, or privileges.

#### Privileges

Components may be restricted to certain users by applying Privileges.

## Extensions

Configure one or more BizDoc extensions in startup.cs to feature your app. See full list [here](../../wiki/Extensions)

```c#
services.AddBizDoc(options => {
    options.Smtp.SenderAddress = new MailAddress("bizdoc@company.co");
}).
  AddEscalate(o=> {
    o.Nudge = TimeSpan.FromDays(1)
  });
```

### Formatting Email

Decorate your data model with XML attributes.
Xml structure [message.xsd](message.xsd).

```c#
public class MyFormModel {
    ...
    [XmlAttribute]
    public string PoNumber { get; set; }
}
```

#### Configure Template

Set Xslt in startup.cs.

```c#
services.AddBizDoc(options => {
    options.Smtp.EmailBody = "./my-email.xslt";
});
```

> Use relative paths.
> Set xslt file build property to `Content`.
> xsd [here](./message.xsd).

## Jobs

Use Hangfire to run background jobs in-process.

Jobs may consume BizDoc services.

```c#
public class SynchronizeJob {
    SynchronizeJob(Store store) {}
    public void Synchronize() {
        ...
    }
}
```

startup.cs:

```c#
using Hangfire;

RecurringJobs.AddOrUpdate<SynchronizeJob>("Synchronize", e=> e.Synchronize(), Crone.Daily());
```

Browse to *server-url*/hangfire/recurring to monitor job execution.

### Console

Long-running procedures may run better on a dedicated process. Create a console project and connect to BizDoc in code.

## Deployment

Angular production build optimization.

Apply database changes using EF migration:

```bash
dotnet ef update-database
```

## More read

Refer to [product documentation](readme.md) for complete list of options.

Use advanced programming topics [RxJs](https://rxjs.dev/)
