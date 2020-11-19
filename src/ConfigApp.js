import React from 'react';
import App from './App';

class ConfigApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const self = this;
    fetch('/config.json')
      .then(response => {
        if (!response.ok) {
          throw Error('Got ' + response.status + ' http status');
        }
        return response.json();
      })
      .catch(err => {
        console.log(
          "Use default application configuration as config.json hasn't been found or parsed:",
          err
        );
        return {};
      })
      .then(config => self.setState({ config }));
  }

  render() {
    if (this.state.config === undefined) {
      return null;
    } else {
      return <App {...this.state.config} />;
    }
  }
}

export default ConfigApp;
