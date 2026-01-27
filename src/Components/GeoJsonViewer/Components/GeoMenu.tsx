import React, { useState } from "react";
import { Box } from "@map-colonies/react-components";

import '@map-colonies/react-core/dist/menu/styles';
import './GeoMenu.css';
import { Button, ListDivider, Menu, MenuItem, MenuSurfaceAnchor } from "@map-colonies/react-core";
import { importShapeFileFromClient, proccessShapeFile } from "../Utils/GeoJsonViewer/utils";
import { FeatureCollection } from "geojson";

interface GeoMenuProps {
  onFileLoaded: (fc: FeatureCollection) => void;
}


export const GeoMenu: React.FC<GeoMenuProps> = ({ 
  onFileLoaded 
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Box id="geo-menu">
      <MenuSurfaceAnchor>
        <Menu
          open={open}
          onSelect={(evt: any) => {
            console.log(evt.detail.index);
            importShapeFileFromClient((ev, fileType) => {
              const shpFile = (ev.target?.result as unknown) as ArrayBuffer;
              void proccessShapeFile(shpFile, fileType)
                .then((geometryPolygon) => {
                  onFileLoaded(geometryPolygon as FeatureCollection)
                })
                .catch((e) => {
                  
                })
                .finally(() => {
                });
            });
          }}
          onClose={() => setOpen(false)}
        >
          <MenuItem>JSON</MenuItem>
          <MenuItem>Shape</MenuItem>
          {/* <ListDivider />
          <MenuItem>Icecream</MenuItem> */}
        </Menu>
        <Button raised onClick={() => setOpen(!open)}>
          Open
        </Button>
      </MenuSurfaceAnchor>
    </Box>
  )
}