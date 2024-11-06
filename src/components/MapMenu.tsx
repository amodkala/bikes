import MapShell from "./MapShell";
import MapInfo from "./MapInfo";

export default function Menu() {
    return (
        <div className="space-x-4">
            <MapShell />
            <MapInfo />
        </div>
    )
}
