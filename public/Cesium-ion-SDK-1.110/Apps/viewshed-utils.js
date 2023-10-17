function createRectangularSensor(options, viewer) {
  const headingPitchRoll = new Cesium.HeadingPitchRoll(
    Cesium.Math.toRadians(options.heading),
    Cesium.Math.toRadians(options.pitch),
    Cesium.Math.toRadians(options.roll)
  );
  const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
    options.center,
    headingPitchRoll
  );
  const rotation = Cesium.Matrix4.getMatrix3(
    modelMatrix,
    new Cesium.Matrix3()
  );
  const orientation = Cesium.Quaternion.fromRotationMatrix(rotation);

  const lateralSurfaceMaterial = new Cesium.GridMaterialProperty();
  lateralSurfaceMaterial.color = new Cesium.Color(0.0, 1.0, 1.0, 1.0);
  lateralSurfaceMaterial.cellAlpha = 0.5;
  lateralSurfaceMaterial.lineCount = { x: 12, y: 10 };

  const domeSurfaceMaterial = new Cesium.GridMaterialProperty();
  domeSurfaceMaterial.color = new Cesium.Color(1.0, 1.0, 0.0, 1.0);
  domeSurfaceMaterial.cellAlpha = 0.5;
  domeSurfaceMaterial.lineCount = { x: 12, y: 12 };

  const rectangularSensor = {
    radius: options.radius,
    xHalfAngle: Cesium.Math.toRadians(options.xHalfAngle),
    yHalfAngle: Cesium.Math.toRadians(options.yHalfAngle),
    lateralSurfaceMaterial: lateralSurfaceMaterial,
    domeSurfaceMaterial: domeSurfaceMaterial,
    environmentConstraint: true,
    showEnvironmentOcclusion: true,
    showEnvironmentIntersection: true,
    showLateralSurfaces: false,
    showEllipsoidHorizonSurfaces: false,
    showDomeSurfaces: false,
    showEllipsoidSurfaces: false,
    showViewshed: true,
    viewshedVisibleColor: options.viewshedVisibleColor,
    viewshedOccludedColor: options.viewshedOccludedColor,
    classificationType: options.classificationType,
    showIntersection: false,
    showThroughEllipsoid: true,
  };

  return viewer.entities.add({
    position: options.center,
    orientation: orientation,
    rectangularSensor: rectangularSensor,
  });
}

function setSensorOrientation(sensor, radianAngle = 0) {
  const zAngle = 0.0;
  const yAngle = Cesium.Math.PI_OVER_TWO;
  let headingRotation = radianAngle;

  let rotationZ = Cesium.Matrix3.fromRotationZ(zAngle);
  const rotationY = Cesium.Matrix3.fromRotationY(yAngle);
  const rotation = Cesium.Matrix3.multiply(
    rotationY,
    rotationZ,
    new Cesium.Matrix3()
  );
  rotationZ = Cesium.Matrix3.fromRotationZ(headingRotation);
  Cesium.Matrix3.multiply(rotationZ, rotation, rotation);

  const rotationTranslation = Cesium.Matrix4.fromRotationTranslation(
    rotation,
    Cesium.Cartesian3.ZERO
  );
  const enu = Cesium.Transforms.eastNorthUpToFixedFrame(
    sensor.position.getValue(Cesium.JulianDate.now())
  );

  const modelMatrix = Cesium.Matrix4.multiply(
    enu,
    rotationTranslation,
    new Cesium.Matrix4()
  );
  const orientation = Cesium.Quaternion.fromRotationMatrix(
    Cesium.Matrix4.getMatrix3(modelMatrix, new Cesium.Matrix3())
  );

  sensor.orientation = orientation;
}