npm install -g pnpm@v7  
 pnpm i -d encode-fe-lint
pnpx encode-fe-lint init

```js
 "scripts": {
    "preinstall": "npm only-allow pnpm",
    "prepare": "husky install",
     "init": "pnpm install && pnpm run build",
     "start": "pnpm run dev",
    "clean-dist": "rimraf 'packages/hooks/{lib,es,node_modules,dist}'",
    "clean": "pnpm run clean-dist && rimraf node_modules",
    "dev": "dumi dev",
    "build": "pnpm -r --filter=./packages/* run build",
    "build:doc": "dumi build",
    "test": "jest",
    "coveralls": "jest --coverage --coverageReporters=text-lcov | coveralls",
    "pub": "pnpm run build && pnpm -r --filter=./packages/* publish",
    "pub:beta": "pnpm run build && pnpm -r --filter=./packages/* publish --tag beta",
    "encode-fe-lint-scan": "encode-fe-lint scan",
    "encode-fe-lint-fix": "encode-fe-lint fix"
  },
```

preinstall 在 install 之前执行

> "preinstall": "npm only-allow pnpm", 代表必须用 pnpm 执行

"init": "pnpm install && pnpm run build",

> 将 install 和 build 集成在一起

clean-dist 删除路径下的包里面的所有东西
所以 clean 的命令删除 hooks 下的所有东西以及 node_modules

高速 dumi 当前站点的工作区

    "build": "pnpm -r --filter=./packages/* run build",

packages 下面的所有的子包都执行 pnpm run build 命令（子包有就执行，没有不执行）
