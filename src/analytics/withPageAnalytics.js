import React from 'react';
import GoogleAnalytics from 'react-ga';

import { ANALYTICS_TOKEN } from './constants';
import shouldUseAnalytics from './useAnalytics';
import reportAnalyticsEvent from './reportAnalyticsEvent';

if (shouldUseAnalytics()) {
  GoogleAnalytics.initialize(ANALYTICS_TOKEN);
}

// see https://github.com/react-ga/react-ga/issues/122

const withPageAnalytics = (pageId, WrappedComponent, options = {}) => {
  // only track on production
  if (!shouldUseAnalytics()) {
    return WrappedComponent;
  }

  const trackPage = page => {
    GoogleAnalytics.set({
      page,
      ...options,
    });
    GoogleAnalytics.pageview(page);
  };

  const HOC = class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { loadedAt: new Date() };
    }
    componentDidMount() {
      const page = this.props.location.pathname;
      trackPage(page);
    }
    componentWillUnmount() {
      const unmountedAt = new Date();
      const duration = unmountedAt - this.state.loadedAt;
      reportAnalyticsEvent({
        category: 'page',
        action: 'leave',
        label: pageId,
        value: duration,
      });
    }
    componentWillReceiveProps(nextProps) {
      const currentPage = this.props.location.pathname;
      const nextPage = nextProps.location.pathname;

      if (currentPage !== nextPage) {
        trackPage(nextPage);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };

  return HOC;
};

export default withPageAnalytics;
