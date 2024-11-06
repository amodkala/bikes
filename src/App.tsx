import BikeMap from "./components/BikeMap";
import MapMenu from "./components/MapMenu";

export default function App() {
    return (
        <div className="relative h-screen w-screen"> 
            <BikeMap />
            <div className="absolute inset-0 pointer-events-none">
                <div className="relative w-full h-full p-6">
                    <div className="pointer-events-auto">
                        <MapMenu />
                    </div>
                </div>
            </div>
        </div>
    )
}
