import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './leafletSetup';
import './MapMode.css';
import { fetchOSMGraph } from '../../utils/osm';
import { AdjacencyList, GraphNode, GraphAlgorithmResult } from '../../types/graph';
import { AlgorithmType, VisualizationStatus } from '../../types';
import { bfsGraph, dijkstraGraph, astarGraph } from '../../algorithms/graphAlgorithms';
import { ArrowDownUp, MapPin, Search, Loader2 } from 'lucide-react';

// Haversine distance helper for finding nearest nodes
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

// Format meters as a human-readable distance string
const formatDistance = (meters: number) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
};

interface MapModeProps {
  algorithm: AlgorithmType;
  status: VisualizationStatus;
  setStatus: (status: VisualizationStatus) => void;
}

const DEFAULT_CENTER: [number, number] = [18.5204, 73.8567]; // Pune, Maharashtra
const ZOOM = 14;
const MAHARASHTRA_BOUNDS: [[number, number], [number, number]] = [
  [15.6, 72.6],
  [22.0, 80.9]
];

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY || '';

interface GeoResult {
  label: string;
  lat: number;
  lng: number;
}

interface SearchBias {
  south: number;
  west: number;
  north: number;
  east: number;
  centerLat: number;
  centerLng: number;
}

function PlaceSearch({
  placeholder,
  selectedLabel,
  onSelect,
  bias,
}: {
  placeholder: string;
  selectedLabel: string;
  onSelect: (lat: number, lng: number, label: string) => void;
  bias: SearchBias | null;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(selectedLabel);
  }, [selectedLabel]);

  useEffect(() => {
    if (!query || query.length < 3 || query === selectedLabel) {
      setResults([]);
      setNoResults(false);
      setSearchError(null);
      return;
    }
    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        let found: GeoResult[] = [];
        let mapTilerFailed = false;

        if (MAPTILER_API_KEY) {
          // MapTiler Geocoding API (needs VITE_MAPTILER_API_KEY)
          let url = `https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json?key=${MAPTILER_API_KEY}&limit=6`;
          if (bias) {
            // bbox order: minLon, minLat, maxLon, maxLat
            url += `&bbox=${bias.west},${bias.south},${bias.east},${bias.north}`;
            url += `&proximity=${bias.centerLng},${bias.centerLat}`;
          }
          try {
            const res = await fetch(url);
            if (!res.ok) {
              mapTilerFailed = true;
              console.warn("MapTiler API issue, falling back to free Nominatim:", await res.text());
            } else {
              const data = await res.json();
              found = (data.features || []).map((f: any) => ({
                label: f.place_name || f.text || 'Unknown place',
                lat: f.center[1],
                lng: f.center[0],
              }));
            }
          } catch (e) {
            mapTilerFailed = true;
            console.warn("MapTiler fetch failed, falling back to free Nominatim:", e);
          }
        } 
        
        if (!MAPTILER_API_KEY || mapTilerFailed) {
          // Free fallback: OpenStreetMap Nominatim (no API key needed)
          let url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=${encodeURIComponent(query)}`;
          if (bias) {
            // viewbox order: west(left), north(top), east(right), south(bottom)
            url += `&viewbox=${bias.west},${bias.north},${bias.east},${bias.south}`;
          }
          const res = await fetch(url, { headers: { Accept: 'application/json' } });
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Free search failed (${res.status}): ${text.slice(0, 50)}...`);
          }
          const data = await res.json();
          found = (data || []).map((r: any) => ({
            label: r.display_name,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
          }));
        }
        if (!cancelled) {
          setResults(found);
          setNoResults(found.length === 0);
        }
      } catch (e: any) {
        if (!cancelled) {
          setResults([]);
          setNoResults(false);
          setSearchError(e?.message || 'Search failed. Check your connection and try again.');
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [query, selectedLabel, bias]);

  const selectResult = (r: GeoResult) => {
    setQuery(r.label);
    setShowDropdown(false);
    setResults([]);
    onSelect(r.lat, r.lng, r.label);
  };

  const dropdownVisible = showDropdown && (searching || noResults || searchError !== null || results.length > 0);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); }}
        onFocus={() => setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results.length > 0) {
            selectResult(results[0]);
          }
        }}
        placeholder={placeholder}
        style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--color-text)', outline: 'none' }}
      />
      {dropdownVisible && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--color-bg-main)', border: '1px solid var(--color-border)', borderRadius: '4px', zIndex: 2000, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {searching && (
            <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={14} className="spin" /> Searching places...
            </div>
          )}
          {!searching && searchError && (
            <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#ef233c' }}>
              {searchError}
            </div>
          )}
          {!searching && !searchError && noResults && (
            <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              No places found. Try a different name.
            </div>
          )}
          {!searching && !searchError && results.map((r, i) => (
            <div
              key={i}
              style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--color-border)', fontSize: '0.85rem', color: 'var(--color-text)' }}
              onClick={() => selectResult(r)}
            >
              {r.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onMapClick(e.latlng.lat, e.latlng.lng),
  });
  return null;
}

