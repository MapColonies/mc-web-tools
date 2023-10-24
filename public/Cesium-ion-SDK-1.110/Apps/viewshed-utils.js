const DEFAULT_X_HALF_ANGLE = 25;
const DEFAULT_Y_HALF_ANGLE = 30;
const DEFAULT_360_VIEW = true;
const DEFAULT_PANEL_COLLAPSED = true;
const DEFAULT_CHOSEN_PERSPECTIVE = 'solider';
const REAL_WORLD_VERTICAL_DEGREE_OFFSET = 90;
const DEFUALT_CONE = 90 - REAL_WORLD_VERTICAL_DEGREE_OFFSET;
const ENABLE_SENSOR_POINT_DRAGGING = true;

let longitude = 0;
let latitude = 0;
let altitude = -1000;
let radius = 100;
let xHalfAngle = DEFAULT_X_HALF_ANGLE;
let yHalfAngle = DEFAULT_Y_HALF_ANGLE;
let classificationType = Cesium.ClassificationType.BOTH;
let clock = 0.0;
let cone = DEFUALT_CONE;
let twist = 0.0;
let portion = Cesium.SensorVolumePortionToDisplay.COMPLETE;
let showLateralSurfaces = false;
let showEllipsoidHorizonSurfaces = false;
let showDomeSurfaces = false;
let showEllipsoidSurfaces = false;
let showViewshed =  true;
let showIntersection = false;
let showThroughEllipsoid =  true;
let is360View = DEFAULT_360_VIEW;
let isViewshedModeOn = false;
let isPanelCollapsed = DEFAULT_PANEL_COLLAPSED;
let showAdvancedFields = false;
let isAltitudeAttachedToTerrain = true;
let chosenPerspective = DEFAULT_CHOSEN_PERSPECTIVE;

let sensorPawn;


const viewModel = {
  hasChosenPosition: false,
  chosenPerspective: chosenPerspective,
  perspectivePresets: [{
    icon: './assets/solider.png',
    pawn: './assets/solider-pawn.png',
    height: 1.7,
    perspective: 'solider',
    onClick: handleCustomPerspectiveClick
  }, {
    icon: './assets/tank.png',
    pawn: './assets/tank-pawn.png',
    height: 2.66,
    perspective: 'tank',
    onClick: handleCustomPerspectiveClick
  }],
  isViewshedModeOn: isViewshedModeOn,
  toggleIsViewshedModeOn: function() {
    this.isViewshedModeOn = !this.isViewshedModeOn;
    isViewshedModeOn = this.isViewshedModeOn;

      if(isViewshedModeOn) {
        this.isPanelCollapsed = DEFAULT_PANEL_COLLAPSED;
        this.is360View = DEFAULT_360_VIEW;
        this.showLateralSurfaces = false;
        this.isAltitudeAttachedToTerrain = true;
        this.hasChosenPosition = false;
        this.chosenPerspective = this.perspectivePresets.find(perspectiveItem => perspectiveItem.perspective === DEFAULT_CHOSEN_PERSPECTIVE);

        viewer._container.style.cursor = "cell";

        handle360View(this.is360View);
        updateSensor();
      } else {
        viewModel.latitude = 0;
        viewModel.longitude = 0;
        viewModel.altitude = -1000;

        viewer._container.style.cursor = "initial";
        viewer.scene.primitives.remove(this.sensor);
      }
    },
  isPanelCollapsed: isPanelCollapsed,
  togglePanelCollapsed: function () {
    this.isPanelCollapsed = !this.isPanelCollapsed;
  },
  toggleFOVVolume: function () {
    this.showLateralSurfaces = !this.showLateralSurfaces;
  },
  toggle360View: function () {
    const X_HALF_ANGLE_360 = 90;
    const y_HALF_ANGLE_360 = 90;
    const CONE_360 = 180 - REAL_WORLD_VERTICAL_DEGREE_OFFSET;

    this.is360View = !this.is360View;
    if(this.is360View) {
      this.xHalfAngle = X_HALF_ANGLE_360;
      this.yHalfAngle = y_HALF_ANGLE_360;
      this.cone = CONE_360;
    } else {
      this.xHalfAngle = DEFAULT_X_HALF_ANGLE;
      this.yHalfAngle = DEFAULT_Y_HALF_ANGLE;
      this.cone = DEFUALT_CONE;
    }
  },
  toggleShowAdvancedFields: function () {
   this.showAdvancedFields = !this.showAdvancedFields;
  },
  isAltitudeAttachedToTerrain: isAltitudeAttachedToTerrain,
  modelHeightAtPos: 0,
  is360View: is360View,
  showAdvancedFields: showAdvancedFields,
  sensor: undefined,
  longitude: longitude,
  latitude: latitude,
  altitude: altitude,
  radius: radius,
  clock: clock,
  cone: cone,
  twist: twist,
  showLateralSurfaces: showLateralSurfaces,
  showEllipsoidHorizonSurfaces: showEllipsoidHorizonSurfaces,
  showDomeSurfaces: showDomeSurfaces,
  showEllipsoidSurfaces: showEllipsoidSurfaces,
  xHalfAngle: xHalfAngle,
  yHalfAngle: yHalfAngle,
  portionOptions: [
    "Complete",
    "Below ellipsoid horizon",
    "Above ellipsoid horizon",
  ],
  selectedPortion: portion,
};

