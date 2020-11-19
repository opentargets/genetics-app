import React from 'react';
import { shallow } from 'enzyme';
import ConfigApp from './ConfigApp';
import App from './App';

const waitForAsync = () => new Promise(resolve => setImmediate(resolve));

describe('<ConfigApp />', () => {
  it('renders nothing while cofig.json being fetched', () => {
    let ca = shallow(<ConfigApp />);

    expect(ca.state().config).toEqual(undefined);
    expect(ca.isEmptyRender()).toEqual(true);
  });

  it('renders application using defaults when config.json is not found', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      })
    );

    let ca = shallow(<ConfigApp />);
    await waitForAsync();

    expect(ca.find(App)).toHaveLength(1);
    expect(ca.find(App).props()).toEqual({});

    global.fetch.mockRestore();
  });

  it('renders application using defaults when config.json is not parsable', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.reject('corrupted json'),
      })
    );

    let ca = shallow(<ConfigApp />);
    await waitForAsync();

    expect(ca.find(App)).toHaveLength(1);
    expect(ca.find(App).props()).toEqual({});

    global.fetch.mockRestore();
  });

  it('renders application using config.json', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ muiTheme: {} }),
      })
    );

    let ca = shallow(<ConfigApp />);
    await waitForAsync();

    expect(ca.find(App)).toHaveLength(1);
    expect(ca.find(App).props()).toEqual({ muiTheme: {} });

    global.fetch.mockRestore();
  });
});
