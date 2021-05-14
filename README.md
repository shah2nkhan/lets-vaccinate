# lets-vaccinate - Scratchy overnight tool for getting the info - pattern on vaccine availability

Tool just prints and write to file in every half minute on vaccine availabiliy on a state.
Tool is configured with delhi State all Districts to find 18years covi-shield vaccine as of now.
Its just print availability/ies on date + 1

## Things to note

Due to possible race condition at Cowin service side when you see 1 (few) available slot main cowin web may not show you that, even if Cowin web shows you that it may not allow you to book. Thats in general issue with Cowin Api all together.

## Tools required

- Any editor (VS code)
- Git
- Node - latest

## first time setup

## Usage

```bash
npm install
```

## Usage

```bash
npm start
```