//#region KNOCKOUT: init
Cesium.knockout.track(viewModel);

const viewshedButton = document.querySelector(".toggle-viewshed-button");
const viewshedConfigPanel = document.getElementById("viewshedConfigPanel");

if(viewshedButton && viewshedConfigPanel) {
  Cesium.knockout.applyBindings(viewModel, viewshedConfigPanel);
  Cesium.knockout.applyBindings(viewModel, viewshedButton);
}


  Cesium.knockout
    .getObservable(viewModel, "hasChosenPosition")
    .subscribe(function (value) {
      if(value) {
        viewModel.isPanelCollapsed = false;
      }
    });

  Cesium.knockout
    .getObservable(viewModel, "isAltitudeAttachedToTerrain")
    .subscribe(function (value) {
      if(value) {
        setModelValue("altitude", viewModel.modelHeightAtPos);
      } else {
        if(viewModel.chosenPerspective) {
          setModelValue('altitude', viewModel.altitude - viewModel.chosenPerspective.height)
          setModelValue('chosenPerspective', undefined);
        }
      }
    });
  
    Cesium.knockout
    .getObservable(viewModel, "is360View")
    .subscribe(function (value) {
      handle360View(value);
    });

  Cesium.knockout
    .getObservable(viewModel, "longitude")
    .subscribe(function (value) {
      longitude = parseFloat(value) || 0;

      updateModelMatrix();

      const newPos = new Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
      addSensorPawn(newPos, viewer);
    });

  Cesium.knockout
    .getObservable(viewModel, "latitude")
    .subscribe(function (value) {
      latitude = parseFloat(value) || 0;
      updateModelMatrix();

      const newPos = new Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
      addSensorPawn(newPos, viewer);
    });

  Cesium.knockout
    .getObservable(viewModel, "altitude")
    .subscribe(function (value) {
      const heightWithoutTerrain = parseFloat(value) || 0;
      const terrainHeightAtPos = viewer.scene.globe.getHeight(new Cesium.Cartographic.fromDegrees(longitude, latitude));
      
      altitude = heightWithoutTerrain + terrainHeightAtPos;
      updateModelMatrix();

      const newPos = new Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
      addSensorPawn(newPos, viewer);
    });

  Cesium.knockout
    .getObservable(viewModel, "radius")
    .subscribe(function (value) {
      radius = parseFloat(value) || 1;
      updateSensor();     
    });
    
  Cesium.knockout
    .getObservable(viewModel, "xHalfAngle")
    .subscribe(function (value) {
      xHalfAngle = Math.min(Math.max(parseFloat(value || 1), 1), 90);
      updateSensor()
    });

  Cesium.knockout
    .getObservable(viewModel, "yHalfAngle")
    .subscribe(function (value) {
      yHalfAngle = Math.min(Math.max(parseFloat(value || 1), 1), 90);
      updateSensor()
    });
  
  Cesium.knockout
    .getObservable(viewModel, "clock")
    .subscribe(function (value) {
      clock = parseFloat(value) || 0;
      updateModelMatrix();
    });

  Cesium.knockout
    .getObservable(viewModel, "cone")
    .subscribe(function (value) {
      cone = parseFloat(value) || 0;
      updateModelMatrix();
    });

  Cesium.knockout
    .getObservable(viewModel, "twist")
    .subscribe(function (value) {
      twist = parseFloat(value) || 0;
      updateModelMatrix();
    });

  Cesium.knockout
    .getObservable(viewModel, "selectedPortion")
    .subscribe(function (value) {
      switch (value) {
        case "Below ellipsoid horizon":
          portion =
            Cesium.SensorVolumePortionToDisplay.BELOW_ELLIPSOID_HORIZON;
          break;
        case "Above ellipsoid horizon":
          portion =
            Cesium.SensorVolumePortionToDisplay.ABOVE_ELLIPSOID_HORIZON;
          break;
        default:
          portion = Cesium.SensorVolumePortionToDisplay.COMPLETE;
          break;
      }

     viewModel.sensor.portionToDisplay = portion;
    });

  Cesium.knockout
    .getObservable(viewModel, "showLateralSurfaces")
    .subscribe(function (value) {
      showLateralSurfaces = value;
      showDomeSurfaces = value;
     viewModel.sensor.showLateralSurfaces = showLateralSurfaces;
     viewModel.sensor.showDomeSurfaces = showLateralSurfaces;
    });

  Cesium.knockout
    .getObservable(viewModel, "showEllipsoidHorizonSurfaces")
    .subscribe(function (value) {
      showEllipsoidHorizonSurfaces = value;
     viewModel.sensor.showEllipsoidHorizonSurfaces = showEllipsoidHorizonSurfaces;
    });

  Cesium.knockout
    .getObservable(viewModel, "showEllipsoidSurfaces")
    .subscribe(function (value) {
      showEllipsoidSurfaces = value;
     viewModel.sensor.showEllipsoidSurfaces = showEllipsoidSurfaces;
    });
    //#endregion

const viewshedEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);


// -------------- Handle pick position ------------
viewshedEventHandler.setInputAction((movement) => {
  if(viewModel.isViewshedModeOn) {
    const position = getPosition(movement, viewer);
  
    if(position) {
      setModelValue("latitude", position.latitude);
      setModelValue("longitude", position.longitude);
      setModelValue("altitude", position.height);
      if(!viewModel.hasChosenPosition) {
        setModelValue("hasChosenPosition", true);
      }
    }

  }

}, Cesium.ScreenSpaceEventType.LEFT_CLICK);


if(ENABLE_SENSOR_POINT_DRAGGING) {
  // -------------- Handle viewshed center point dragging ------------
  onCesiumObjectDrag(viewer, 'viewshedCenterPoint', (draggingMovement) => {
    const positionCartographic = getPosition({position: draggingMovement.endPosition}, viewer);
  
    setModelValue("latitude", positionCartographic.latitude);
    setModelValue("longitude", positionCartographic.longitude);
    setModelValue("altitude", positionCartographic.height);
  });
}

function handleCustomPerspectiveClick() {
  if(!viewModel.isAltitudeAttachedToTerrain) return;

  if(viewModel.chosenPerspective && viewModel.chosenPerspective.perspective === this.perspective) {
    setModelValue("chosenPerspective", undefined);
    setModelValue("altitude", viewModel.altitude - this.height);
    
  } else {
    let newHeight = viewModel.altitude + this.height;

    if(viewModel.chosenPerspective) {
      const currentPresetHeight = viewModel.chosenPerspective.height;
      newHeight -= currentPresetHeight;
    }

    setModelValue("chosenPerspective", this);    
    setModelValue("altitude", newHeight);
  }
  
}

