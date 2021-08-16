# Developer Guidelines

## Modeling

### Server-side

```c#
public class MyFormModel {
    public List<Line> Lines { get; set; }
    public class Line {
        public string CatalogNumber { get; set; }
        public decimal Price {get; set; }
    }
}
```

#### Attributes

| Name | Usage | Namespace
| -- | -- | --
| Subject | | BizDoc.ComponentModel.Annotations
| Summary | | BizDoc.ComponentModel.Annotations
| Value | Display value | BizDoc.ComponentModel.Annotations
| Currency | Display currency | BizDoc.ComponentModel.Annotations
| Percentage | | BizDoc.ComponentModel.Annotations
| ExchangeRate | Update rate from ExchangeRates database table
| Key | | System.ComponentModel.DataAnnotations
| Required | | System.ComponentModel.DataAnnotations
| Display | | System.ComponentModel.DataAnnotations
| MaxLength | | System.ComponentModel.DataAnnotations
| DataType
| RegularExpression | | System.ComponentModel.DataAnnotations
| StringLength
| Range
| MinLength
| MaxLength
| Hint
| Column | Sql type | System.ComponentModel.DataAnnotations.Schema
| Line | Update numerator
| VersionIgnore | | BizDoc.ComponentModel.Annotations
| Switch | | BizDoc.ComponentModel.Annotations
| Switch | | BizDoc.ComponentModel.Annotations
| Address | | BizDoc.ComponentModel.Annotations
| DocumentId | Set document Id
| JsonIgnore | | System.Text.Json.Serialization
| JsonPropertyName | | System.Text.Json.Serialization
| JsonConverter | | System.Text.Json.Serialization
| XmlIgnore | | System.Xml.Serialization
| XmlArray | | System.Xml.Serialization
| XmlArrayItem | | System.Xml.Serialization
| ListType | | BizDoc.ComponentModel.Annotations
| ValueResolver | | BizDoc.ComponentModel.Annotations

> Models.

#### Cube

```c#
[CubeMapping(nameof(Price), nameof(Segment1), ...)]
public class Line {

}
```

### Angular

my-form/declarations.ts using camel-casing.

```ts
export interface MyFormModel {
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

```bash
ng g c MyForm
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

### Embed Components

built-in.

| Name | Usage
| -- | --
| AddressInput |
| TypeSelect | _Type_
| TypeAutocomplete | _Type_
| TimeInput |
| CombinationPicker
| CombinationPool | _Constraints_
| ActionPicker | Move actions to form body.

Input form-field.

```html
<bizdoc-address formControlName="businessAddress"></bizdoc-address>
```
### View Mode

compose, preview and version.

### Rules

bizdoc.config _Forms_.

```json
{
    "Rules": {}
}
```

### Mobile Responsive

fxLayout

```html
<form fxLayout=column>
    <div fxLayout=row fxLayout.gt-sm=column>
    </div>
</form>
```

### Map Angular to Server Model

```ts
@BizDoc({
    selector: 'my-form'
})
```

```c#
[Template("my-form")]
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

> Schema
> naming conventions

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

> not needed

### Migration

EF Code-first

```bash
dotnet ef add-migration "Initial" // -context MyProject.DbStorage
```

## Managed-Type

Managed types are registered in bizdoc.json upon app initial run.

Dependency Injection.

### Form

Create

```c#
[Form(...)]
public class MyForm : FormBase<MyFormModel> {

}
```

Override base methods.

### Type

```c#
public class Customers : TypeBase {
    public override Task<Dictionary<string, string>> GetItemsAsync() => 
        _storage.Customers.ToDictionaryAsync(c=> c.Id, c=> c.Name);
}
```

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

### Cube

```c#
public class MyCube : CubeBase {}
```

Enum:

```c#
public enum Balance {
    Open,
    Po,
    ...
}
```

form:

```c#
using BizDoc.ComponentModel.Annotations;
using BizDoc.ComponentModel.Resolvers;
public class MyFormModel {
    [ValueResolver(typeof(StateAxisResolver<Balance?>))]
    public Balance? Balance { get; set; }
}
```

> Cube _Axes_, such as account segments and date part, has to have a matching _Type_.

### Explore

```c#
public class MyCube : CubeBase, CubeBase.IExplore<Po> {
    ...
}
```

## Services

### Server-side

Add a Controller to your project.

```c#
[ApiController]
[Produces("application/json")]
[Route("api/[controller]")]
public class MyController : ControllerBase {
    [Route("[action]")]
    public IEnumerable<Part> Parts () => _storage.Parts.
        OrderBy(p=> p.CatalogNumber).
        Take(20);

}
```

> Return small chunks is a good practice.

#### Cache

```c#
[ResponseCache(Duration = 3600 /* an hour */)]
```

startup.cs

### Angular

```bash
ng generate service MyService // same as ng g s My 
```

```ts
export class MyService {
    contructor(private _http: HttpClient) {
    }
    tables() {
        return this._http.get('/api/myController/parts')
    }
}
```

Consume.

```ts
export class MyLineComponent implements OnInit {
    constructor(private _service: MyService) {}
    ngOnInit() {
        this.parts = this._service.parts();
    }
}
```

## Configure

bizdoc.json

### Cube

_Axes_
and _Views_

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

bizdoc.config _Options_

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

> Refer to the class declared in widget _Type_ to learn more of its exposed properties.

### Reports

### Actions

```c#
```

### Guides

User guide. Set _Guide_ name on any of the widgets, reports or forms.

### Privileges

### Rules

```c#
```

## Extensions

startup.cs

| Method | Usage | Package
| -- | -- | --
| UseSqlServer | Microsoft Sql Server storage
| UseOracle | Oracle storage | BizDoc.Core.Oracle
| AddAspIdentity | User authentication | BizDoc.Core.AspIdentity
| AddOkta | Okta authentication | BizDoc.Core.Okta
| AddOffice | 365 | BizDoc.Core.Office365
| AddDirectoryServices | | BizDoc.Core.DirectoryServices
| AddEscalate | Escalate roles
| AddSummaryMail | Send email
| AddMailExecuteGraph | Microsoft Exchange | BizDoc.Core.Exchange
| AddMailExecutePOP3
| AddMailExecuteIMAP
| AddDbContext | Complementary EF context. See [Database](#database) section
| AddSwagger
| UseDatabaseFileStore
| UseFileSystemFileStore
| AddSlack | Slack push | BizDoc.Core.Social
| AddTeams | Microsoft teams push | BizDoc.Core.Social
| AddExchangeRate | Currency exchange rate

```c#
services.AddBizDoc(options => {
    options.Smtp.SenderAddress = new MailAddress("bizdoc@company.co");
}).
  AddEscalate(o=> {
    o.Nudge = TimeSpan.FromDays(1)
  });
```

### Formatting Email

Add Xml attributes to form data model.
Xml structure [message.xsd](message.xsd).

```c#
public class MyFormModel {
    ...
    [XmlAttribute]
    public string PoNumber { get; set; }
}
```

#### FormBase Extra

```c#
public class MyForm : FormBase<MyFormModel> {
    public async Task<object> GetCustomDataAsync() => new MyExtra {
        Data1 = ...
    };
}
```

#### Configuring

Set Xslt in startup.cs.

```c#
services.AddBizDoc(options => {
    options.EmailBody = "./my-email.xslt";
});
```

> Relative path.
> Set my-email.xslt file properties to `Content`.

## Jobs

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

*server-url*/hangfire/recurring.

## Deployment

Angular production build optimization.

Tree-shaking.

## More read

[readme](readme.md).

RxJs
