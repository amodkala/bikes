import { useEffect, useRef } from "react";
import { Map } from "maplibre-gl";
import 'maplibre-gl/dist/maplibre-gl.css';

export default function BikeMap() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<Map | null>(null);

    useEffect(() => {
        // Only initialize if map hasn't been created and container exists
        if (map.current || !mapContainer.current) return;

        // Create new map instance
        map.current = new Map({
            container: mapContainer.current,
            style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
            center: [-79.3846434614, 43.6503973984],
            zoom: 14
        });

        // Cleanup function to remove map on unmount
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []); // Empty dependency array means this effect runs once on mount

    return (
        <div className="h-screen w-full"> 
            <div 
                ref={mapContainer} 
                className="relative w-full h-full" 
            />
        </div>
    );
}
