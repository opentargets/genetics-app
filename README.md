# Open Targets Genetics App

This repo contains the web application code for [Open Targets Genetics](https://genetics.opentargets.org).

It is one component of several and the overarching project is described [here](https://github.com/opentargets/genetics), which is also where issues can be raised.

## Installation

Before developing or building for production, you will need to follow these steps:

Clone the repo.

```
git clone https://github.com/opentargets/genetics-app.git
```

Enter the directory.

```
cd genetics-app
```

Install the dependencies.

```
yarn install
```

### Development

Start the dev server.

```
yarn start
```

### Build

Build for production (generates a static `build` directory).

```
yarn build
```

### Deployment

We deploy the public version of this site on [Netlify](https://www.netlify.com/). See the [netlify.toml](netlify.toml) for more detail.

### Configuration

To change styling or colour scheme of the web application use `config.json`.
This file is applied when it gets placed in the root of the deployed web application so it can be fetched with `GET \config.json` request.

Example of such file you can find [here](config.sample.json).

#### Definition of the config.json structure

- `muiTheme` field describes the `material-ui` [theme](https://material-ui.com/customization/theming/).

## Contribute

Read our [contributing guidelines](CONTRIBUTING.md).

# Special Thanks

BrowserStack has allowed us to do cross-browser testing of the genetics app at no cost.
<img src="./tools-icons/Browserstack-logo.svg" alt="BrowserStack" width="400">

# Copyright

Copyright 2014-2018 Biogen, Celgene Corporation, EMBL - European Bioinformatics Institute, GlaxoSmithKline, Takeda Pharmaceutical Company and Wellcome Sanger Institute

This software was developed as part of the Open Targets project. For more information please see: http://www.opentargets.org

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
