import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import { OtUiThemeProvider } from 'ot-ui';

import HomePage from './pages/HomePage';
import StudyPage from './pages/StudyPage';
import StudiesPage from './pages/StudiesPage';
import GenePage from './pages/GenePage';
import VariantPage from './pages/VariantPage';
import LocusPage from './pages/LocusPage';
import LocusTraitPage from './pages/LocusTraitPage';
import StudyLocusPage from './pages/StudyLocusPage';
import withPageAnalytics from './analytics/withPageAnalytics';

const App = () => (
  <OtUiThemeProvider>
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
          path="/locus-trait/:studyId/:indexVariantId"
          component={withPageAnalytics('study-locus', LocusTraitPage)}
        />
      </React.Fragment>
    </Router>
  </OtUiThemeProvider>
);

export default App;
