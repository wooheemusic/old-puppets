## Introduction

'old-puppets' is a Spring-like container that implements the inversion-of-control pattern. It binds all annotated components in some certain contexts _WITHOUT_ `import`.

## WARN

> This module is not generalized yet. It is just for SK ECOTrol project so far.

## read annotations and build a application context

```
const { buildApplicationContext } = require("old-puppets");
buildApplicationContext();
```

## escape annotations

```
      {
        test: /\.js$/,
        use: [
          {
            loader: require.resolve("old-puppets/loaders/annotationLoader")
          }
        ]
      }
```

`annotationLoader` should be handled before the babel loader.

## @ComponentScan

```
import React, { Component } from "react";

import ComponentScan from "old-puppets/annotations/ComponentScan";

@ComponentScan
export default class Root extends Component {
  render() {
```

`applicationContext.js` will be generated in the same directory where the component with `@ComponentScan` is.

## the form of applicationContext.js

```
import Sample1 from './Sample1.js';
import Sample2 from './Sample2.js';

const mapper = [
	{ menuNo: 1, component: Sample1 },
	{ menuNo: 2, component: Sample2 },
]

export default mapper;
```

This js file might be stale because it is refreshed at build time.

> Component names are determined by thier file names, not (a function).name. So each of them should be UNIQUE.

## use applicationContext.js

```
// eslint-disable-next-line
import applicationContext from "./applicationContext";
```

`eslint-disable-next-line` should be commented because `applicationContext.js` does not exist before its building. This interface _WILL BE UPDATED_ to annotation use.

## just put an annotation on the class in a component to add the component to applicationContext.js

```
import React, { Component } from "react";

import MenuNo from "old-puppets/annotations/MenuNo";

@MenuNo(1)
export default class Sample1 extends Component {
  render() {
    return (
```

## License

MIT © [wooheemusic](https://github.com/wooheemusic)
