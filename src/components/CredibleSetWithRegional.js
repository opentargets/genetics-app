import React from 'react';
import { Query } from 'react-apollo';

import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { CredibleSet, Regional } from 'ot-charts';

const styles = () => ({
  container: {
    width: '100%',
    maxWidth: '100%',
  },
});

class CredibleSetWithRegional extends React.Component {
  state = {
    expanded: false,
  };
  render() {
    const { classes, credibleSetProps, regionalProps } = this.props;
    const { expanded } = this.state;
    const { query, variables, start, end, ...rest } = regionalProps;
    return (
      <ExpansionPanel expanded={expanded}>
        <ExpansionPanelSummary
          onClick={() => {
            this.setState({
              expanded: !this.state.expanded,
            });
          }}
          expandIcon={<ExpandMoreIcon />}
        >
          <div className={classes.container}>
            <CredibleSet {...credibleSetProps} />
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          {expanded && (
            <Query query={query} variables={variables}>
              {({ loading, error, data }) => {
                if (loading || error) {
                  return null;
                }

                return (
                  <div className={classes.container}>
                    <Regional
                      {...{
                        data: data.regional.map(({ variant, pval }) => ({
                          pval,
                          ...variant,
                        })),
                        start,
                        end,
                        ...rest,
                      }}
                    />
                  </div>
                );
              }}
            </Query>
          )}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
}

export default withStyles(styles)(CredibleSetWithRegional);
