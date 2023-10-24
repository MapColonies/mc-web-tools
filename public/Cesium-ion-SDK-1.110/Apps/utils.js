const addTerrainProvider = async (viewer, url, props) => {
  viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(url, { ...(props ? props : {}) });
};

const addRasterLayer = async (viewer, options) => {
  const providerInstance = new Cesium.WebMapTileServiceImageryProvider(options);
  viewer.imageryLayers.addImageryProvider(providerInstance);
};

const add3DModel = async (viewer, url, props, isZoomTo = true, callback = null) => {
  const tileset = await Cesium.Cesium3DTileset.fromUrl(url, { ...(props ? props : {}) });
  viewer.scene.primitives.add(tileset);
  if (isZoomTo) {
      viewer.zoomTo(tileset);
  }

  if(typeof callback === 'function') {
    callback(tileset);
  }
};

const onCesiumObjectDrag = (viewer, featureId, onDragging) => {
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

  let draggedObject;
            
  handler.setInputAction((click) => {
    const pickedFeature = viewer.scene.pick(click.position);
    if(Cesium.defined(pickedFeature) && viewer.scene.pickPositionSupported) {
      if(pickedFeature && pickedFeature.id && pickedFeature.id.id === featureId) {
        draggedObject = pickedFeature;

        // Disable camera rotate while dragging.
        viewer.scene.screenSpaceCameraController.enableRotate = false;
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_DOWN);

  handler.setInputAction(function() {
    if (Cesium.defined(draggedObject)) {
      draggedObject = undefined;
      viewer.scene.screenSpaceCameraController.enableRotate = true;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_UP);


  handler.setInputAction((draggingMovement) => {
    const position = viewer.camera.pickEllipsoid(draggingMovement.endPosition);
    const pickedFeature = viewer.scene.pick(draggingMovement.endPosition);

    if(Cesium.defined(draggedObject) || pickedFeature && pickedFeature.id && pickedFeature.id.id === featureId) {
      viewer.canvas.style.cursor = 'move';
    } else {
      viewer.canvas.style.cursor = 'unset';
    }

    if(!Cesium.defined(position) || !draggedObject) return;

    onDragging(draggingMovement);
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

function overrideCesiumToolHandler(viewer, toolName, onClick) {
  viewer[toolName].viewModel.command.beforeExecute.addEventListener(
    function(e) {
        e.cancel = true;
        onClick(e);
  });
}

function overrideHomeButtonHandler(viewer, onClick) {
  overrideCesiumToolHandler(viewer, "homeButton", onClick);
}

function toDegrees(num) {
  return num * (180 / Math.PI);
};