# canonjs example

This simple React app shows how to use `canonjs`.

## Prepare Camera

This has to be done so the web app can make requests to the camera.

**Enable CORS**

- `curl --location --request PUT 'http://<camera_ip_address>/ccapi/ver100/functions/cors/corssetting' \
--header 'Content-Type: application/json' \
--data '{
    "value": "enable"
}'`

**Set origin to `*`**

- `curl --location --request PUT 'http://<camera_ip_address>/ccapi/ver100/functions/cors/origin' \
--header 'Content-Type: application/json' \
--data '{
    "origin": "*"
}'`

## Start App

`npm install`
`npm run dev`

## Note

If you change the camera mode (ie from video from camera) the app will pick this up and display the appropriate icon.
