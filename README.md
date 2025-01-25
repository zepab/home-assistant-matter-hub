![Home Assistant Matter Hub](https://github.com/t0bst4r/home-assistant-matter-hub/blob/main/packages/documentation/assets/hamh-logo-small.png?raw=true)

# Home-Assistant-Matter-Hub

This project simulates bridges to publish your entities from Home
Assistant to any Matter-compatible controller like Alexa, Apple Home
or Google Home. Using Matter, those can be connected easily using
local communication without the need of port forwarding etc.

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/t0bst4r)

## Table of contents

1. [Installation](#1-installation)
   1. [Native Home-Assistant-AddOn](#11-native-home-assistant-addon)
   2. [Docker Image](#12-docker-image)
   3. [Manual Installation using npm](#13-manual-installation-using-npm)
2. [Configuration](#2-configuration)
3. [Bridge Configuration](#3-bridge-configuration)
4. [Frequently Asked Questions & Troubleshooting](#4-frequently-asked-questions--troubleshooting)
5. [Supported Domains / Device Types](#5-supported-domains--device-types)

## Prerequisites

To successfully pair the bridge with your Controller (e.g. Alexa, Google Home, Apple Home) it is recommended to have
**IPv6 enabled in your local network**. Additionally, it is not recommended to place both in different VLANs.

There were some users who got that working, but this can break any time due to

## 1. Installation

This application can be installed in three different ways:

1. Home-Assistant AddOn for Home Assistant OS (preferred)
2. Ready to use Docker Image
3. Manual installation using `npm`

### 1.1 Native Home-Assistant AddOn

> [!WARNING]
> Home Assistant AddOns can only be used with Home Assistant OS.

Simply add the following GitHub Repository URL to your Home Assistant AddOn Store.

> https://github.com/t0bst4r/home-assistant-addons

1. Open the UI of your Home Assistant instance
2. Go to `Settings` -> `Add-Ons` -> `Add-On Store`
3. Click the three dots in the top-right corner and select `Repositories`
4. Paste the repository URL into the text-field and click "Add"
5. Refresh your Add-On Store and Install the Add-On
6. You can configure the log level and the port of the Web UI in the AddOn configuration page

### 1.2 Docker Image

This repository builds a docker image for every release. You can simply run it by using `docker-compose`:

```yaml
services:
  matter-hub:
    image: ghcr.io/t0bst4r/home-assistant-matter-hub:latest
    restart: unless-stopped
    network_mode: host
    environment: # more options can be found in the configuration section
      - HAMH_HOME_ASSISTANT_URL=http://192.168.178.123:8123/
      - HAMH_HOME_ASSISTANT_ACCESS_TOKEN=ey...ZI
      - HAMH_LOG_LEVEL=info
      - HAMH_HTTP_PORT=8482
    volumes:
      - $PWD/home-assistant-matter-hub:/data
```

Then you can simply run `docker compose up -d` to start the container.

In the docker image the application stores its data in `/data`, so you can mount a volume there to
persist it, but you could change that by setting the `HAMH_STORAGE_LOCATION` variable.

Alternatively, you can also run the container as follows:

```bash
docker run -d \
  # more options can be found in the configuration section
  # required: the address of your home assistant instance
  -e HAMH_HOME_ASSISTANT_URL="http://192.168.178.123:8123/" \
  # required: a long lived access token for your home assistant instance
  -e HAMH_HOME_ASSISTANT_ACCESS_TOKEN="eyJ.....dlc" \
  # optional: debug | info | warn | error
  # default: info
  -e HAMH_LOG_LEVEL="info" \
  # optional: the port to use for the web ui
  # default: 8482
  -e HAMH_HTTP_PORT=8482 \
  # recommended: persist the configuration and application data
  -v $PWD/home-assistant-matter-hub:/data \
  # required due to restrictions in matter
  --network=host \
  ghcr.io/t0bst4r/home-assistant-matter-hub:latest
```

> [!WARNING]
> Make sure your docker installation has IPv6 enabled, too.
> See [this guide](https://fariszr.com/docker-ipv6-setup-with-propagation/) for more information.
>
> If you are running docker on a NAS, make sure to enable IPv6 in the NAS settings, too.

### 1.3 Manual installation using `npm`

If you want to install this application by hand, you simply need to run

```bash
npm install -g home-assistant-matter-hub
```

To start the application, run

```bash
home-assistant-matter-hub start \
  # required: the address of your home assistant instance
  # can be replaced with an environment variable: HAMH_HOME_ASSISTANT_URL
  --home-assistant-url="http://192.168.178.123:8123/" \
  # required: a long lived access token for your home assistant instance
  # can be replaced with an environment variable: HAMH_HOME_ASSISTANT_ACCESS_TOKEN
  --home-assistant-access-token="eyJ.....dlc" \
  # optional: debug | info | warn | error
  # default: info
  # can be replaced with an environment variable: HAMH_LOG_LEVEL
  --log-level=info \
  # optional: the port to use for the web ui
  # default: 8482
  # can be replaced with an environment variable: HAMH_WEB_PORT
  --http-port=8482
```

The application will store its data in `$HOME/.home-assistant-matter-hub`. You can configure the storage path by
using the `--storage-location=/path/to/storage` option or `HAMH_STORAGE_STORAGE` environment variable.

## 2. Configuration

Due to its advanced configuration options it is not possible to simply configure everything with environment variables
or command line parameters. Therefore, bridges are configured within the application itself. General app configuration
is
done using the CI or environment variables. The following parameters are available:

```
home-assistant-matter-hub start

start the application

Options:
  --help                         Show help                                                                                         [boolean]
  --config                       Provide the path to a configuration JSON file, which can include all the other command options. You can use
                                  kebabcase ("log-level") or camelcase ("logLevel").
  --log-level                                                [string] [choices: "silly", "debug", "info", "warn", "error"] [default: "info"]
  --disable-log-colors                                                                                            [boolean] [default: false]
  --storage-location             Path to a directory where the application should store its data. Defaults to $HOME/.home-assistant-matter-h
                                 ub                                                                                                 [string]
  --http-port, --web-port        Port used by the web application. 'http-port' is recommended, 'web-port' is deprecated and will be removed
                                 in the future.                                                                     [number] [default: 8482]
  --http-ip-whitelist            Only allow the specified IPv4, IPv6 or CIDR. You can specify this option multiple times. When configured vi
                                 a ENV variables, you can only specify ONE value. Defaults to allow every IP address.                [array]
  --mdns-network-interface       Limit mDNS to this network interface                                                               [string]
  --home-assistant-url           The HTTP-URL of your Home Assistant URL                                                 [string] [required]
  --home-assistant-access-token  A long-lived access token for your Home Assistant Instance                              [string] [required]
```

Each of those configuration options can be configured via environment variables, too. Simply prefix them with `HAMH_`
and write them in capslock with underscores (e.g. `HAMH_MDNS_NETWORK_INTERFACE`).

**Those configuration options are not needed for the Home Assistant Addon Installation type.**

## 3. Bridge Configuration

Using the User Interface you can set up multiple bridges and configure each to use different filters for your entities.
Each bridge will be completely independent of the others and uses its own port for matter.

> [!NOTE]
> You can use **one** bridge to connect to **multiple** controllers.

> [!WARNING]
> Alexa only supports port `5540`. Therefore, you cannot create multiple bridges to connect with Alexa.

Every bridge has to have a `name` (string), `port` (number) and `filter` (object) property. The filter property has to
include an `include` (array) and an `exclude` (array) property.

```json
{
  "name": "My Hub",
  "port": 5540,
  "filter": {
    "include": [],
    "exclude": []
  }
}
```

A include- or exclude-item is an object having a `type` and a `value` property.
The `type` can be one of:

- `pattern` - a pattern matching your entity ids
- `domain` - the domain you want to include or exclude
- `platform` - the integration you want to include or exclude
- `entity_category` -
  the [entity category](https://developers.home-assistant.io/docs/core/entity/#registry-properties) (`configuration` /
  `diagnostic`) you want to include or exclude
- `label` - the slug of a label you want to include or exclude
- `area` - the slug of an area you want to include or exclude

The `value` property is a string containing the corresponding value. You can add multiple include or exclude rules which
are then combined.
All entities which match one of the include-rules will be included, but all entities which match one of the exclude
rules will be excluded.

> [!WARNING]
> When performing changes on entities, like adding or removing a label, you need to restart the matter-hub application
> for the changes to take effect, or you can edit the bridge and save it without any changes.

```json
{
  "name": "My Hub",
  "port": 5540,
  "filter": {
    "include": [
      {
        "type": "label",
        "value": "my_voice_assist"
      },
      {
        "type": "pattern",
        "value": "light.awesome*"
      }
    ],
    "exclude": [
      {
        "type": "platform",
        "value": "hue"
      },
      {
        "type": "domain",
        "value": "fan"
      },
      {
        "type": "entity_category",
        "value": "diagnostic"
      }
    ]
  }
}
```

> [!WARNING]
>
> - Labels and areas in Home Assistant are technically represented by their "slugs".
> - Slugs are technical identifiers used in the background.
> - Slugs are always lowercase and only allow a-z and underscores, so everything else will be replaced with an underscore.
> - Even when renaming a label or area, the slug doesn't change. Never.
>
> You can retrieve the slug using the followiung templates in Home Assistant:
>
> - `{{ labels() }}` - returns all labels
> - `{{ labels("light.my_entity") }}` - returns the labels of a specific entity
> - `{{ areas() }}` - returns all areas

## 4. Frequently Asked Questions & Troubleshooting

Please review
the [Documentation](https://github.com/t0bst4r/home-assistant-matter-hub/blob/main/packages/documentation/README.md) for
more details and Frequently Asked Questions.

## 5. Supported Domains / Device Types

| Domain        | Represented as Device Class                                          | Comment                                                                                                                                                                                                                                             |
| ------------- | -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| light         | OnOffLight, DimmableLight, ColorTemperatureLight, ExtendedColorLight | Depends on the supported features attribute of the device.                                                                                                                                                                                          |
| switch        | OnOffPlugInUnit                                                      |                                                                                                                                                                                                                                                     |
| lock          | DoorLock                                                             |                                                                                                                                                                                                                                                     |
| fan           | OnOffPlugInUnit                                                      | Fans are supported in the matter specification, but they are not yet supported by Voice Assistants like Alexa, Google or Apple.                                                                                                                     |
| binary_sensor | ContactSensor, OccupancySensor, WaterLeakDetector                    | All device-classes which are explicitly implemented, are mapped to contact sensor. Feel free to open a PR to improve this.<br/>Water Leak Detectors are not supported by every controller.                                                          |
| sensor        | TemperatureSensor, HumiditySensor                                    | Currently only Temperature and Humidity are supported. Feel free to open a PR to improve this.                                                                                                                                                      |
| cover         | WindowCovering                                                       |                                                                                                                                                                                                                                                     |
| climate       | Thermostat                                                           |                                                                                                                                                                                                                                                     |
| input_boolean | OnOffPlugInUnit                                                      |                                                                                                                                                                                                                                                     |
| script        | OnOffPlugInUnit                                                      |                                                                                                                                                                                                                                                     |
| automation    | OnOffPlugInUnit                                                      |                                                                                                                                                                                                                                                     |
| scene         | OnOffPlugInUnit                                                      |                                                                                                                                                                                                                                                     |
| button        | OnOffPlugInUnit                                                      |                                                                                                                                                                                                                                                     |
| media_player  | OnOffPlugInUnit                                                      | Media Players are not supported by most controllers. Therefore, they are exposed as on-off-plugin units. If you still want to try Speaker Devices with your controller, you can activate it using the `Feature Flags` in your Bridge configuration. |
| humidifier    | OnOffPlugInUnit                                                      | Matter does not support humidifiers yet. Therefore, mapped to an OnOffPlugInUnit with Level Control.                                                                                                                                                |

## 6. Additional Resources

If you need more assistance on the topic, please have a look at the following external resources:

### Videos

#### YouTube-Video on "HA Matter HUB/BRIDGE 😲 👉 Das ändert alles für ALEXA und GOOGLE Nutzer" (🇩🇪)

[![HA Matter HUB/BRIDGE 😲 👉 Das ändert alles für ALEXA und GOOGLE Nutzer](https://img.youtube.com/vi/yOkPzEzuVhM/mqdefault.jpg)](https://www.youtube.com/watch?v=yOkPzEzuVhM)
