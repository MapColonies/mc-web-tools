
let longitude = 0;
let latitude = 0;
let altitude = -10;
let radius = 100;
let xHalfAngle = 20;
let yHalfAngle = 20;
let classificationType = Cesium.ClassificationType.BOTH;
let clock = 0.0;
let cone = Cesium.Math.toRadians(90.0);
let twist = 0.0;
let portion = Cesium.SensorVolumePortionToDisplay.COMPLETE;
let showLateralSurfaces = false;
let showEllipsoidHorizonSurfaces = false;
let showDomeSurfaces = false;
let showEllipsoidSurfaces = false;
let showViewshed =  true;
let showIntersection = false;
let showThroughEllipsoid =  true;
let isViewshedModeOn = false;

let yellowPoint;


const viewModel = {
  isViewshedModeOn: isViewshedModeOn,
  toggleIsViewshedModeOn: function() {
    this.isViewshedModeOn = !this.isViewshedModeOn;
    isViewshedModeOn = this.isViewshedModeOn;

      if(isViewshedModeOn) {
        updateSensor();
      } else {
        viewModel.latitude = 0;
        viewModel.longitude = 0;
        viewModel.altitude = -10;

        // Cesium.destroyObject(viewshedSensor);

        viewer.scene.primitives.remove(this.sensor);
        // handler && handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      }
  },
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
Cesium.knockout.applyBindings(viewModel, viewshedConfigPanel);
Cesium.knockout.applyBindings(viewModel, viewshedButton);

Cesium.knockout
    .getObservable(viewModel, "longitude")
    .subscribe(function (value) {
      longitude = parseFloat(value) || 0;

      updateModelMatrix();

      const newPos = new Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
      addYellowPoint(newPos, viewer);
    });

  Cesium.knockout
    .getObservable(viewModel, "latitude")
    .subscribe(function (value) {
      latitude = parseFloat(value) || 0;
      updateModelMatrix();

      const newPos = new Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
      addYellowPoint(newPos, viewer);
    });

  Cesium.knockout
    .getObservable(viewModel, "altitude")
    .subscribe(function (value) {
      const heightWithoutTerrain = parseFloat(value) || 0;
      const terrainHeightAtPos = viewer.scene.globe.getHeight(new Cesium.Cartographic.fromDegrees(longitude, latitude));
      
      altitude = heightWithoutTerrain + terrainHeightAtPos;
      updateModelMatrix();

      const newPos = new Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
      addYellowPoint(newPos, viewer);
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
      xHalfAngle = parseFloat(value) || 1;
      updateSensor()
    });

  Cesium.knockout
    .getObservable(viewModel, "yHalfAngle")
    .subscribe(function (value) {
      yHalfAngle = parseFloat(value) || 1;
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

  // Cesium.knockout
  //   .getObservable(viewModel, "showDomeSurfaces")
  //   .subscribe(function (value) {
  //     showDomeSurfaces = value;
  //    viewModel.sensor.showDomeSurfaces = showDomeSurfaces;
  //   });

  Cesium.knockout
    .getObservable(viewModel, "showEllipsoidSurfaces")
    .subscribe(function (value) {
      showEllipsoidSurfaces = value;
     viewModel.sensor.showEllipsoidSurfaces = showEllipsoidSurfaces;
    });
    //#endregion

const viewshedEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

viewshedEventHandler.setInputAction((movement) => {
  if(viewModel.isViewshedModeOn) {
    const position = getPosition(movement, viewer);
  
    setModelValue("latitude", position.latitude);
    setModelValue("longitude", position.longitude);
    setModelValue("altitude", position.height);
  }

}, Cesium.ScreenSpaceEventType.LEFT_CLICK);


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
      Cesium.Matrix3.fromRotationZ(clock),
      Cesium.Matrix3.fromRotationY(cone),
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

  return rectangularSensor;
}


function addYellowPoint(cartesian, viewer) {
  viewer.entities.remove(yellowPoint);

    if (Cesium.defined(cartesian)) {
      yellowPoint = viewer.entities.add({
        id: 'viewshedCenterPoint',
        position: cartesian,
        point: {
          color: Cesium.Color.YELLOW,
          pixelSize: 24,
          outlineWidth: 0
        },
      });
    }
}

function setModelValue(key, val) {
  viewModel[key] = val;
}

function getCorrectHeightCartographicDegree(cartographic, viewer) {
  return {
    latitude: toDegrees(cartographic.latitude),
    longitude: toDegrees(cartographic.longitude),
    height: +(cartographic.height - viewer.scene.globe.getHeight(cartographic)).toFixed(2)
  };
}

function getPosition(movement, viewer) {
  const feature = viewer.scene.pick(movement.position);
  if (Cesium.defined(feature) && viewer.scene.pickPositionSupported) {
      const cartesian = viewer.scene.pickPosition(movement.position);
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    
      // const height = (cartographic.height - scene.globe.getHeight(cartographic)).toFixed(2) + ' m';
    
      // annotations.add({
      //     position : cartesian,
      //     text : height,
      //     horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
      //     verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
      //     eyeOffset : new Cesium.Cartesian3(0.0, 0.0, -1.0)
      // });

      addYellowPoint(cartesian, viewer);

      return getCorrectHeightCartographicDegree(cartographic, viewer);
  }

}

function toDegrees(num) {
  return num * (180 / Math.PI);
};