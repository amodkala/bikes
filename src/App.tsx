import { useContext } from "react";
import BikeMap from "./components/BikeMap";
import { DBContext } from "./components/DBContext";

export default function App() {
    const conn = useContext(DBContext)
    return (
        <>
            <DBContext.Provider value={conn}>
                <BikeMap />
            </DBContext.Provider>
        </>
    )
}
