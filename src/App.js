import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import { OtUiThemeProvider } from 'ot-ui';

import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import StudiesPage from './pages/StudiesPage';
import GenePage from './pages/GenePage';
import VariantPage from './pages/VariantPage';
import LocusPage from './pages/LocusPage';
import StudyLocusPage from './pages/StudyLocusPage';
import ImmunobasePage from './pages/ImmunobasePage';
import withPageAnalytics from './analytics/withPageAnalytics';

const App = config => (
  <OtUiThemeProvider theme={config.muiTheme}>
    <Router>
      <React.Fragment>
        <Route exact path="/" component={withPageAnalytics('home', HomePage)} />
        <Route
          path="/study/:studyId"
          component={withPageAnalytics('study', StudyPage)}
        />
        <Route
          path="/study-comparison/:studyId"
          component={withPageAnalytics('study-comparison', StudiesPage)}
        />
        <Route
          path="/gene/:geneId"
          component={withPageAnalytics('gene', GenePage)}
        />
        <Route
          path="/variant/:variantId"
          component={withPageAnalytics('variant', VariantPage)}
        />
        <Route
          path="/locus"
          component={withPageAnalytics('locus', LocusPage)}
        />
        <Route
          path="/study-locus/:studyId/:indexVariantId"
          component={withPageAnalytics('study-locus', StudyLocusPage)}
        />
        <Route
          path="/immunobase"
          component={withPageAnalytics('immunobase', ImmunobasePage)}
        />
      </React.Fragment>
    </Router>
  </OtUiThemeProvider>
);

export default App;
