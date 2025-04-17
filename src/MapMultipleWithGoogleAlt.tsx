import React from 'react'
import { useState} from "react";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'

const containerStyle = {
  width: '900px',
  height: '700px',
}

export default function MapMultipleWithGoogleAlt(props) {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [zoom, setZoom] = useState(4);
  const [center, setCenter] = useState({
    lat: props.markers[0].lattitude,
    lng: props.markers[0].longitude,
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

  return   isLoaded ? (
    <React.Fragment>
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {props.markers.map(marker => (marker.gpsLat == 0 ? null : 
        <Marker
          position={{ lat: marker.lattitude, lng: marker.longitude }}
          key={marker.id}
          label={props.points ? "(" + marker.status + ")" : null}
          onMouseOver={(m) => {
              setSelectedCenter(marker);
              setCenter( { lat: marker.lattitude, lng: marker.longitude});
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
        lat: selectedCenter.lattitude,
        lng: selectedCenter.longitude
      }}
      options={{ pixelOffset: new window.google.maps.Size(0, -40)}}
   ><div><p><b>{"Transaction status of " + selectedCenter.status + (selectedCenter.notes && selectedCenter.notes != null ? ' - ' + selectedCenter.notes : '')}</b></p><p>{'Created ' + selectedCenter.created}</p><p>{'by ' + selectedCenter.createdBy}</p></div></InfoWindow> )}
      <></>
    </GoogleMap>
    </React.Fragment>
  ) : (
    <></>
  )
}
