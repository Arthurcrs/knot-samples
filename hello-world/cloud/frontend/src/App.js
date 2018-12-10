import React, { Component } from 'react';
import './App.css';
import _ from 'lodash';
import { Icon } from 'semantic-ui-react';
import axios from 'axios';
import openSocket from 'socket.io-client';
import { meshbluDefault, backendDefault, defaultFlags } from './config';

const meshbluDefaultHost = meshbluDefault.host;
const meshbluDefaultPort = meshbluDefault.port;
const defaultFlagTime = defaultFlags.flagTime;
const defaultFlagChange = defaultFlags.flagChange;

class App extends Component {
  constructor() {
    super();
    this.state = {};
    this.createDeviceCard = this.createDeviceCard.bind(this);
    this.createDeviceList = this.createDeviceList.bind(this);
    this.getDevices = this.getDevices.bind(this);
    this.switchStatus = this.switchStatus.bind(this);
    this.updateDevice = this.updateDevice.bind(this);
    this.deviceConfig = this.deviceConfig.bind(this);
    this.state = { flagChange: defaultFlagChange };
  }

  getDevices() {
    const { uuid } = this.state;
    const { token } = this.state;
    const { host } = this.state;
    const { port } = this.state;
    const backendRoute = `${backendDefault.host}:${backendDefault.port}`;
    const socket = openSocket(backendRoute);

    this.setState({
      socket
    });

    if (!uuid) {
      window.alert('UUID is mandatory'); // eslint-disable-line no-alert
      return;
    }
    if (!token) {
      window.alert('TOKEN is mandatory'); // eslint-disable-line no-alert
      return;
    }

    axios.get('devices', {
      headers: {
        'Meshblu-Host': host || meshbluDefaultHost,
        'Meshblu-Port': port || meshbluDefaultPort,
        'Meshblu-Auth-UUID': uuid,
        'Meshblu-Auth-Token': token
      }
    })
      .then((response) => {
        this.setState({
          devices: response.data
        });
        _.map(response.data, this.updateDevice);
      })
      .catch((error) => { // eslint-disable-next-line no-alert
        window.alert(`An error occured. Check the information provided and try again. ${error}.`);
      });
  }

  updateDevice(device) {
    const { uuid } = this.state;
    const { token } = this.state;
    const { host } = this.state;
    const { port } = this.state;
    const { socket } = this.state;

    const request = {
      meshbluHost: host || meshbluDefaultHost,
      meshbluPort: port || meshbluDefaultPort,
      meshbluAuthUUID: uuid,
      meshbluAuthToken: token
    };

    request.deviceId = device.id;
    socket.on(device.id, (response) => {
      const { devices } = this.state;
      const i = devices.findIndex(element => element.id === response.source);

      devices[i].value = response.data.value;

      this.setState({
        devices
      });
    });
    socket.emit('subscribe', request);
  }

  switchStatus(deviceId, sensorId, value) {
    const { uuid } = this.state;
    const { token } = this.state;
    const { host } = this.state;
    const { port } = this.state;

    axios
      .put(
        `/devices/${deviceId}/sensors/${sensorId}`,
        {
          data: {
            value: value ? 'false' : 'true'
          }
        },
        {
          headers: {
            'Meshblu-Host': host || meshbluDefaultHost,
            'Meshblu-Port': port || meshbluDefaultPort,
            'Meshblu-Auth-UUID': uuid,
            'Meshblu-Auth-Token': token
          }
        }
      )
      .then(() => {
        // eslint-disable-next-line no-alert
        window.alert('Status updated!');
      })
      .catch((error) => { // eslint-disable-next-line no-alert
        window.alert(`An error occured. Check the information provided and try again. ${error}.`);
      });
  }

