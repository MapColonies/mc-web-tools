const addTerrainProvider = async (viewer, url, props) => {
  viewer.terrainProvider = await Cesium.CesiumTerrainProvider.fromUrl(url, { ...(props ? props : {}) });
};

const addRasterLayer = async (viewer, options) => {
  const providerInstance = new Cesium.WebMapTileServiceImageryProvider(options);
  viewer.imageryLayers.addImageryProvider(providerInstance);
};

/*
  ***** Still not working, shader should be sensetive to sun or custom light source direction which should be updated every tick
  ***** DEPENDS ON 3D TILE MATERIAL DEFINITION !!!!!
  ***** Nice source to consider an algorithm for darkening(brightness/contrast) 
  ***** https://flights.noelphilips.com/Source/Shaders/Builtin/Functions/phong.glsl
*/
// const customShaderWithParams = new Cesium.CustomShader({
//     varyings: {
//       v_normal: Cesium.VaryingType.VEC3,
//     },
//     vertexShaderText: `
//     void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
//       // Transform vertex normal to eye coordinates
//       v_normal = czm_normal * vsInput.attributes.normalMC;
//     }
//     `,
//     fragmentShaderText: `
//     void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
//         // Normalize the custom light direction vector
//         vec3 normalizedCustomLightDir = normalize(customLightDirection);
  
//         // Calculate diffuse factor using dot product of normal and custom light direction
//         float diffuseFactor = max(dot(v_normal, normalizedCustomLightDir), 0.3);
  
//         // Darken/lighten the model by adjusting diffuse color
//         material.diffuse *= vec3(diffuseFactor);
//     }
//     `,
//     uniforms: {
//       customLightDirection:  {
//        type:'vec3' ,
//        value: new Cesium.Cartesian3(),
//       }
//     },
//     });

/*
  ***** THIS SHADER IS PREATY MUCH WORKING (depends on 3d tile material definition!!!! )
  ***** BUT STILL SHOULD BE TUNED
*/
// const customShader = new Cesium.CustomShader({
//   varyings: {
//     v_normal: Cesium.VaryingType.VEC3,
//   },
//   vertexShaderText: `
//   void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
//      // Transform vertex normal to eye coordinates
//       v_normal = czm_normal * vsInput.attributes.normalMC;
//   }
//   `,
//   fragmentShaderText: `
//   void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
//      // Normalize sun direction in eye coordinates
//      vec3 sunDirectionEC = normalize(czm_sunDirectionEC);
 
//      // Calculate diffuse factor using dot product of normal and sun direction
//      float diffuseFactor = max(dot(v_normal, sunDirectionEC), 0.3);
 
//      // Darken/lighten the model by adjusting diffuse color
//      material.diffuse *= vec3(diffuseFactor);
//   }
//   `,
//   });

const add3DModel = async (viewer, url, props, isZoomTo = true, callback = null, tileIsLoadedCb = null) => {
  let isLoaded = false;

  const tileset = await Cesium.Cesium3DTileset.fromUrl(url, {
    // customShader: customShaderWithParams,
    ...(props ? props : {})
  });

  if(typeof tileIsLoadedCb === 'function') {
    tileset.allTilesLoaded.addEventListener(function() {
      if(!isLoaded) {
        isLoaded = true;
        tileIsLoadedCb(isLoaded);
      }
    });

    tileset.tileLoad.addEventListener(function() {
      if(isLoaded) {
        isLoaded = false;
        tileIsLoadedCb(isLoaded);
      }
    });
  }

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