import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap, Polyline } from 'react-leaflet';

function MapUpdater({ center }) {
  const map = useMap();
  React.useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function LiveMap({ devices }) {
  const [routeACoords, setRouteACoords] = useState([]);
  const [routeBCoords, setRouteBCoords] = useState([]);
  
  // Exact coordinates from provided Google Maps link
  const gauhatiCoords = [26.1540389, 91.6629668];
  const mirzaCoords = [26.0982695, 91.5353893];

  const device = devices && devices.length > 0 ? devices[0] : null;
  const status = device?.status?.toUpperCase() || 'UNKNOWN';
  
  const showRouteA = status === 'DANGER' || status === 'RISKY';
  const showRouteB = !showRouteA; // Default to showing Route B (Safe path) for all other states like 'ONLINE'

  // Fetch Route A (Bypass / Diversion Route)
  useEffect(() => {
    const fetchRouteA = async () => {
      try {
        // Route A (Danger Diversion): Takes the southern bypass via Rani to avoid the flooded highway
        const detourLon = 91.5975;
        const detourLat = 26.0590;
        const url = `https://router.project-osrm.org/route/v1/driving/91.6629668,26.1540389;91.5975,26.0590;91.5353893,26.0982695?overview=full&geometries=geojson`;
        
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRouteACoords(coords);
        }
      } catch (err) {
        console.error("Failed to fetch Route A", err);
      }
    };
    fetchRouteA();
  }, []);

  // Fetch Route B (Through Device Location, or standard if no GPS lock)
  useEffect(() => {
    const fetchRouteB = async () => {
      try {
        // Primary Route (Safe Path): Exact match for provided Google Maps route, unconditionally overriding hardware GPS to ensure perfectly smooth visuals.
        const waypointLon = 91.5964305;
        const waypointLat = 26.1133872;
        const url = `https://router.project-osrm.org/route/v1/driving/91.6629668,26.1540389;${waypointLon},${waypointLat};91.5353893,26.0982695?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          setRouteBCoords(coords);
        }
      } catch (err) {
        console.error("Failed to fetch Route B", err);
      }
    };
    fetchRouteB();
  }, [device?.last_latitude, device?.last_longitude]);

  const getMarkerColor = (stat) => {
    switch (stat) {
      case 'SAFE': return '#10b981'; // Green
      case 'RISKY': return '#f59e0b'; // Yellow
      case 'DANGER': return '#ef4444'; // Red
      default: return 'hsl(var(--primary))';     // Cyan
    }
  };

  return (
    <div style={{ aspectRatio: '1 / 1', maxHeight: '75vh', width: '100%', margin: '0 auto', position: 'relative' }}>
      <MapContainer 
        center={gauhatiCoords} 
        zoom={12} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <MapUpdater center={gauhatiCoords} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* ROUTE A: Diversion / Bypass Route (Shows on DANGER/RISKY) */}
        {showRouteA && routeACoords.length > 0 && (
          <Polyline 
            positions={routeACoords}
            smoothFactor={1.5}
            pathOptions={{ color: '#ef4444', weight: 4, opacity: 0.9, dashArray: '10, 8' }}
          >
            <Tooltip direction="top" sticky className="route-label">
              <div style={{ background: '#ef4444', color: 'hsl(var(--text-primary))', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' }}>
                Emergency Bypass
              </div>
            </Tooltip>
          </Polyline>
        )}

        {/* ROUTE B: Standard Route through Node (Shows on SAFE) */}
        {showRouteB && routeBCoords.length > 0 && (
          <Polyline 
            positions={routeBCoords}
            smoothFactor={1.5}
            pathOptions={{ color: '#10b981', weight: 5, opacity: 0.9 }}
          >
            <Tooltip direction="top" sticky className="route-label">
              <div style={{ background: '#10b981', color: 'hsl(var(--text-primary))', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold' }}>
                Primary Route
              </div>
            </Tooltip>
          </Polyline>
        )}

        {/* Endpoints */}
        <CircleMarker center={gauhatiCoords} radius={6} pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 1 }}>
          <Popup><div style={{ color: '#222' }}><b>Gauhati University</b></div></Popup>
        </CircleMarker>
        <CircleMarker center={mirzaCoords} radius={6} pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 1 }}>
          <Popup><div style={{ color: '#222' }}><b>Mirza</b></div></Popup>
        </CircleMarker>

        {/* Device Marker */}
        {device && device.last_latitude && device.last_longitude && (
          <CircleMarker
            center={[device.last_latitude, device.last_longitude]}
            radius={12}
            pathOptions={{
              color: getMarkerColor(status),
              fillColor: getMarkerColor(status),
              fillOpacity: 0.8,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ color: 'hsl(var(--text-primary))', background: '#0e1726', padding: '4px', fontFamily: 'sans-serif' }}>
                <h4 style={{ margin: '0 0 6px 0', borderBottom: '1px solid #222' }}>{device.name}</h4>
                <p style={{ margin: '0 0 4px 0' }}><b>Status:</b> <span style={{ color: getMarkerColor(status), fontWeight: 'bold' }}>{status}</span></p>
              </div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
