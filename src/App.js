import React, { useState, useRef, Fragment, useEffect } from "react";
import useSwr from "swr";
import ReactMapGL, { Marker, FlyToInterpolator, Popup } from "react-map-gl";
import useSupercluster from "use-supercluster";
import "./App.css";
import policeData from "./data/police.json";

const fetcher = (...args) => fetch(...args).then(response => response.json());

export default function App() {
  const [viewport, setViewport] = useState({
    latitude: 23.697809,
    longitude: 120.960518,
    width: "100vw",
    height: "100vh",
    zoom: 7
  });
  const mapRef = useRef();

  const [position, setPosition] = useState({ latitude: null, longitude: null });
  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      console.log('latitude, longitude', latitude, longitude);
      setPosition({ latitude, longitude });
      setViewport((prev) => ({
        ...prev,
        latitude,
        longitude,
        transitionInterpolator: new FlyToInterpolator({
          speed: 2
        }),
        transitionDuration: "auto",
        zoom: 15
      }))
    });
  };

  // useEffect(() => {
  //   const geo = navigator.geolocation;
  //   if (!geo) {
  //     console.log("Geolocation is not supported");
  //     return;
  //   }
  //   getCurrentPosition();
  // }, []);

  // const points = [policeData.find(x => x.id === 1288)].map(police => ({
  const points = policeData.map(police => ({
    type: "Feature",
    properties: { cluster: false, policeId: police.id, stationName: police.name, stationAddress: police.address },
    geometry: {
      type: "Point",
      coordinates: [
        parseFloat(police.lon),
        parseFloat(police.lat),
      ]
    }
  }));

  const bounds = mapRef.current
    ? mapRef.current
      .getMap()
      .getBounds()
      .toArray()
      .flat()
    : null;

  const { clusters, supercluster } = useSupercluster({
    points,
    bounds,
    zoom: viewport.zoom,
    options: { radius: 75, maxZoom: 20 }
  });
  const [selectedPoliceStation, setSelectedPoliceStation] = useState(null);

  return (
    <div>
      <ReactMapGL
        {...viewport}
        maxZoom={20}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        onViewportChange={newViewport => {
          setViewport({ ...newViewport });
        }}
        ref={mapRef}
        mapStyle="mapbox://styles/kkadso/ck5kb9pij0j5x1iqi41c6hd12"
      >
        {clusters.map(cluster => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {
            cluster: isCluster,
            point_count: pointCount
          } = cluster.properties;

          if (isCluster) {
            return (
              <Marker
                key={`cluster-${cluster.id}`}
                latitude={latitude}
                longitude={longitude}
              >
                <div
                  className="cluster-marker"
                  style={{
                    width: `${10 + (pointCount / points.length) * 20}px`,
                    height: `${10 + (pointCount / points.length) * 20}px`
                  }}
                  onClick={() => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      20
                    );

                    setViewport({
                      ...viewport,
                      latitude,
                      longitude,
                      zoom: expansionZoom,
                      transitionInterpolator: new FlyToInterpolator({
                        speed: 2
                      }),
                      transitionDuration: "auto"
                    });
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          return (
            <Fragment>
              <Marker
                key={`crime-${cluster.properties.policeId}`}
                latitude={latitude}
                longitude={longitude}
              >
                <button className="crime-marker" onClick={e => {
                  e.preventDefault();
                  setSelectedPoliceStation(cluster);
                }}>
                  <img src="/police.svg" alt="crime doesn't pay" />
                </button>
              </Marker>
              {
                selectedPoliceStation ? (
                  <Popup
                    latitude={selectedPoliceStation.geometry.coordinates[1]}
                    longitude={selectedPoliceStation.geometry.coordinates[0]}
                    onClose={() => {
                      setSelectedPoliceStation(null);
                    }}
                  >
                    <div>
                      <h2>{selectedPoliceStation.properties.stationName}</h2>
                      <p>{selectedPoliceStation.properties.stationAddress}</p>
                    </div>
                  </Popup>
                ) : null
              }
            </Fragment>
          );
        })}
        {position.latitude && position.longitude && <Marker
          key="where-am-i"
          className="where-am-i"
          latitude={position.latitude}
          longitude={position.longitude}
        >
          <img src="/custody.svg" alt="crime doesn't pay" />
        </Marker>}
        <button onClick={getCurrentPosition}>Get Current Position</button>
        <p className="sponsor">Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a></p>
      </ReactMapGL>
    </div>
  );
}
