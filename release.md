# Release notes

We release a major version once a year, medium version every other month, and minor patches on a regular basis.

## 1.10.3

### Features

* Matrix calculated columns / rows.
* Excel export on charts and analysis components.

### Breaking changes

[DayJs](https://day.js.org/) replaces MomentJs.
BizDoc exports Moment pipes `Duration`, `TimeAgo`, `Calendar` and `DateFormat`.

XLSX dropped. Using Syncfusion Excel Export package.

> Add allowSyntheticDefaultImports: true to tsconfig.

## 1.9.14

### Compatibility

Angular 13. Net Core 6.0

### Features

* Spreadsheet explore
* Universal search, including documents, reports, cube axes

## 1.8.20

* Tabs navigation scope.
* Combination pool _source_ attribute.
* Document summary view.
* Chart and pivot document views.
* Cube views _Scope_, can be set to either Positions, Patterns or Global.
* G-Suite authentication and email reply.

## 1.7.0

* JWT for form authentication.
* Document view from inbox (e.g cube related to current document)
* Gantt timeline
* Social packages (Teams, Monday) features
* OAuth0 authentication, Nuget package [BizDoc.Authentication.OAuth0](https://www.nuget.org/packages/BizDoc.Authentication.OAuth0/)
* Cube widget stacking chart (bar, column). Widget explore tab

### Breaking changes

* BizDoc.Core.AspIdentity deprecated in favor of BizDoc.Core.FormIdentity Nuget. AddAspIdentity() and UseAspIdentity() replaced with AddFormIdentity() and UseFormIdentity().  
* Credentials npm moved to [@bizdoc/credentials](https://www.npmjs.com/package/@bizdoc/credentials). Use forRoot() to configure.
* Okta for Angular moved to [@bizdoc/okta](https://www.npmjs.com/package/@bizdoc/okta).

## 1.6.12

### Features

* Stacking widget chart, see CubeAnalysisBase.IOptions.
* Okta hosted sign-in widget.
* Desktop UX improvements, introducing tabs, available developer API.
* Invoice module [npm](https://www.npmjs.com/package/@bizdoc/invoice)
* Teams (Preview) [npm](https://www.npmjs.com/package/@bizdoc/teams)
* Monday [npm](https://www.npmjs.com/package/@bizdoc/monday)

### Breaking changes

bizdoc.core deprecated in favor of @bizdoc/core

## 1.5.4

### Features

* Html editor in comments and chat.
* Reply to comments.
* Action-picker in form body, replacing toolbar option.
* Swagger Nuget, AddSwagger() extension.
* Preserve draft comment, chat (optional BizDocModule.forRoot())

## 1.4.1

### Features

* Folder filter by cube axes.
* Themes green and brown.
* Emoji in chat and comment.
* User availability indicator.
* Microsoft Teams for BizDoc (Preview).

### Breaking changes

* RxJs 7.3, TypeScrip 4.3

## 1.3.2

### Features

* Cube multi currency support in explore.
* `Currency`, `ExchangeRate` and `Percentage` attributes enable more than one currency per document, in scenarios such as lines, where currency is set for the line.
* Flutter *Invoice* form for Invy. Camera capture, geo location and nearby businesses.

## 1.2.5

* Spreadsheet cube view. Set type from configuration file.
* Cube info sum columns/rows option, such as YTD.
* Cube dashboard widgets filters.

### Flutter app (Preview)

BizDoc delivers framework for Flutter developers, supporting Android and iOS.
Including builtin support for Firebase messaging to keep user updated at all times.

## 1.1.0

Version supports Angular 12.0.x.

### Improvements

* Build size significantly reduced.
* Fast rendering (Ahead-of-Time).

### Fixes

* Right-to-left support for charts.

## 1.0.1

### Fixes

* Right-to-left support for slots.

## 1.0.0

Version supports Angular 11.2.x and .Net 5.1.

### Features

* Organize components as slots for desktop users. Read more on this feature [here](https://github.com/moding-il/bizdoc.core/issues/10).
* Chat with more than one user in parallel.
* Tag users and documents using @ and #. Tagged document opens a preview and tagged person opens chat.
* Paste image in chat and document comments.
* [Slack](http://www.slack.com) support using BizDoc [package](https://www.nuget.org/packages/BizDoc.Slack/).

### Breaking changes

1. Custom BizDoc componenets (forms, reports, etc.) require registration in app module:

```typescript
imports: [BizDocModule.formRoot(
  components: [MyFormComponenet]
)]
```

## 0.12.44

### Features

* Chat and comment emoji (y), (n), <3. **Emphasis** using leading and trailing \*.
* Configuration diff system utility.
* Trace document system utility.
