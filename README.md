# Adding operator overloading to TypeScript

> This repo is by no means a working version of operator overloading in TS. It is only meant for experimental purposes to find out what is possible.

## Installation
Run `npm i` to install the dependencies. TypeScript should be patched automatically. You can check ts-patch status via `npx ts-patch check`. 

## Running the example
File `main.ts` contains some example code to test the transformer.

To compile the example code run:
```
npx tsc main.ts
```
Compiled code should appear in `main.js`.

## The approach
I've decided to use [TS-patch](https://github.com/nonara/ts-patch) to patch TypeScript and apply custom transformer that replaces arithmetic expressions (`+`, `-`, `*`, `/`, ...) with funciton calls (`__add__`, `__sub__`, ...). For example the code (where a, b, and c are custom objects):
```js 
a + b * c 
```
is transformed to something like this:
```js
a.__add__(b.__mul__(c))
```

> The arithmetic expression should be transformed only if an appropriate method exists on the custom object. This is not jet implemented. But I think it should be possible to infer from type information.

After the transformation, the code is type checked. If for example `b` and `c` can't be multiplied together, an error is thrown by `tsc`:

```
main.ts:22:35 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'P'.

22 let d = P.__add__(a, P.__mul__(b, c));
                                     ~
```

> Notice: the transformed code is shown in the error message. Ideally, the original code would be shown but right now I have no idea how to achieve that.


### Showing errors in the editor
> I haven't yet figured out how to show errors in the editor (VS-Code).

Here is what I've tried:

I set VS-code setting (`./.vscode/settings.json`) to use the local (patched) installation of TypeScript.
```json
"typescript.tsdk": "./node_modules/typescript/lib"
```

When running `npx ts-patch check`, I noticed the `tsserver.js` (the file responsible for IntelliSense in the editor) is not patched so I tried to patch it using `npx ts-patch patch tsserver.js`. After that I tried to restart the TS server via `TypeScript: Restart TS server` command in VS-Code but it crashed every time.

## Research bookmarks
- Patch tsserver: https://github.com/nonara/ts-patch/discussions/40#discussioncomment-977445
- How to specify language server location (Concerned about the willingness of others to patch their typescript) https://github.com/nonara/ts-patch/discussions/48
- TS-patch: Proper way of patching tsserver? https://github.com/nonara/ts-patch/discussions/64
- How to transform TypeScript code before type-checking using Compiler API https://stackoverflow.com/questions/63105982/how-to-transform-typescript-code-before-type-checking-using-compiler-api
- Writing a Language Service Plugin (official documentation from TypeScript) https://github.com/microsoft/TypeScript/wiki/Writing-a-Language-Service-Plugin
- TS-patch (Directly patch typescript installation to allow custom transformers) https://github.com/nonara/ts-patch
- TTypeScript (TS-patch's predecesor): https://github.com/cevek/ttypescript