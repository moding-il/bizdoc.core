# Release notes

We release a major version twice a year, medium version every other month, and minor patches on a regular basis.

## 1.2.0

(Planned)

Version supports Angular 12.1.

* Spreadsheet cube view. Set type from configuration file.

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