import React from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

const containerStyle = {
  width: '500px',
  height: '500px',
}

export default function MapMultipleWithGoogle(props) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: props.googleAPI,
  })

  const center = {
    lat: props.markers[0].gpsLat,
    lng: props.markers[0].gpsLong,
  }

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
      zoom={15}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {props.markers.map(marker => (
        <Marker
          position={{ lat: marker.gpsLat, lng: marker.gpsLong }}
          key={marker.id}
        />
      ))}
      <></>
    </GoogleMap>
  ) : (
    <></>
  )
}
