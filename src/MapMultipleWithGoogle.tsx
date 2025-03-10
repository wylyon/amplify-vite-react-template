import React from 'react'
import { useState} from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'

const containerStyle = {
  width: '900px',
  height: '700px',
}

export default function MapMultipleWithGoogle(props) {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [zoom, setZoom] = useState(4);
  const [center, setCenter] = useState({
    lat: props.markers[0].gpsLat,
    lng: props.markers[0].gpsLong,
  });
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: props.googleAPI,
  })

  const [map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center)
    //map.fitBounds(bounds)

    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {props.markers.map(marker => (marker.gpsLat == 0 ? null : 
        <Marker
          position={{ lat: marker.gpsLat, lng: marker.gpsLong }}
          key={marker.id}
      //    label={"(" + marker.locationId + ")"}
          onMouseOver={(m) => {
              setSelectedCenter(marker);
              setCenter( { lat: marker.gpsLat, lng: marker.gpsLong});
         }}
          onRightClick={(m) => {
            setZoom(4);
          }}
          onClick={(m) => {
            setZoom(15);
          }}
        />
      ))}
      {selectedCenter && (
   <InfoWindow
      onCloseClick={() => {
         setSelectedCenter(null);
      }}
      position={{
        lat: selectedCenter.gpsLat,
        lng: selectedCenter.gpsLong
      }}
      options={{ pixelOffset: new window.google.maps.Size(0, -40)}}
   ><div><p><b>{selectedCenter.title}</b></p><p>{'Created ' + selectedCenter.created}</p><p>{'by ' + selectedCenter.createdBy}</p></div></InfoWindow> )}
      <></>
    </GoogleMap>
  ) : (
    <></>
  )
}
