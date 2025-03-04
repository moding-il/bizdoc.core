# Release notes

We release a minor version every other month, and patches on a regular basis.

## 3.3

* Notification dispatcher for pushing and interacting with messages.
* PingIdentity authentication.

## 3.1

* Workday API, components
* SAP Ariba API

## 3.0 

* Priority general search for part, po
* Postgres storage

## 2.1

> @bizdoc/core compatible Angular 17, BizDoc.Core Nuget 7.x.x compatible with .Net 7.

* Widgets for G-Suite, Azure, Directory Services, Okta, MFG PRO, Oracle and Priority.
* Azure UseEmailer() (IEmailer implementation).
* [Voice](https://www.nuget.org/packages/BizDoc.Infrastructure.Voice) support for VoiceXML (Preview)
* [HiBob](https://www.nuget.org/packages/BizDoc.Infrastructure.HiBob) interface (Preview)
* Chips control in _Box_ ans _Survey_ forms.

## 1.18

> @bizdoc/core 1.17.x is compatible with BizDoc.Core 6.8.x.

* Universal search engine, extends search to remote resources.
* Ambient transactions, across context scope.
* FileSystem attachments.
* [Survey](https://www.nuget.org/packages/BizDoc.Survey) form, designer and browser.
* Controls: Signature pad, Html, CheckList, Yes/No, Date range.
* Invite users to fill / complete form / survey.
* Attribute managed component.
* UseDatabaseProfile().
* Architecture localization options.
* ControlBase for custom control in Form Designer and Survey.
* [Okta](https://www.nuget.org/packages/BizDoc.Authentication.Okta/) and [G-Suite](https://www.nuget.org/packages/BizDoc.Authentication.G-Suite/) widgets

### Breaking changes

* PaneRef, PopupRef, FormRef, WidgetRef, ReportRef and UtilityRef observables methods rather than properties.
* Core.Data.Store is IDocumentStorage.
* ICallbackService, ICubeService, IScheduledTasks, IDocumentFactory, IDataSourceService.
* IdentityManager is IIdentityProvider, added GetMembersAsync()
* RuleBase Task\<T> GetValueAsync()
* ScheduledTasks is ITransactionScope

MAUI (experimental)

## 1.17

* [DirectoryServices](https://www.nuget.org/packages/BizDoc.Core.DirectoryServices) authentication, system group.
* Global IdentityClaimType in AddBizDoc() options.
* Mfg Nuget package analysis components for purchase and sales orders.
* Implicit cube mapping.
* Cube splitting by model primitive collection properties.
* Policies managed components, manage properties from Architecture tool.

## 1.16

> Nuget 6.7.x corresponds to @bizdoc/core@1.16.x npm.

* Support for [SAP](https://www.nuget.org/packages/BizDoc.Infrastructure.SAP) integration.
* Azure components for workflow diagram: AppRole, ManagerRole.
* Email alias from Azure Active Directory (AAD OtherMails).
* Architect tool for managing components. Build [designer](../../wiki/Designers) using `Designer` attribute.
* Form Designer, create forms with no coding.
* UserGroups rule.
* SAP, Mfg and priority dashboard widgets, views and sources.

### Breaking Changes

Some configuration components were dropped. Remove elements from bizdoc.json. 

* IIdentityManager GetPrimaryEmailAsync(), GetEmailsAsync().
* BizDoc.Configuration.Views.CubeChart changed to BizDoc.Configuration.Views.CubeAnalysis
* BizDoc.Configuration.Widgets.PeersPerformance deprecated. Inherit from PeersPerformanceBase instead.
* BizDoc.Configuration.Widgets.PendingResults deprecated. Inherit from PendingResultsBase instead. 
* BizDoc.Configuration.Types.TypeRoles dropped.
* StateId and RoleId rules renamed to DocumentState and RecipientRole.

## 1.15

* Angular 14, TypeScript 4.6.
* [Slack](https://www.nuget.org/packages/BizDoc.Core.Slack) support including a socket communication, events and service.
* Help tip tag `bizdoc-help-tip` opens [guide](../../wiki/Guides).  
* Diagram designer _swimlane_ and tools.
* ICurrencyExchange service.
* Calculate available cube for document using [IDocumentContext](../../wiki/IDocumentContext#query-cube).
* [Priority](https://www.nuget.org/packages/BizDoc.Infrastructure.Priority/) ERP and [MFG](https://www.nuget.org/packages/BizDoc.Infrastructure.Mfg/) integration.

## 1.14

Angular [@bizdoc/core](https://www.npmjs.com/package/@bizdoc/core) 1.14 npm corresponds to [BizDoc.Core](https://www.nuget.org/packages/BizDoc.Core) 6.5 Nuget.

* [FormIdentity](https://www.nuget.org/packages/BizDoc.Core.FormIdentity/) registers SecureApprove and SecureReject actions.
* [FormIdentity](https://www.npmjs.com/package/@bizdoc/credentials) timeout config.
* Document Trace utility browse dates range.
* Copy document duplicate attachments.
* Desktop [router](../../wiki/PanesRouter) OpenPolicy _Stretch_ and _Dialog_.
* _Move to_ action, propagating current user role on same w/f node.
* _Return To_ action, to any of the previous nodes.
* [Cube performance](../../wiki/Performance) widget.
* IDocumentContext now uses common code that effects CubeMapping.
*	Numeric (non-currency values) cube & explore. Set YAxis _type_ in bizdoc.json.
*	Escalations, nudge job (experimental).
*	Humanized messages on flow diagram and extended item on folder view.
*	Inline attachments as form field, including preview, check out & in.

Mfg/OpenEdge integration (preview)

## 1.13.18

* Inverse cube indices in matrix.
* Intelligent information on flow, expanded inbox item and trace.
* Workflow *return* and *assign* actions.
* Multiple configuration files.

### Flutter (preview)

[package](https://pub.dev/packages/bizdoc)

## 1.12.4

### Features

#### Cube scope

This version release include scope management feature. Analysis cube can now be set to either _Positions_, _Patterns_ or _Global_. Positions limits the cube filters to user privileges by assigned roles, while Patterns limits the cube to authorized cube patterns. Global is the default with no limit.

* Excel styling.
* Matrix export.
* Cube scope, axes values by scope.
* Axes parenting.
* Trace filter.
* Explore page size.
* Inline form attachments (Preview).
* Check in/out attachments.
* `CallbackService` to push events from server to frontend form.

## 1.10.7

### Features

* Matrix calculated columns / rows.
* Excel export on charts and analysis components.
* Axis structure and SQL builder (CubeServices) support for negation.

### Breaking Changes

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
* Combination pool _source_.
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

### Breaking Changes

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

### Breaking Changes

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

### Breaking Changes

1. Custom BizDoc components (forms, reports, etc.) require registration in app module:

```typescript
imports: [BizDocModule.formRoot(
  components: [MyFormComponent]
)]
```

## 0.12.44

### Features

* Chat and comment emoji (y), (n), <3. **Emphasis** using leading and trailing \*.
* Configuration diff system utility.
* Trace document system utility.
