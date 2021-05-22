# Release notes

We release a major version twice a year, medium version once a month and minor patches regularly.

Nuget packages release.

Npm release.

## 1.0.1

### Fixes

* Right-to-left support for slots.

## 1.0.0

Version supports Angular 11.2.x and .Net 5.1.

### Features

* Organize componenets as slots for desktop users.
* Chat with more than one user, paste image.

### Breaking changes

1. Custom BizDoc componenets (forms, reports, etc.) require registration in app module:

```typescript
imports: [BizDocModule.formRoot(
  components: [MyFormComponenet]
)]
```

## 0.12.44

### Features

* Configuration diff system utility.
* Trace document system utility.
