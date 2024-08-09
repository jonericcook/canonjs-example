import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera, faVideo } from "@fortawesome/free-solid-svg-icons";
import Card from "react-bootstrap/Card";

function InfoCard({
  cameraModel,
  cameraMode,
}: {
  cameraModel: string;
  cameraMode: string;
}) {
  return (
    <div className="d-flex justify-content-center align-items-center">
      <Card
        style={{
          boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
        }}
      >
        <Card.Body>
          <Card.Title>
            {cameraModel}{" "}
            <FontAwesomeIcon
              style={{ marginLeft: "1rem" }}
              size="2xl"
              icon={cameraMode === "video" ? faVideo : faCamera}
            />
          </Card.Title>
        </Card.Body>
      </Card>
    </div>
  );
}

export default InfoCard;
