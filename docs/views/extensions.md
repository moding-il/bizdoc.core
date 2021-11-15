#

BizDoc components can be hosted.

## Cube

```html
<bizdoc-cube-matrix xAxis="years" series="balance"></bizdoc-cube-matrix>
```

```html
<bizdoc-cube-chart xAxis="years" series="balance"></bizdoc-cube-chart>
```

```html
<bizdoc-cube-spreadsheet xAxis="years" series="balance"></bizdoc-cube-spreadsheet>
```

```html
<bizdoc-cube-grid xAxis="years" series="balance"></bizdoc-cube-grid>
```

```html
<bizdoc-cube-view name="view1"></bizdoc-cube-view>
```

## Form

```html
<bizdoc-form [model]="model"></bizdoc-form>
```

```ts
export class MyFormComponent {
    @ViewChild(ComposeFormComponent) form: ComposeFormComponent;
    model: DocumentModel;
}
```

### Properties

| Name | Type | Usage
| -- | -- | --
| model | DocumentModel\<any>

### Events

| Name | Type | Usage
| -- | -- | --
|  | |

[code](https://stackblitz.com/edit/angular-ivy-fw3dh5?embed=1&file=src/app/app.component.html)

## Views

