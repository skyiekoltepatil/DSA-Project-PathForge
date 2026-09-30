import { AdjacencyList, GraphNode } from '../types/graph';

// Haversine formula to calculate distance between two lat/lon points in meters
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function fetchOSMGraph(
  south: number,
  west: number,
  north: number,
  east: number
): Promise<{ nodes: Map<string, GraphNode>; adjacencyList: AdjacencyList }> {
  // Calculate the approximate area in square degrees
  const area = (north - south) * (east - west);
  
  // Make the filter extremely aggressive for large areas to prevent 504 Timeouts
  let highwayFilter = 'way["highway"]';
  if (area > 0.01) {
    highwayFilter = 'way["highway"~"motorway|trunk|primary|secondary"]'; // City-wide: only main roads
  } else if (area > 0.002) {
    highwayFilter = 'way["highway"~"motorway|trunk|primary|secondary|tertiary|unclassified"]'; // Neighborhood
  }

  // Overpass QL query - use a shorter timeout so the gateway doesn't 504
  const query = `
    [out:json][timeout:25][maxsize:1073741824];
    (
      ${highwayFilter}( ${south}, ${west}, ${north}, ${east} );
    );
    out body;
    >;
    out skel qt;
  `;

  // Multiple free Overpass API endpoints to guarantee uptime for the prototype!
  const ENDPOINTS = [
    'https://lz4.overpass-api.de/api/interpreter',
    'https://z.overpass-api.de/api/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter'
  ];

  let response = null;
  let lastErrorText = "";

  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(query), // Correctly url-encode the body!
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (res.ok) {
        response = res;
        break; // Success! Break out of the loop
      } else {
        lastErrorText = await res.text();
        console.warn(`Overpass API ${url} failed with status ${res.status}. Trying next...`);
      }
    } catch (err: any) {
      console.warn(`Overpass API ${url} connection failed. Trying next...`);
      lastErrorText = err.message;
    }
  }

  if (!response) {
    // If it's a 504 HTML page, give a clean error message
    if (lastErrorText.includes('<html') || lastErrorText.includes('<?xml')) {
      lastErrorText = "All free map servers are currently overloaded. Please zoom in a little bit and try again.";
    } else {
      lastErrorText = lastErrorText.slice(0, 100);
    }
    throw new Error(`Overpass API Error: ${lastErrorText}`);
  }

  const data = await response.json();

  const nodes = new Map<string, GraphNode>();
  const adjacencyList: AdjacencyList = new Map();

  // Parse nodes first
  for (const element of data.elements) {
    if (element.type === 'node') {
      nodes.set(element.id.toString(), {
        id: element.id.toString(),
        lat: element.lat,
        lon: element.lon,
      });
      adjacencyList.set(element.id.toString(), []); // Initialize empty adjacency list
    }
  }

  // Parse ways (edges)
  for (const element of data.elements) {
    if (element.type === 'way' && element.nodes && element.nodes.length > 1) {
      // Determine if way is one-way
      const isOneWay = element.tags?.oneway === 'yes';

      for (let i = 0; i < element.nodes.length - 1; i++) {
        const fromId = element.nodes[i].toString();
        const toId = element.nodes[i + 1].toString();

        const fromNode = nodes.get(fromId);
        const toNode = nodes.get(toId);

        if (fromNode && toNode) {
          const distance = getDistance(fromNode.lat, fromNode.lon, toNode.lat, toNode.lon);

          // Add edge from -> to
          adjacencyList.get(fromId)?.push({ to: toId, weight: distance });

          // Add edge to -> from (if not one-way)
          if (!isOneWay) {
            adjacencyList.get(toId)?.push({ to: fromId, weight: distance });
          }
        }
      }
    }
  }

  // Filter out nodes that have no edges to save memory/processing
  const connectedNodes = new Map<string, GraphNode>();
  const connectedAdjList: AdjacencyList = new Map();

  for (const [id, edges] of adjacencyList.entries()) {
    if (edges.length > 0) {
      connectedAdjList.set(id, edges);
      const node = nodes.get(id);
      if (node) connectedNodes.set(id, node);
    }
  }

  return { nodes: connectedNodes, adjacencyList: connectedAdjList };
}