function handle360View(is360View) {
  const X_HALF_ANGLE_360 = 90;
  const y_HALF_ANGLE_360 = 90;
  const CONE_360 = 90 - REAL_WORLD_VERTICAL_DEGREE_OFFSET;

  if(is360View) {
    setModelValue("xHalfAngle", X_HALF_ANGLE_360);
    setModelValue("yHalfAngle", y_HALF_ANGLE_360);
    setModelValue("cone", CONE_360);
  } else {
    setModelValue("xHalfAngle", DEFAULT_X_HALF_ANGLE);
    setModelValue("yHalfAngle", DEFAULT_Y_HALF_ANGLE);
    setModelValue("cone", DEFUALT_CONE);
  }
}

function getModelMatrix(ellipsoid) {
  const location = Cesium.Cartesian3.fromDegrees(
    longitude,
    latitude,
    altitude,
    ellipsoid
  );

  let modelMatrix;
  if (Math.abs(latitude) === 90.0) {
    // Handle cases where north-east-down at the poles becomes undefined for Cartesian coordinates but is defined for cartographic coordinates.
    const signLatitude = Cesium.Math.sign(latitude);
    const l = Cesium.Math.toRadians(longitude);
    const c = Math.cos(l);
    const s = Math.sin(l);
    modelMatrix = new Cesium.Matrix4(
      -signLatitude * c,
      -s,
      0.0,
      location.x,
      -signLatitude * s,
      c,
      0.0,
      location.y,
      0.0,
      0.0,
      -signLatitude,
      location.z,
      0.0,
      0.0,
      0.0,
      1.0
    );
  } else {
    modelMatrix = Cesium.Transforms.northEastDownToFixedFrame(location);
  }
  const orientation = Cesium.Matrix3.multiply(
    Cesium.Matrix3.multiply(
      Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(clock)),
      Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(cone + REAL_WORLD_VERTICAL_DEGREE_OFFSET)),
      new Cesium.Matrix3()
    ),
    Cesium.Matrix3.fromRotationX(twist),
    new Cesium.Matrix3()
  );
  return Cesium.Matrix4.multiply(
    modelMatrix,
    Cesium.Matrix4.fromRotationTranslation(
      orientation,
      Cesium.Cartesian3.ZERO
    ),
    new Cesium.Matrix4()
  );
}

function updateSensor() {
  const ellipsoid = viewer.scene.globe.ellipsoid;

  viewer.scene.primitives.remove(viewModel.sensor);
  viewModel.sensor = addRectangularSensor(ellipsoid);
  viewer.scene.primitives.add(viewModel.sensor);
}

function updateModelMatrix() {
  const ellipsoid = viewer.scene.globe.ellipsoid;
  viewModel.sensor.modelMatrix = getModelMatrix(ellipsoid);
}


function addRectangularSensor(ellipsoid) {
  const rectangularSensor = new Cesium.RectangularSensor();

  rectangularSensor.modelMatrix = getModelMatrix(ellipsoid);
  rectangularSensor.radius = radius;
  rectangularSensor.xHalfAngle = Cesium.Math.toRadians(xHalfAngle);
  rectangularSensor.yHalfAngle = Cesium.Math.toRadians(yHalfAngle);
  rectangularSensor.portionToDisplay = portion;

  rectangularSensor.lateralSurfaceMaterial = Cesium.Material.fromType(
    "Grid"
  );
  rectangularSensor.lateralSurfaceMaterial.uniforms.color = new Cesium.Color(
    0.0,
    1.0,
    1.0,
    1.0
  );
  rectangularSensor.lateralSurfaceMaterial.uniforms.cellAlpha = 0.5;
  rectangularSensor.lateralSurfaceMaterial.uniforms.lineCount = {
    x: 12,
    y: 10,
  };
  rectangularSensor.showLateralSurfaces = showLateralSurfaces;

  rectangularSensor.ellipsoidHorizonSurfaceMaterial = Cesium.Material.fromType(
    "Grid"
  );
  rectangularSensor.ellipsoidHorizonSurfaceMaterial.uniforms.color = new Cesium.Color(
    0.4,
    1.0,
    0.0,
    1.0
  );
  rectangularSensor.ellipsoidHorizonSurfaceMaterial.uniforms.cellAlpha = 0.5;
  rectangularSensor.ellipsoidHorizonSurfaceMaterial.uniforms.lineCount = {
    x: 12,
    y: 10,
  };
  rectangularSensor.showEllipsoidHorizonSurfaces = showEllipsoidHorizonSurfaces;

  rectangularSensor.domeSurfaceMaterial = Cesium.Material.fromType(
    "Grid"
  );
  rectangularSensor.domeSurfaceMaterial.uniforms.color = new Cesium.Color(
    1.0,
    1.0,
    0.0,
    1.0
  );
  rectangularSensor.domeSurfaceMaterial.uniforms.cellAlpha = 0.5;
  rectangularSensor.domeSurfaceMaterial.uniforms.lineCount = {
    x: 12,
    y: 12,
  };
  rectangularSensor.showDomeSurfaces = showDomeSurfaces;

  rectangularSensor.ellipsoidSurfaceMaterial = Cesium.Material.fromType(
    "Color"
  );
  rectangularSensor.ellipsoidSurfaceMaterial.uniforms.color = new Cesium.Color(
    1.0,
    0.0,
    1.0,
    0.5
  );
  rectangularSensor.showEllipsoidSurfaces = showEllipsoidSurfaces;

  rectangularSensor.showLateralSurfaces = showLateralSurfaces;
  rectangularSensor.showEllipsoidHorizonSurfaces = showEllipsoidHorizonSurfaces;
  rectangularSensor.showDomeSurfaces = showDomeSurfaces;
  rectangularSensor.showViewshed = showViewshed;
  rectangularSensor.showIntersection = showIntersection;
  rectangularSensor.showThroughEllipsoid = showThroughEllipsoid;
  rectangularSensor.classificationType = Cesium.ClassificationType.BOTH

  return rectangularSensor;
}


