import React from 'react'
import { useState} from "react";
import { StorageImage } from '@aws-amplify/ui-react-storage';
import { downloadData } from 'aws-amplify/storage';
import Box  from '@mui/material/Box';
import moment from 'moment';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api'

const containerStyle = {
  width: '900px',
  height: '700px',
}

export default function MapMultipleWithGoogleAlt(props) {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [zoom, setZoom] = useState(5);
  const [videoURL, setVideoURL] = useState('');
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
    </React.Fragment>
  ) : (
    <></>
  )
}
