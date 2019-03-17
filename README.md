# homecam
Web services interface for my DLINK camera (reverse engineered).

## Docker

My image support multiple architectures such as x86-64 and arm32v7. I use the docker manifest for multi-platform awareness.

Simply pull yo1l/homecam should retrieve the correct image for your architecture.

```
docker pull yo1l/homecam
```

The architectures supported by this image are:

Architecture | Tag
--- | ---
x86-64 | amd64
arm32v7 | arm32v7

## Usage

### docker

```
docker create \
  --name=homecam \
  -p 3000:3000
  -e "CAMERA_IP=192.168.0.1" \
  -e "CAMERA_USERNAME=root" \
  -e "CAMERA_PASSWORD=secret" \
  -e "HTTP_PORT=3000" \
  -e "SLACK_WEBHOOK_URL=https://hooks.slack.com/services/truc/muche/token" \
  -e "SLACK_ROOM=general" \
  -e "SLACK_ICON=':camera_with_flash:'" \
  yo1l/homecam
```

### docker-compose

#### environment variables
```
version: "3"
services:
  homecam:
    image: yo1l/homecam
    environment:
      - CAMERA_IP=192.168.0.1
      - CAMERA_USERNAME=root
      - CAMERA_PASSWORD=secret
      - HTTP_PORT=3000
      - SLACK_WEBHOOK_URL=https://hooks.slack.com/services/truc/muche/token
      - SLACK_ROOM=general
      - SLACK_ICON=':camera_with_flash:'
    ports:
      - 3000:3000
    restart: unless-stopped
```

#### environment file
```
version: "3"
services:
  homecam:
    image: yo1l/homecam
    volumes:
      - /root/.env:/usr/src/app/.env
    ports:
      - 3000:3000
    restart: unless-stopped
```

### Parameters

Variable | Description
--- | ---
CAMERA_IP | IP Adresse of your camera with or without port. Ex: 192.168.0.5:5000
CAMERA_USERNAME | Admin username of the camera
CAMERA_PASSWORD | Admin password of the camera
HTTP_PORT | WEB Port for this server
SLACK_WEBHOOK_URL | Slack webhook url
SLACK_ROOM | slack room to send the status notification message 
SLACK_ICON | Icon

## API

Endpoint | Description 
--- | ---
**/camera/status** | get human readable status of the camera ("ON" or "OFF") and send the result to slack 
**/camera/state/on** | switch on the camera 
**/camera/state/off** | switch off the camera 
**/camera/toggle** | toggle status of the camera 

## Unit tests

Unit tests are available to check the Camera proxy which is responsible for sending commands to the camera.
```
npm run test
```

## TODO
*  [ ] Authentification
*  [ ] Automate docker manifest creation
