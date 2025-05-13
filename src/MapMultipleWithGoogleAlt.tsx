import React from 'react'
import { useState, useRef, useCallback} from "react";
import { StorageImage } from '@aws-amplify/ui-react-storage';
import { downloadData } from 'aws-amplify/storage';
import Box  from '@mui/material/Box';
import moment from 'moment';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import { Button } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { Stack } from '@mui/material';
import TextField from '@mui/material/TextField';
import NearMeIcon from '@mui/icons-material/NearMe';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api'

const containerStyle = {
  width: '900px',
  height: '600px',
}

export default function MapMultipleWithGoogleAlt(props) {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [zoom, setZoom] = useState(5);
  const [videoURL, setVideoURL] = useState('');
  const [center, setCenter] = useState({
    lat: props.markers[0].lattitude,
    lng: props.markers[0].longitude,
  });

  const [directions, setDirections] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [alignment, setAlignment] = useState(null);

  const handleGetDirections = () => {
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK') {
          setDirections(response);
        } else {
          console.error(`Directions request failed due to ${status}`);
        }
      }
    );
  };
  
  const handleGetDirectionsAll = () => {
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: {
          lat: props.markers[0].lattitude,
          lng: props.markers[0].longitude,
        },
        destination: {
          lat: props.markers[props.markers.length - 1].lattitude,
          lng: props.markers[props.markers.length - 1].longitude,
        },
        waypoints: props.markers.slice(1, -1).map((location) => ({
          location: { lat: location.lattitude,
              lng: location.longitude },
          stopover: true,
        })),
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK') {
          setDirections(response);
        } else {
          console.error(`Directions request failed due to ${status}`);
        }
      }
    );
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: props.googleAPI
  })

  const [map, setMap] = useState(/** @type google.maps.Map */ (null));
  const mapRef = useRef(null);

  const onLoad = React.useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    const bounds = new window.google.maps.LatLngBounds(center)
    //map.fitBounds(bounds)
    mapRef.current = map;
    setMap(map)
  }, [])

  const monitorDownloadPhoto = async(photoAddress) => {
    const downloadResult = await downloadData({
			path: "picture-submissions/" + photoAddress
		}).result;
		const fileName = photoAddress.split("/")[1];
		const myFile = await downloadResult.body.blob();
		setVideoURL(URL.createObjectURL(myFile));
  }

  const handlePhotoVideo = async(email, photoAddress) => {
    const fileName = photoAddress;
    const fileExt = fileName.split(".");
    if (fileExt.length > 1) {
			const ext = fileExt[1];
			if (ext == "mp4" || ext == "MP4" || ext == "mov" || ext == "MOV" ) {
				await monitorDownloadPhoto(email + "/" + photoAddress);
			}
		}
  }

  const handleAlignment = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string | null,
  ) => {
    setAlignment(newAlignment);
  };

  const resetDirections = () => {
    setOrigin(null);
    setDestination(null);
    setDirections(null);
  }

  const handleMapClick = (event) => {
    const latLng = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    if (alignment) {
      if (alignment == 'origin') {
        setOrigin(latLng);
      } else if (alignment == 'destination') {
        setDestination(latLng);
      }
    }
  };

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
      onClick={handleMapClick}
    >
      {directions && <DirectionsRenderer directions={directions} />}
      {props.markers.map(marker => (marker.gpsLat == 0 ? null : 
        <Marker
          position={{ lat: marker.lattitude, lng: marker.longitude }}
          key={marker.id}
          icon={{
            url: marker.status == 'Open' ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' :
              marker.status == 'Closed' ? 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' :
              'http://maps.google.com/mapfiles/ms/icons/orange-dot.png',
          }}
          label={props.points ? marker.status.substring(0,1) : null}
          onRightClick={(m) => {
            setZoom(4);
          }}
          onClick={(m) => {
            if (zoom < 10) {
              setSelectedCenter(marker);
              setCenter( { lat: marker.lattitude, lng: marker.longitude});
              setZoom(15);
            } else {
              setSelectedCenter(marker);
              setCenter( { lat: marker.lattitude, lng: marker.longitude});
            }
            if (alignment && alignment == 'origin' && origin == null) {
              setOrigin({ lat: marker.lattitude, lng: marker.longitude})
            } else if (alignment && alignment == 'destination' && destination == null) {
              setDestination({ lat: marker.lattitude, lng: marker.longitude});
            }
          }}
        />
      ))}
      {selectedCenter && (
    <InfoWindow
        onCloseClick={() => {
          setSelectedCenter(null);
          if (videoURL != '') {
            URL.revokeObjectURL(videoURL);
            setVideoURL('');
          }
        }}
        onLoad={() => {
          handlePhotoVideo(selectedCenter.createdBy, selectedCenter.photoAddress);
        }}
        position={{
          lat: selectedCenter.lattitude,
          lng: selectedCenter.longitude
        }}
        options={{ pixelOffset: new window.google.maps.Size(0, -40)}}>
          <div>
            <p><b>{selectedCenter.createdBy}</b></p>
            <p><b>{moment(selectedCenter.created).format('MM-DD-YYYY 23:00:00') + ' - ' + selectedCenter.status}</b></p>
            <p><b>{selectedCenter.notes}</b></p>
            <p><b>{selectedCenter.what3words}</b></p>
            {props.custom.map(comp => (
              <p><b>{selectedCenter[comp.question]}</b></p>
            ))}
            <Box sx={{ width: 200, height: 400}}>
            {videoURL == '' ? selectedCenter.photoAddress != '' ? 
              <StorageImage alt={selectedCenter.createdBy + "/" + selectedCenter.photoAddress} height={400} width={200}
              path={"picture-submissions/" + selectedCenter.createdBy + "/" + selectedCenter.photoAddress}/> : "<< No Photo Available >>" 
              : <video src={videoURL} width={200} height={400} controls />
            }
            </Box>
          </div>
      </InfoWindow> )}
      <></>
    </GoogleMap>
    <div>
      <Stack direction='column' spacing={2}>
        <Stack direction='row'>
          <Button variant='contained' color='info' disabled={!origin || !destination} onClick={handleGetDirections}>Get Directions</Button>
          <Button variant='contained' color='info' disabled={props.markers.length < 2} onClick={handleGetDirectionsAll}>Directions All Markers</Button>
          <Button variant='contained' color='error' onClick={resetDirections}>Reset</Button>
          <ToggleButtonGroup
            value={alignment}
            exclusive
            onChange={handleAlignment}
            aria-label="text alignment"
          >
            <ToggleButton value="origin" aria-label="origin-align">Set Origin</ToggleButton>
            <ToggleButton value="destination" aria-label="dest-align">Set Destination</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Stack direction='row'>
          {origin || alignment == 'manual' ? 
          <Stack direction='row'>
              <TextField id="origin-text" label="Origin" variant='outlined'
              value={origin ? typeof origin === 'object' ? origin.lat + ',' + origin.lng : origin : ''} 
              onChange={(e) => setOrigin(e.target.value)} 
              /> 
            {origin ?
            <Tooltip title='Pan to origin location'>
              <IconButton aria-label="origin-loc" onClick={(e) => mapRef.current.panTo(origin)}><NearMeIcon /></IconButton>
            </Tooltip> : null}
          </Stack>
            : null }
          {destination || alignment == 'manual' ? 
          <Stack direction='row'>
              <TextField id="destination-text" label="Destination" variant='outlined'
                value={destination ? typeof destination === 'object' ? destination.lat + ',' + destination.lng : destination : ''} 
                onChange={(e) => setDestination(e.target.value)} 
              /> 
            {destination ?
            <Tooltip title='Pan to destination location'>
              <IconButton aria-label="origin-loc" onClick={(e) => mapRef.current.panTo(destination)}><NearMeIcon /></IconButton>
            </Tooltip> : null}
          </Stack>
          : null}
        </Stack>
      </Stack>
      {directions && (
        <div>
          <h2>Directions Details</h2>
          {directions.routes[0].legs.map((leg, legIndex) => (
            <div key={legIndex}>
              <h3>Leg {legIndex + 1}</h3>
              <p>Distance: {leg.distance.text}</p>
              <p>Duration: {leg.duration.text}</p>
              <ul>
                {leg.steps.map((step, stepIndex) => (
                  <li key={stepIndex} dangerouslySetInnerHTML={{ __html: step.instructions }} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
          </div>
    </React.Fragment>
  ) : (
    <></>
  )
}
