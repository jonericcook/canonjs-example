import { useState, useEffect, ChangeEvent } from "react";
import { Toaster, toast } from "sonner";
import { Address4 } from "ip-address";
import { ccapi, Camera, SupportedApis } from "canonjs";
import { safe, newTimeoutAbortSignal } from "../utils/utils";
import InfoCard from "../components/InfoCard";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

enum CameraModes {
  Camera = "camera",
  Video = "video",
}

function App() {
  let [cameraModel, setCameraModel] = useState("");
  let [tempIpAddress, setTempIpAddress] = useState("");
  let [ipAddress, setIpAddress] = useState("");
  let [supportedApis, setSupportedApis] = useState({});
  let [cameraMode, setCameraMode] = useState("");
  let [makingRequest, setMakingRequest] = useState(false);

  function disabled(): boolean {
    if (makingRequest) return true;
    if (!Address4.isValid(tempIpAddress)) return true;
    return false;
  }

  function handleTempIpAddressChange(e: ChangeEvent<HTMLInputElement>) {
    setTempIpAddress(e.currentTarget.value);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (ipAddress !== "") {
        const poll = () => {
          const camera = Camera(ipAddress, supportedApis);
          const versions = camera.polling.versions();
          if (versions.length === 0) {
            return Promise.reject("polling versions is empty");
          }
          const version = versions.pop();
          if (version === undefined) {
            return Promise.reject("polling version is undefined");
          }
          return camera.polling.get(version as string, {
            signal: newTimeoutAbortSignal(2000),
          });
        };
        Promise.allSettled([poll()]).then((values) => {
          values.forEach((value) => {
            if (value.status === "fulfilled") {
              const movieMode = value.value.data.moviemode
                ? value.value.data.moviemode.status
                : undefined;
              if (movieMode) {
                if (movieMode === "on") {
                  setCameraMode(CameraModes.Video);
                }
                if (movieMode === "off") {
                  setCameraMode(CameraModes.Camera);
                }
              }
            }
          });
        });
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [ipAddress]);

  const handleSubmit = async () => {
    setMakingRequest(true);
    const ccapiResponse = await safe(
      ccapi(tempIpAddress, newTimeoutAbortSignal(4000))
    );
    if (!ccapiResponse.success) {
      setMakingRequest(false);
      toast.error("camera couldn't be reached");
      return;
    }
    const supportedApis: SupportedApis = ccapiResponse.data.data;
    const camera = Camera(tempIpAddress, supportedApis);
    if (camera.networkSetting.supported()) {
      const versions = camera.networkSetting.versions();
      if (versions.length === 0) {
        setMakingRequest(false);
        toast.error("network setting versions is empty");
        return;
      }
      const version = versions.pop();
      if (version === undefined) {
        setMakingRequest(false);
        toast.error("network version is undefined");
        return;
      }
      const networkSettingsResponse = await safe(
        camera.networkSetting.get(version)
      );
      if (!networkSettingsResponse.success) {
        setMakingRequest(false);
        toast.error("failed to get network settings");
        return;
      }
      const networkSettingsEndpoints =
        networkSettingsResponse.data.data[version];
      supportedApis[version] = supportedApis[version].concat(
        networkSettingsEndpoints
      );
    }
    const deviceInformationVersions = camera.deviceInformation.versions();
    const deviceInformationVersion = deviceInformationVersions.pop();
    if (deviceInformationVersion === undefined) {
      setMakingRequest(false);
      toast.error("device inforation version is undefined");
      return;
    }
    const deviceInformationResponse = await safe(
      camera.deviceInformation.get(deviceInformationVersion)
    );
    if (!deviceInformationResponse.success) {
      setMakingRequest(false);
      toast.error("failed to get device information");
      return;
    }
    const movieModeVersions = camera.movieMode.versions();
    const movieModeVersion = movieModeVersions.pop();
    if (movieModeVersion === undefined) {
      setMakingRequest(false);
      toast.error("movie mode version is undefined");
      return;
    }
    const movieModeResponse = await safe(
      camera.movieMode.get(movieModeVersion)
    );
    if (!movieModeResponse.success) {
      setMakingRequest(false);
      toast.error("failed to get movie mode");
      return;
    }
    const movieMode =
      movieModeResponse.data.data["status"] === "on"
        ? CameraModes.Video
        : CameraModes.Camera;

    setMakingRequest(false);
    setIpAddress(tempIpAddress);
    setCameraModel(deviceInformationResponse.data.data["productname"]);
    setSupportedApis(supportedApis);
    setCameraMode(movieMode);
    toast.success("camera reached");
  };
  return (
    <>
      <Toaster position="top-left" />
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ marginTop: "3rem", marginBottom: "2rem" }}
      >
        <Card
          style={{
            width: "25rem",
            boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
          }}
        >
          <Card.Body>
            <Card.Title style={{ fontSize: "50px" }}>canonjs</Card.Title>
            <InputGroup className="mb-3">
              <Form.Control
                placeholder="camera's IPv4 address"
                aria-label="camera's IPv4 address"
                aria-describedby="basic-addon2"
                onChange={handleTempIpAddressChange}
                value={tempIpAddress}
              />
              <Button
                onClick={handleSubmit}
                disabled={disabled()}
                variant="primary"
                id="button-addon2"
              >
                Submit
              </Button>
            </InputGroup>
          </Card.Body>
        </Card>
      </div>

      {ipAddress && (
        <InfoCard cameraMode={cameraMode} cameraModel={cameraModel} />
      )}
    </>
  );
}

export default App;