function BoundingBoxSelector({ onBoundsChange }: { onBoundsChange: (bounds: any) => void }) {
  const map = useMapEvents({
    moveend: () => {
      onBoundsChange(map.getBounds());
    }
  });
  
  useEffect(() => {
    onBoundsChange(map.getBounds());
  }, [map, onBoundsChange]);
  
  return null;
}

export const MapMode: React.FC<MapModeProps> = ({ algorithm, status, setStatus }) => {
  const [nodes, setNodes] = useState<Map<string, GraphNode>>(new Map());
  const [adjacencyList, setAdjacencyList] = useState<AdjacencyList>(new Map());
  const [bounds, setBounds] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [startId, setStartId] = useState<string | null>(null);
  const [endId, setEndId] = useState<string | null>(null);
  const [startLabel, setStartLabel] = useState('');
  const [endLabel, setEndLabel] = useState('');
  
  const [result, setResult] = useState<GraphAlgorithmResult | null>(null);
  const [animatedPath, setAnimatedPath] = useState<string[]>([]);

  const timers = useRef<number[]>([]);
  const statusRef = useRef(status);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Serializable bias info for the geocoder, memoized so its effect doesn't refire every render
  const searchBias = useMemo<SearchBias | null>(() => {
    if (!bounds) return null;
    return {
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast(),
      centerLat: bounds.getCenter().lat,
      centerLng: bounds.getCenter().lng,
    };
  }, [bounds]);

  const handleLoadArea = async () => {
    if (!bounds) return;
    setIsLoading(true);
    setError(null);
    setNotice(null);
    setStartId(null);
    setEndId(null);
    setStartLabel('');
    setEndLabel('');
    setResult(null);
    setAnimatedPath([]);
    clearTimers();
    setStatus(VisualizationStatus.IDLE);

    try {
      const south = bounds.getSouth();
      const west = bounds.getWest();
      const north = bounds.getNorth();
      const east = bounds.getEast();
      
      const { nodes: newNodes, adjacencyList: newAdj } = await fetchOSMGraph(south, west, north, east);
      
      if (newNodes.size === 0) {
        setError('No road network found in this area. Try zooming out or moving to a city.');
      } else {
        setNodes(newNodes);
        setAdjacencyList(newAdj);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load map data');
    } finally {
      setIsLoading(false);
    }
  };

  const findNearestNodeId = (lat: number, lng: number): string | null => {
    if (nodes.size === 0) return null;
    let min = Infinity;
    let nearest = null;
    nodes.forEach((node, id) => {
      const d = getDistance(lat, lng, node.lat, node.lon);
      if (d < min) {
        min = d;
        nearest = id;
      }
    });
    return nearest;
  };

  // Shared selection logic for both geocoded places and map clicks.
  // Rejects selections that snap onto the same road node as the other endpoint.
  const pickNode = (lat: number, lng: number, isStart: boolean, label: string) => {
    if (nodes.size === 0) {
      alert("Please click 'Load Road Network for Current Area' before searching for locations!");
      return;
    }
    const nearest = findNearestNodeId(lat, lng);
    if (!nearest) return;

    const otherId = isStart ? endId : startId;
    if (otherId && nearest === otherId) {
      setNotice(
        isStart
          ? 'That place snapped to the same road node as your destination. Pick a spot farther away, or zoom in and reload the network for more nodes.'
          : 'That place snapped to the same road node as your start point. Pick a spot farther away, or zoom in and reload the network for more nodes.'
      );
      return;
    }

    // Warn when snapping is coarse (point is far from the loaded road network)
    const node = nodes.get(nearest)!;
    const snapDist = getDistance(lat, lng, node.lat, node.lon);
    if (snapDist > 750) {
      setNotice(
        `Snapped to the nearest road node ${(snapDist / 1000).toFixed(1)} km away. The loaded network may not cover that area — zoom in and click "Load Road Network" again for accurate routing.`
      );
    } else {
      setNotice(null);
    }

    if (isStart) {
      setStartId(nearest);
      setStartLabel(label);
    } else {
      setEndId(nearest);
      setEndLabel(label);
    }
  };

  const handleGlobalMapClick = (lat: number, lng: number) => {
    if (nodes.size === 0 || statusRef.current === VisualizationStatus.RUNNING) return;
    const nearest = findNearestNodeId(lat, lng);
    if (!nearest) return;

    if (!startId) {
      setStartId(nearest);
      setStartLabel('📍 Selected on map');
      setNotice(null);
    } else if (!endId && nearest !== startId) {
      setEndId(nearest);
      setEndLabel('📍 Selected on map');
      setNotice(null);
    } else {
      // Start a fresh selection round
      setStartId(nearest);
      setStartLabel('📍 Selected on map');
      setEndId(null);
      setEndLabel('');
      setResult(null);
      setAnimatedPath([]);
      clearTimers();
      setNotice(null);
      setStatus(VisualizationStatus.IDLE);
    }
  };

  const handleSwap = () => {
    if (!startId && !endId) return;
    const tempId = startId;
    const tempLabel = startLabel;
    setStartId(endId);
    setStartLabel(endLabel);
    setEndId(tempId);
    setEndLabel(tempLabel);
  };

  const runAlgorithm = useCallback(() => {
    if (!startId || !endId) return;
    if (statusRef.current === VisualizationStatus.RUNNING) return;
    
    clearTimers();
    setAnimatedPath([]);
    setStatus(VisualizationStatus.RUNNING);

    let res: GraphAlgorithmResult;
    
    switch (algorithm) {
      case AlgorithmType.BFS:
        res = bfsGraph(adjacencyList, startId, endId);
        break;
      case AlgorithmType.DFS:
        // Graph DFS is generally not great for shortest paths, we can just run BFS if they picked DFS
        res = bfsGraph(adjacencyList, startId, endId);
        break;
      case AlgorithmType.DIJKSTRA:
        res = dijkstraGraph(adjacencyList, startId, endId);
        break;
      case AlgorithmType.ASTAR:
        res = astarGraph(adjacencyList, nodes, startId, endId);
        break;
      default:
        res = astarGraph(adjacencyList, nodes, startId, endId);
    }

    setResult(res);

    // Animate
    const { path } = res;
    
    // For maps, animating thousands of nodes individually is slow. 
    // We can batch animate them or speed it up.
    let delay = 0;

    if (res.found) {
      const pathTimer = window.setTimeout(() => {
        setAnimatedPath(path);
        setStatus(VisualizationStatus.FINISHED);
      }, delay + 200);
      timers.current.push(pathTimer);
    } else {
      const endTimer = window.setTimeout(() => {
        setStatus(VisualizationStatus.FINISHED);
      }, delay);
      timers.current.push(endTimer);
    }
  }, [algorithm, adjacencyList, nodes, startId, endId, setStatus]);

  // Auto-run whenever both endpoints are set (including re-runs after a finished
  // search, e.g. when start/destination/algorithm changes via the search form).
  useEffect(() => {
    if (startId && endId && statusRef.current !== VisualizationStatus.RUNNING) {
      runAlgorithm();
    }
  }, [startId, endId, algorithm, runAlgorithm]);

  // Convert animated lists to renderable segments
  const pathNodesRender = animatedPath.map(id => nodes.get(id)).filter(Boolean) as GraphNode[];
  
  const pathPositions: [number, number][] = pathNodesRender.map(n => [n.lat, n.lon]);

  // Total route distance: use algorithm-reported edge-weight sum, falling back to
  // summing straight-line segment lengths along the rendered path.
  const totalDistanceMeters =
    result?.found && animatedPath.length > 1
      ? result.totalDistance ??
        pathPositions.reduce(
          (acc, pos, i) =>
            i === 0 ? 0 : acc + getDistance(pathPositions[i - 1][0], pathPositions[i - 1][1], pos[0], pos[1]),
          0
        )
      : null;

  return (
    <div className="map-mode-container">
      <div className="map-controls">
        <button className="btn-secondary" onClick={handleLoadArea} disabled={isLoading || statusRef.current === VisualizationStatus.RUNNING}>
          {isLoading ? 'Loading Network...' : '1. Load Road Network for Current Area'}
        </button>
        <p className="map-instructions">
          {!startId ? '2. Search a start point or click the map.' : !endId ? '3. Search a destination or click the map.' : 'Route found below — pick new points to search again.'}
        </p>
        {error && <div className="map-error">{error}</div>}
        {notice && <div className="map-notice">{notice}</div>}
        
        {nodes.size > 0 && (
          <div className="map-stats">
            Nodes loaded: {nodes.size} | Edges: {Array.from(adjacencyList.values()).reduce((acc, edges) => acc + edges.length, 0)}
          </div>
        )}

        {result && (
          <div className="map-result">
            {result.found && result.totalDistance != null && (
              <>
                <strong>Distance:</strong> {formatDistance(result.totalDistance)} | 
              </>
            )}
            <strong>Time:</strong> {result.timeTaken.toFixed(2)}ms | 
            <strong> Explored:</strong> {result.visitedOrder.length} | 
            <strong> Path Nodes:</strong> {result.path.length}
          </div>
        )}

        {result && !result.found && (
          <div className="map-error">
            No route found between these points in the loaded network. Zoom out, click &quot;Load Road Network&quot; again, then pick places inside that area.
          </div>
        )}
        
        <button 
          className="btn-primary" 
          onClick={runAlgorithm} 
          disabled={!startId || !endId || statusRef.current === VisualizationStatus.RUNNING}
          style={{marginLeft: 'auto'}}
        >
          Visualize on Map
        </button>
      </div>
      
      <div className="leaflet-wrapper">
        <div className="routing-box">
          <div className="routing-inputs">
            <div className="input-group">
              <div className="icon-start"></div>
              <PlaceSearch
                placeholder="Choose starting point, or click on the map"
                selectedLabel={startId ? (startLabel || '📍 Selected on map') : ''}
                onSelect={(lat, lng, label) => pickNode(lat, lng, true, label)}
                bias={searchBias}
              />
            </div>
            <div className="icon-dots">
              <span></span><span></span><span></span>
            </div>
            <div className="input-group">
              <MapPin size={16} color="#ef233c" />
              <PlaceSearch
                placeholder="Choose destination..."
                selectedLabel={endId ? (endLabel || '📍 Selected on map') : ''}
                onSelect={(lat, lng, label) => pickNode(lat, lng, false, label)}
                bias={searchBias}
              />
              <Search size={16} color="#4361ee" style={{marginLeft: 'auto'}} />
            </div>
          </div>
          <button className="swap-btn" onClick={handleSwap} title="Swap Start and Target">
            <ArrowDownUp size={20} />
          </button>
        </div>

        {/* Route summary card (Google Maps style) */}
        {result?.found && totalDistanceMeters !== null && (
          <div className="route-summary">
            <div className="route-summary-distance">{formatDistance(totalDistanceMeters)}</div>
            <div className="route-summary-label">
              Shortest route via {algorithm === AlgorithmType.DIJKSTRA ? 'Dijkstra' : algorithm === AlgorithmType.ASTAR ? 'A*' : 'BFS'}
            </div>
          </div>
        )}

        <MapContainer 
          center={DEFAULT_CENTER} 
          zoom={ZOOM} 
          scrollWheelZoom={true} 
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          maxBounds={MAHARASHTRA_BOUNDS}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
          />
          <BoundingBoxSelector onBoundsChange={setBounds} />
          <MapClickHandler onMapClick={handleGlobalMapClick} />

          {/* Google Maps Style Route Path */}
          {pathPositions.length > 0 && (
            <>
              {/* Outer Border (Darker Blue) */}
              <Polyline 
                positions={pathPositions} 
                pathOptions={{ color: '#1a56db', weight: 8, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }} 
              />
              {/* Inner Route (Google Blue) */}
              <Polyline 
                positions={pathPositions} 
                pathOptions={{ color: '#4285F4', weight: 5, opacity: 1, lineCap: 'round', lineJoin: 'round' }} 
              />
            </>
          )}

          {/* Render explicitly set Start and End markers */}
          {startId && nodes.get(startId) && (
            <CircleMarker 
              center={[nodes.get(startId)!.lat, nodes.get(startId)!.lon]} 
              radius={7}
              pathOptions={{ color: '#ffffff', fillColor: '#000000', fillOpacity: 1, weight: 2 }}
            />
          )}
          {endId && nodes.get(endId) && (
            <CircleMarker 
              center={[nodes.get(endId)!.lat, nodes.get(endId)!.lon]} 
              radius={7}
              pathOptions={{ color: '#ffffff', fillColor: '#ef233c', fillOpacity: 1, weight: 2 }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};