  deviceConfig(deviceId) {
    const { uuid } = this.state;
    const { token } = this.state;
    const { host } = this.state;
    const { port } = this.state;

    const { flagTime, flagChange } = this.state;
    axios
      .get(`/devices/${deviceId}/config`, {
        headers: {
          'Flag-Time': flagTime || defaultFlagTime,
          'Flag-Change': flagChange,
          'Meshblu-Host': host || meshbluDefaultHost,
          'Meshblu-Port': port || meshbluDefaultPort,
          'Meshblu-Auth-UUID': uuid,
          'Meshblu-Auth-Token': token
        }
      })
      .then(() => {
        // eslint-disable-next-line no-alert
        window.alert('Device Configured!');
      })
      .catch((error) => {
        // eslint-disable-next-line no-alert
        window.alert(`An error occured. Check the information provided and try again. ${error}.`);
      });
  }

  createDeviceCard(device) {
    return (
      <div className="device-card">
        <div className="device-card-column">
          <div className="device-card-label-text">NAME</div>
          <div className="device-card-info-text">{device.name}</div>
          <div className="device-card-label-text">ID</div>
          <div className="device-card-info-text">{device.id}</div>
        </div>
        <div className="device-card-column">
          <label htmlFor="flagTime" className="device-card-label-text">
            UPDATE EVERY (SEC)
            <input
              type="text"
              id="flagTime"
              placeholder={defaultFlagTime}
              className="device-card-info-text"
              onChange={e => this.setState({ flagTime: e.target.value })}
            />
          </label>
          <label htmlFor="flagChange" className="device-card-label-text">
            UPDATE ON CHANGE
            <label className="switch-slider" htmlFor="flagChange">
              <input
                type="checkbox"
                id="flagChange"
                defaultChecked={defaultFlagChange}
                onChange={e => this.setState({ flagChange: e.target.checked })}
              />
              <span className="slider round" />
            </label>
          </label>
          <button
            type="button"
            className="device-card-button"
            onClick={() => this.deviceConfig(device.id)
            }
          >
            CONFIGURE
          </button>
        </div>
        <div className="device-card-column">
          <div className="device-card-icon">
            {device.value ? (
              <Icon name="lightbulb outline" color="yellow" size="massive" />
            ) : (
              <Icon name="lightbulb" color="black" size="massive" />
            )}
          </div>
          <button
            type="button"
            className="device-card-button"
            onClick={() => this.switchStatus(device.id, device.sensorid, device.value)
            }
          >
            CHANGE VALUE
          </button>
        </div>
      </div>
    );
  }

  createDeviceList() {
    const { devices } = this.state;

    return (
      <div id="online-devices">
        <h1 className="online-devices-header">
          ONLINE DEVICES
        </h1>
        {_.map(devices, this.createDeviceCard)}
      </div>
    );
  }

  render() {
    const { devices } = this.state;

    return (
      <div className="App">
        <div className="header-wrapper">
          <header className="App-header">
            <h1 className="App-title">Welcome to KNoT</h1>
          </header>
        </div>
        <div className="knot-info-wrapper">
          <div className="knot-info">
            <label htmlFor="host">
              MESHBLU HOST
              <input
                type="text"
                id="host"
                className="knot-info-text"
                placeholder={meshbluDefaultHost}
                onChange={e => this.setState({ host: e.target.value })}
              />
            </label>
          </div>
          <div className="knot-info">
            <label htmlFor="port">
              MESHBLU PORT
              <input
                type="text"
                id="port"
                className="knot-info-text"
                placeholder={meshbluDefaultPort}
                onChange={e => this.setState({ port: e.target.value })}
              />
            </label>
          </div>
          <div className="knot-info">
            <label htmlFor="uuid">
              UUID
              <input
                type="text"
                id="uuid"
                className="knot-info-text"
                onChange={e => this.setState({ uuid: e.target.value })}
              />
            </label>
          </div>
          <div className="knot-info">
            <label htmlFor="token">
              TOKEN
              <input
                type="text"
                id="token"
                className="knot-info-text"
                onChange={e => this.setState({ token: e.target.value })}
              />
            </label>
          </div>
          <button type="button" className="btn" onClick={this.getDevices}>
            GET DEVICES
          </button>
        </div>
        <div className="list-devices-wrapper">
          {_.isEmpty(devices) ? <div /> : <this.createDeviceList className="list-devices" />}
        </div>
      </div>
    );
  }
}

export default App;
