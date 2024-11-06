import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function MapInfo() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Info id="info" />
                    Info
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Bike Share Toronto Map
                    </DialogTitle>
                </DialogHeader>
                This map is a simple tool designed to let users query realtime 
                data about Toronto's Bike Share stations and visualize those 
                query results on an interactive map. You can read more about 
                how I designed the map and added its database functionality 
                here.
            </DialogContent>
        </Dialog>
    )
}
