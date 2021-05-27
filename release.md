# Release notes

We release a major version twice a year, medium version every other month, and minor patches on a regular basis.

## 1.1.0

Version supports Angular 12.0.x.

### Fixes

* Right-to-left support for charts.

## 1.0.1

### Fixes

* Right-to-left support for slots.

## 1.0.0

Version supports Angular 11.2.x and .Net 5.1.

### Features

* Organize componenets as slots for desktop users. Read more on this feature [here](https://github.com/moding-il/bizdoc.core/issues/10).
* Chat with more than one user in parallel.
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