function addSensorPawn(cartesian, viewer) {
  const SHOW_PAWN_ICON = false;

  viewer.entities.remove(sensorPawn);
  if (Cesium.defined(cartesian)) {
    if(viewModel.chosenPerspective && SHOW_PAWN_ICON) {
      const customPresetPawn = viewModel.chosenPerspective.pawn;

      sensorPawn = viewer.entities.add({
        id: 'viewshedCenterPoint',
        position: cartesian,
       billboard: {
          image: customPresetPawn, // default: undefined
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
          width: 50, // default: undefined
          height: 50, // default: undefined
        },
      });
    } else {
        sensorPawn = viewer.entities.add({
          id: 'viewshedCenterPoint',
          position: cartesian,
          point: {
            color: Cesium.Color.YELLOW,
            pixelSize: 24,
            outlineWidth: 0,
            verticalOrigin: Cesium.VerticalOrigin.BOTTOM, // default: CENTER
          },
        });
      }
    }
}

function setModelValue(key, val) {
  viewModel[key] = val;
}

function getCorrectHeightCartographicDegree(cartographic, viewer) {
  let correctHeight = +(cartographic.height - viewer.scene.globe.getHeight(cartographic)).toFixed(2);
  
  if(viewModel.isAltitudeAttachedToTerrain && viewModel.chosenPerspective) {
    correctHeight += viewModel.chosenPerspective.height;
  }
  setModelValue("modelHeightAtPos", correctHeight);



  return {
    latitude: toDegrees(cartographic.latitude),
    longitude: toDegrees(cartographic.longitude),
    height: correctHeight,
  };
}

function getPosition(movement, viewer) {
  const feature = viewer.scene.pick(movement.position);
  if (Cesium.defined(feature) && viewer.scene.pickPositionSupported) {
      const cartesian = viewer.scene.pickPosition(movement.position);
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);

      const cartographicDegrees = getCorrectHeightCartographicDegree(cartographic, viewer);

      if(!viewModel.isAltitudeAttachedToTerrain) {
        cartographicDegrees.height = viewModel.altitude;
      }
    
      // const height = (cartographic.height - scene.globe.getHeight(cartographic)).toFixed(2) + ' m';
    
      // annotations.add({
      //     position : cartesian,
      //     text : height,
      //     horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
      //     verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
      //     eyeOffset : new Cesium.Cartesian3(0.0, 0.0, -1.0)
      // });

      addSensorPawn(cartesian, viewer);

      return cartographicDegrees;
  }

}