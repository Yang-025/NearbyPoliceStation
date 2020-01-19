import React, { useState, useRef, Fragment } from "react";
import useSwr from "swr";
import ReactMapGL, { Marker, FlyToInterpolator } from "react-map-gl";
import useSupercluster from "use-supercluster";
import "./App.css";
import policeData from "./data/police.json";

const fetcher = (...args) => fetch(...args).then(response => response.json());

export default function App() {
  const [viewport, setViewport] = useState({
    // latitude: 52.6376,
    // longitude: -1.135171,
    latitude: 23.697809,
    longitude: 120.960518,
    width: "100vw",
    height: "100vh",
    // width: 400,
    // height: 400,
    zoom: 7
  });
  const mapRef = useRef();

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
          console.log('cluster', cluster);
          // const [latitude, longitude] = cluster.geometry.coordinates;
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
                  console.log(cluster.properties);
                }}>
                  <img src="/police.svg" alt="crime doesn't pay" />
                </button>
              </Marker>
              {/* {
                selectedPark ? (
                  <Popup
                    latitude={selectedPark.geometry.coordinates[1]}
                    longitude={selectedPark.geometry.coordinates[0]}
                    onClose={() => {
                      setSelectedPark(null);
                    }}
                  >
                    <div>
                      <h2>{selectedPark.properties.NAME}</h2>
                      <p>{selectedPark.properties.DESCRIPTIO}</p>
                    </div>
                  </Popup>
                ) : null
              } */}
            </Fragment>
          );
        })}
        Icons made by <a href="https://www.flaticon.com/authors/freepik" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>
      </ReactMapGL>
    </div>
  );
}
