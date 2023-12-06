function CesiumSdkViewshedMixin(viewer, options) {
    const DEFAULT_OPTIONS = { publicUrl: '.', disablePick: false };
    options = {...DEFAULT_OPTIONS, ...options};
    
    function CesiumViewshedTool(viewer, options) {
      const DEFAULT_X_HALF_ANGLE = 25;
      const DEFAULT_Y_HALF_ANGLE = 30;
      const DEFAULT_360_VIEW = true;
      const DEFAULT_PANEL_COLLAPSED = true;
      const DEFAULT_CHOSEN_PERSPECTIVE = "soldier";
      const REAL_WORLD_VERTICAL_DEGREE_OFFSET = 90;
      const DEFUALT_CONE = 90 - REAL_WORLD_VERTICAL_DEGREE_OFFSET;
      const ENABLE_SENSOR_POINT_DRAGGING = true;
      const FLATPICKR_DATE_FROMAT = 'd-m-Y H:i';
      const MAX_MOON_INTENSITY = 0.1; // moonlight illuminates the earth in the range of 0.05-0.1 lux
      const MIN_MOON_INTENSITY = 0.05;
      const NO_DATA = -9999;
      const CAMERA_MOVEMENT_SMOOTHNESS = 600; //it would make one full circle in roughly 600 frames
      const CAMERA_MOVEMENT_RANGE_FACTOR = 3; // when in drone/rotating mode radius multiplier factor
      const CAMERA_ROTATION_DIR = -1; //counter-clockwise; +1 would be clockwise
      const CAMERA_PITCH = -Math.PI/8; //looking down at 45/2 degrees (PI/8)

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
      let showViewshed = true;
      let showIntersection = false;
      let showThroughEllipsoid = true;
      let is360View = DEFAULT_360_VIEW;
      let isViewshedModeOn = false;
      let isPanelCollapsed = DEFAULT_PANEL_COLLAPSED;
      let showAdvancedFields = false;
      let showLightingFields = false;
      let enableLighting = false;
      let enableCameraFlight = false;
      let isAltitudeAttachedToTerrain = true;
      let chosenPerspective = DEFAULT_CHOSEN_PERSPECTIVE;
      
      let sensorPawn;
      
      const scratchIcrfToFixed = new Cesium.Matrix3();
      const scratchMoonPosition = new Cesium.Cartesian3();
      const scratchMoonDirection = new Cesium.Cartesian3();
      function getMoonDirection(result) {
        result = Cesium.defined(result) ? result : new Cesium.Cartesian3();
        const icrfToFixed = scratchIcrfToFixed;
        const date = viewer.clock.currentTime;
        if (
          !Cesium.defined(
            Cesium.Transforms.computeIcrfToFixedMatrix(date, icrfToFixed)
          )
        ) {
          Cesium.Transforms.computeTemeToPseudoFixedMatrix(date, icrfToFixed);
        }
        const moonPosition = Cesium.Simon1994PlanetaryPositions.computeMoonPositionInEarthInertialFrame(
          date,
          scratchMoonPosition
        );
        Cesium.Matrix3.multiplyByVector(
          icrfToFixed,
          moonPosition,
          moonPosition
        );
        const moonDirection = Cesium.Cartesian3.normalize(
          moonPosition,
          scratchMoonDirection
        );
        return Cesium.Cartesian3.negate(moonDirection, result);
      }

      const moonLight = new Cesium.DirectionalLight({
        direction: getMoonDirection(), 
        color: new Cesium.Color(0.9, 0.925, 1.0), //new Cesium.Color(1.0, 0, 0), 
        intensity: MAX_MOON_INTENSITY,
      });

      const sunLight = new Cesium.SunLight();

      this.viewer = viewer;
      this.options = options;
      const self = this;

      initDomElements();
      initViewModel();

      function initDomElements () {
          const viewerContainer = self.viewer.container;
          const cesiumToolbarContainer = document.querySelector(".cesium-viewer-toolbar");

          const viewshedButtonHTML = `<div class="cesium-button cesium-toolbar-button toggle-viewshed-button" title="שטח נצפה" data-bind="css: { toggled: isViewshedModeOn },click: toggleIsViewshedModeOn">
        <img src="${window.location.origin}${self.options.publicUrl}/CesiumSdkViewshedMixin/assets/viewshed.svg" alt="viewshed"/>
      </div>`;
          const viewshedControlPanelHTML = `<div id="viewshedConfigPanel" data-bind="style: { display: isViewshedModeOn ? 'block' : 'none'  }, css: { open: !isPanelCollapsed, 'cesium-button cesium-toolbar-button': isPanelCollapsed }">
              <div id="panelTitle">
                <h2>שטח נצפה</h2>
                <div class="viewshedToolsContainer">
                  <div data-bind="click: toggle360View, css: { toggled: is360View }" class="cesium-button cesium-toolbar-button">
                    <img class="toolButton" width="30" height="30" title="צפה ב-360°" src="${window.location.origin}${self.options.publicUrl}/CesiumSdkViewshedMixin/assets/360-degrees.png" alt="toggle_360_view"/>
                  </div>
                  <div data-bind="click: toggleFOVVolume, css: { toggled: showLateralSurfaces }" class="cesium-button cesium-toolbar-button">
                    <img class="toolButton" width="30" height="30" title="הצג אזור לחישוב" src="${window.location.origin}${self.options.publicUrl}/CesiumSdkViewshedMixin/assets/field-of-view.png" alt="toggle_show_fov_volume"/>
                  </div>
                  <div data-bind="click: toggleLighting, css: { toggled: enableLighting }" class="cesium-button cesium-toolbar-button">
                    <img class="toolButton" width="30" height="30" title="הצג תאורה" src="${window.location.origin}${self.options.publicUrl}/CesiumSdkViewshedMixin/assets/flash-light.png" alt="toggle_show_fov_volume"/>
                  </div>
                  <div data-bind="click: toggleCameraFlight, css: { toggled: enableCameraFlight }" class="cesium-button cesium-toolbar-button">
                    <img class="toolButton" width="30" height="30" title="טיסה סיבובית" src="${window.location.origin}${self.options.publicUrl}/CesiumSdkViewshedMixin/assets/drone-camera.png" alt="toggle_show_fov_volume"/>
                  </div>
                </div>
              </div>
              <p id="closePanel" data-bind="click: togglePanelCollapsed"><sup>⇱</sup><sub>⇲</sub></p>
              <div id="panel">
                <table id="viewshedConfigTable">
                  <tbody>
                    <tr>
                      <td>הצמד גובה למודל</td>
                      <td id="customPerspectiveCell">
                        <input data-bind="checked: isAltitudeAttachedToTerrain" type="checkbox" name="attachHeightToModel" align="">
                        <span>לפי: </span>
                        <div class="viewshedToolsContainer customPerspectivesContainer" data-bind="foreach: perspectivePresets">
                          <div data-bind="click: onClick, css: { toggled: $parent.chosenPerspective && $parent.chosenPerspective.perspective === perspective , disabled: !$parent.isAltitudeAttachedToTerrain}" class="cesium-button cesium-toolbar-button">
                            <img class="toolButton" width="30" height="30" data-bind="attr: {src: icon, title: '+' + height + ' ' + \`מ'\`}"/>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>גובה לפי מודל (מ')</td>
                      <td id="altitudeSlider">
                        <input type="range" min="0.0" max="1000.0" step="0.1" data-bind="value:altitude, valueUpdate: 'input', disable: isAltitudeAttachedToTerrain" style="width: 150px">
                      </td>
                      <td>
                        <input type="number" size="5" step="1" data-bind="value: altitude, valueUpdate: 'input', disable: isAltitudeAttachedToTerrain" style="width: 80px">
                      </td>
                    </tr>
                    <tr>
                      <td>מרחק חישוב (מ')</td>
                      <td id="radiusSlider">
                        <input type="range" min="0.0" max="1000.0" step="100" data-bind="value:radius, valueUpdate: 'input'" style="width: 150px">
                      </td>
                      <td>
                        <input type="number" size="5" step="10" data-bind="value: radius, valueUpdate: 'input'" style="width: 80px">
                      </td>
                    </tr>
                    <tr>
                      <td>אזימוט°</td>
                      <td id="clockSlider">
                        <input type="range" min="0" max="360" step="1" data-bind="value:clock, valueUpdate: 'input'" style="width: 150px">
                      </td>
                      <td>
                        <input type="number" size="5" step="1" data-bind="value: clock, valueUpdate: 'input'" style="width: 80px">
                      </td>
                    </tr>
                    <tr>
                      <td>כיוון צפייה אנכי°</td>
                      <td id="coneSlider">
                        <input type="range" min="-90" max="90" step="1" data-bind="value:cone, valueUpdate: 'input'" style="width: 150px">
                      </td>
                      <td>
                        <input type="number" min="-90" max="90" size="5" step="1" data-bind="value: cone, valueUpdate: 'input'" style="width: 80px">
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p data-bind="click: toggleShowLightingFields" id="toggleLightingFields">
                          מצב תאורה
                          <span data-bind="if: !showLightingFields">+</span>
                          <span data-bind="if: showLightingFields">-</span>
                        </p>
                      </td>
                    </tr>
                    <tr class="coordinatesRow" data-bind="if: showLightingFields">
                      <td>
                        תאריך וזמן
                      </td>
                      <td>
                        <input id=lightingDate data-bind="datetimepicker:lightingDateTime" style="width: 110px;direction: ltr;">
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p data-bind="click: toggleShowAdvancedFields" id="toggleAdvancedFields">
                          שימוש מתקדם 
                          <span data-bind="if: !showAdvancedFields">+</span>
                          <span data-bind="if: showAdvancedFields">-</span>
                        </p>
                      </td>
                    </tr>
                    <tr class="coordinatesRow" data-bind="if: showAdvancedFields">
                      <td>
                        נקודת אורך <input type="number" size="5" step="0.00001" data-bind="value: longitude, valueUpdate: 'input'" style="width: 80px">
                      </td>
        
                      <td>
                        נקודת רוחב <input type="number" size="5" step="0.00001" data-bind="value: latitude, valueUpdate: 'input'" style="width: 80px">
                      </td>
                    </tr>
                    <tr data-bind="if: showAdvancedFields">
                      <td>חצי זווית צפיה לאורך</td>
                      <td id="xHalfAngleSlider">
                        <input type="range" min="1.0" max="90.0" step="1" data-bind="value:xHalfAngle, valueUpdate: 'input', disable: is360View" style="width: 150px">
                      </td>
                      <td>
                        <input type="number" min="1.0" max="90.0" size="5" step="1" data-bind="value: xHalfAngle, valueUpdate: 'input', disable: is360View" style="width: 80px">
                      </td>
                    </tr>
                    <tr data-bind="if: showAdvancedFields">
                      <td>חצי זווית צפיה לרוחב</td>
                      <td id="yHalfAngleSlider">
                        <input type="range" min="1.0" max="90.0" step="1" data-bind="value:yHalfAngle, valueUpdate: 'input', disable: is360View" style="width: 150px">
                      </td>
                      <td>
                        <input type="number" min="1.0" max="90.0" size="5" step="1" data-bind="value: yHalfAngle, valueUpdate: 'input', disable: is360View" style="width: 80px">
                      </td>
                    </tr>
                    <!-- <tr>
                      <td>Twist</td>
                      <td id="twistSlider">
                        <input type="range" min="-3.14" max="3.14" step="0.01" data-bind="value:twist, valueUpdate: 'input'" style="width: 150px">
                      </td>
                      <td>
                        <input type="number" size="5" step="0.01" data-bind="value: twist, valueUpdate: 'input'" style="width: 80px">
                      </td>
                    </tr> -->
                    <!-- <tr>
                      <td>
                        <label for="portionMenu">Select portion to display</label>
                      </td>
                      <td colspan="2">
                        <select id="portionMenu" data-bind="options: portionOptions, value: selectedPortion"></select>
                      </td>
                    </tr> -->
                  </tbody>
                </table>
                <!-- <table>
                  <tbody>
                    <tr>
                      <td>Show Ellipsoid Horizon Surfaces</td>
                      <td id="ellipsoidHorizonCheckBox" colspan="2">
                        <input type="checkbox" data-bind="checked: showEllipsoidHorizonSurfaces">
                      </td>
                    </tr> 
                    <tr>
                      <td>Show Dome Surfaces</td>
                      <td id="domeCheckBox" colspan="2">
                        <input type="checkbox" data-bind="checked: showDomeSurfaces">
                      </td>
                    </tr>
                    <tr>
                      <td>Show Ellipsoid Surfaces</td>
                      <td id="ellipsoidCheckBox" colspan="2">
                        <input type="checkbox" data-bind="checked: showEllipsoidSurfaces">
                      </td>
                    </tr>
                  </tbody>
                </table> -->
      </div>`;
          const viewshedTilesLoading = `<div data-bind="hidden: !hasChosenPosition || !tilesLoading, style: {display: tilesLoading && hasChosenPosition ? 'block' : 'none'}" class="tilesLoadingContainer">
          <img width="50" height="50" src="${window.location.origin}${self.options.publicUrl}/CesiumSdkViewshedMixin/assets/loading.svg" alt="tiles loading" />
          <p>מחשב...</p>
        </div>`;

          cesiumToolbarContainer.insertAdjacentHTML("afterbegin", viewshedButtonHTML);
          viewerContainer.insertAdjacentHTML("beforeend", viewshedControlPanelHTML);
          viewerContainer.insertAdjacentHTML("beforeend", viewshedTilesLoading);
      }

      function initViewModel () {
          function handleCustomPerspectiveClick(viewModel, setModelValue) {
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

          let nextSunriseDate = new Date();
          function lightChanger (scene, time)  {
            // ***** EXAMPLE HOW TO UPDATE SHADER PARAM. 
            // ***** customShaderWithParams IN THIS EXAMPLE EXPOSED AS GLOBAL VARIABLE
            // const sunPosition = new Cesium.Cartesian3();
            // Cesium.Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(time, sunPosition);
            // customShaderWithParams.setUniform('customLightDirection', sunPosition);

            function setNightStyleTo3DTilesets(isNight){
              for(let i=0; i < scene.primitives.length; i++){
                if(scene.primitives.get(i).constructor.name === 'Cesium3DTileset'){
                  if(isNight){
                    scene.primitives.get(i).style = new Cesium.Cesium3DTileStyle({
                      color: {
                          conditions: [
                              ['true', `color('#4f5a73')`]
                          ]
                      }
                    });
                  } else {
                    scene.primitives.get(i).style = null;
                  }
                }
              }
            }

            const currentDate = Cesium.JulianDate.toDate(time);
            const times = SunCalc.getTimes(
              currentDate,
              toDegrees(scene.camera.positionCartographic.latitude),
              toDegrees(scene.camera.positionCartographic.longitude)
            );

            if(scene.light != moonLight && (currentDate > times.sunset || currentDate < times.sunrise) ){
              scene.light = moonLight;

              const followingDate = new Date(times.sunset.getTime() + 86400000);
              const nextTimes = SunCalc.getTimes(
                followingDate,
                toDegrees(scene.camera.positionCartographic.latitude),
                toDegrees(scene.camera.positionCartographic.longitude)
              );
              nextSunriseDate = nextTimes.sunrise;
            }

            if (scene.light === moonLight) {
              scene.light.direction = getMoonDirection(scene.light.direction);
              const moonFraction = SunCalc.getMoonIllumination(currentDate).fraction;
              scene.light.intensity = Math.max(MAX_MOON_INTENSITY * moonFraction, MIN_MOON_INTENSITY);
              setNightStyleTo3DTilesets(true);
            }

            if(scene.light != sunLight){
              if((currentDate > times.sunrise && currentDate < times.sunset) || currentDate > nextSunriseDate){
                scene.light = sunLight;
                setNightStyleTo3DTilesets(false);
              }
            }
          }

          let heading = 0; //or any starting angle in radians
          function cameraMover () {
            if(self.viewModel.sensorMSLHeight > NO_DATA){ //self.viewModel.modelHeightAtPos might be used but not updated accurately
              heading += CAMERA_ROTATION_DIR * Math.PI / CAMERA_MOVEMENT_SMOOTHNESS;
              let centre = new Cesium.Cartesian3.fromDegrees(self.viewModel.longitude, self.viewModel.latitude, self.viewModel.sensorMSLHeight);
              self.viewer.camera.lookAt(centre, new Cesium.HeadingPitchRange(heading, CAMERA_PITCH, self.viewModel.radius * CAMERA_MOVEMENT_RANGE_FACTOR));
            }
          }

          self.viewModel = {
              disablePick: self.options.disablePick || false,
              tilesLoading: true,
              hasChosenPosition: false,
              chosenPerspective: chosenPerspective,
              perspectivePresets: [
                  {
                      icon: `${window.location.origin}${self.options.publicUrl}/CesiumSdkViewshedMixin/assets/soldier.png`,
                      pawn: `${window.location.origin}${self.options.publicUrl}/CesiumSdkViewshedMixin/assets/soldier-pawn.png`,
                      height: 1.7,
                      perspective: "soldier",
                      onClick() {
                        handleCustomPerspectiveClick.call(this, self.viewModel, setModelValue.bind(self));
                      }
                  },
                  {
                      icon: `${window.location.origin}${self.options.publicUrl}/CesiumSdkViewshedMixin/assets/tank.png`,
                      pawn: `${window.location.origin}${self.options.publicUrl}/CesiumSdkViewshedMixin/assets/tank-pawn.png`,
                      height: 2.66,
                      perspective: "tank",
                      onClick() {
                        handleCustomPerspectiveClick.call(this, self.viewModel, setModelValue.bind(self));
                      }
                  }
              ],
              isViewshedModeOn: isViewshedModeOn,
              toggleIsViewshedModeOn: function () {
                  this.isViewshedModeOn = !this.isViewshedModeOn;
                  isViewshedModeOn = this.isViewshedModeOn;

                  if (isViewshedModeOn) {
                      this.isPanelCollapsed = DEFAULT_PANEL_COLLAPSED;
                      this.is360View = DEFAULT_360_VIEW;
                      this.showLateralSurfaces = false;
                      this.isAltitudeAttachedToTerrain = true;
                      this.chosenPerspective = this.perspectivePresets.find(
                          (perspectiveItem) =>
                              perspectiveItem.perspective === DEFAULT_CHOSEN_PERSPECTIVE
                      );
                      
                      if(!this.disablePick) {
                        self.viewer.container.style.cursor = "cell";
                      }

                      handle360View(this.is360View);
                      updateSensor();
                  } else {
                    self.destroy();
                  }
                  this.hasChosenPosition = false;
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
                  if (this.is360View) {
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
              toggleLighting: function() {
                this.toggleShowLightingFields();
                this.enableLighting = !this.enableLighting;
                self.viewer.shadows = this.enableLighting;

                const scene = self.viewer.scene;
                if(this.enableLighting){
                  scene.preRender.addEventListener(lightChanger);
                } else {
                  scene.preRender.removeEventListener(lightChanger);
                }

                Cesium.knockout.getObservable(self.viewer.clockViewModel,'shouldAnimate').subscribe(function(isAnimating) {
                  if (isAnimating) {
                    console.log('Cesium clock is animating.');
                  } else {
                    const currentDate = Cesium.JulianDate.toDate(self.viewer.clockViewModel.currentTime);
                    self.viewModel.lightingDateTime = currentDate;
                    document.getElementById('lightingDate').value = flatpickr.formatDate(currentDate, FLATPICKR_DATE_FROMAT);
                    console.log('Cesium clock is paused.');
                  }
                });
              },
              toggleShowLightingFields: function () {
                this.showLightingFields = !this.showLightingFields;

                self.viewer.animation.container.style.display = this.showLightingFields ? 'block' : 'none';
                self.viewer.timeline.container.style.display = this.showLightingFields ? 'block' : 'none';
              },
              toggleCameraFlight: function () {
                this.enableCameraFlight = !this.enableCameraFlight;

                
                if(this.enableCameraFlight){
                  self.viewer.clock.onTick.addEventListener(cameraMover);
                } else {
                  self.viewer.clock.onTick.removeEventListener(cameraMover);
                  self.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
                }

              },
              isAltitudeAttachedToTerrain: isAltitudeAttachedToTerrain,
              modelHeightAtPos: NO_DATA,
              is360View: is360View,
              showAdvancedFields: showAdvancedFields,
              showLightingFields: showLightingFields,
              enableLighting: enableLighting,
              enableCameraFlight: enableCameraFlight,
              sensorMSLHeight: NO_DATA,
              lightingDateTime: Cesium.knockout.observable(new Date()),
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
              portionOptions: ["Complete", "Below ellipsoid horizon", "Above ellipsoid horizon"],
              selectedPortion: portion
          };

          Cesium.knockout.bindingHandlers.datetimepicker = {
            init: function (element, valueAccessor, allBindingsAccessor) {
              const ko = Cesium.knockout;
              const options = { 
                dateFormat: FLATPICKR_DATE_FROMAT, 
                time_24hr: true,
                enableTime: true ,
                ...allBindingsAccessor().datetimepickerOptions
              };
              const $el = element,
                    picker = new flatpickr(element, options),
                    observable = Cesium.knockout.observable(valueAccessor());
          
              //handle the field changing by registering datepicker's changeDate event
              ko.utils.registerEventHandler(element, "change", function () {
                observable(picker.parseDate($el.value));
              });
              
              //handle disposal (if KO removes by the template binding)
              ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                $el.flatpickr("destroy");
              });
              
              observable.subscribe(function(newVal) {
                self.viewer.clock.currentTime = new Cesium.JulianDate.fromDate(newVal);
                $el.value = picker.formatDate(newVal, options.dateFormat);
              });
          
              picker.setDate(ko.unwrap(observable));
            },
            update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
              element._flatpickr.setDate(viewModel.lightingDateTime);
            }
          };
          

          Cesium.knockout.track(self.viewModel);

          const viewshedButton = document.querySelector(".toggle-viewshed-button");
          const viewshedConfigPanel = document.getElementById("viewshedConfigPanel");
          const modelLoadingContainer = document.querySelector(".tilesLoadingContainer");

          if (viewshedButton && viewshedConfigPanel) {
              Cesium.knockout.applyBindings(self.viewModel, modelLoadingContainer);
              Cesium.knockout.applyBindings(self.viewModel, viewshedConfigPanel);
              Cesium.knockout.applyBindings(self.viewModel, viewshedButton);
          }

          Cesium.knockout.getObservable(self.viewModel, "disablePick").subscribe((value) => {
              if (value) {
                self.viewer.container.style.cursor = "initial";
              } else {
                self.viewer.container.style.cursor = "cell";
              }
          });
          
          Cesium.knockout.getObservable(self.viewModel, "hasChosenPosition").subscribe((value) => {
              if (value) {
                self.viewModel.isPanelCollapsed = false;
              }
          });

          Cesium.knockout
              .getObservable(self.viewModel, "isAltitudeAttachedToTerrain")
              .subscribe((value) => {
                  if (value) {
                      setModelValue("altitude", self.viewModel.modelHeightAtPos);
                  } else {
                      if (self.viewModel.chosenPerspective) {
                          setModelValue(
                              "altitude",
                              self.viewModel.altitude - self.viewModel.chosenPerspective.height
                          );
                          setModelValue("chosenPerspective", undefined);
                      }
                  }
              });

          Cesium.knockout.getObservable(self.viewModel, "is360View").subscribe((value) => {
              handle360View(value);
          });

          Cesium.knockout.getObservable(self.viewModel, "longitude").subscribe((value) => {
              longitude = parseFloat(value) || 0;

              updateModelMatrix();

              const newPos = new Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
              addSensorPawn(newPos);
          });

          Cesium.knockout.getObservable(self.viewModel, "latitude").subscribe((value) => {
              latitude = parseFloat(value) || 0;
              updateModelMatrix();

              const newPos = new Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
              addSensorPawn(newPos);
          });

          Cesium.knockout.getObservable(self.viewModel, "altitude").subscribe((value) => {
              const heightWithoutTerrain = parseFloat(value) || 0;
              const terrainHeightAtPos = viewer.scene.globe.getHeight(
                  new Cesium.Cartographic.fromDegrees(longitude, latitude)
              );

              altitude = heightWithoutTerrain + terrainHeightAtPos;
              updateModelMatrix();

              const newPos = new Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
              addSensorPawn(newPos);
          });

          Cesium.knockout.getObservable(self.viewModel, "radius").subscribe((value) => {
              radius = parseFloat(value) || 1;
              updateSensor();
          });

          Cesium.knockout.getObservable(self.viewModel, "xHalfAngle").subscribe((value) => {
              xHalfAngle = Math.min(Math.max(parseFloat(value || 1), 1), 90);
              updateSensor();
          });

          Cesium.knockout.getObservable(self.viewModel, "yHalfAngle").subscribe((value) => {
              yHalfAngle = Math.min(Math.max(parseFloat(value || 1), 1), 90);
              updateSensor();
          });

          Cesium.knockout.getObservable(self.viewModel, "clock").subscribe((value) => {
              clock = parseFloat(value) || 0;
              updateModelMatrix();
          });

          Cesium.knockout.getObservable(self.viewModel, "cone").subscribe((value) => {
              cone = parseFloat(value) || 0;
              updateModelMatrix();
          });

          Cesium.knockout.getObservable(self.viewModel, "twist").subscribe((value) => {
              twist = parseFloat(value) || 0;
              updateModelMatrix();
          });

          Cesium.knockout.getObservable(self.viewModel, "selectedPortion").subscribe((value) => {
              switch (value) {
                  case "Below ellipsoid horizon":
                      portion = Cesium.SensorVolumePortionToDisplay.BELOW_ELLIPSOID_HORIZON;
                      break;
                  case "Above ellipsoid horizon":
                      portion = Cesium.SensorVolumePortionToDisplay.ABOVE_ELLIPSOID_HORIZON;
                      break;
                  default:
                      portion = Cesium.SensorVolumePortionToDisplay.COMPLETE;
                      break;
              }

              self.viewModel.sensor.portionToDisplay = portion;
          });

          Cesium.knockout.getObservable(self.viewModel, "showLateralSurfaces").subscribe((value) => {
              showLateralSurfaces = value;
              showDomeSurfaces = value;
              self.viewModel.sensor.showLateralSurfaces = showLateralSurfaces;
              self.viewModel.sensor.showDomeSurfaces = showLateralSurfaces;
          });

          Cesium.knockout
              .getObservable(self.viewModel, "showEllipsoidHorizonSurfaces")
              .subscribe((value) => {
                  showEllipsoidHorizonSurfaces = value;
                  self.viewModel.sensor.showEllipsoidHorizonSurfaces = showEllipsoidHorizonSurfaces;
              });

          Cesium.knockout
              .getObservable(self.viewModel, "showEllipsoidSurfaces")
              .subscribe((value) => {
                  showEllipsoidSurfaces = value;
                  self.viewModel.sensor.showEllipsoidSurfaces = showEllipsoidSurfaces;
              });

          const viewshedEventHandler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);

          // -------------- Handle pick position ------------
          viewshedEventHandler.setInputAction((movement) => {
              if (self.viewModel.isViewshedModeOn && !self.viewModel.disablePick) {
                  const position = getPosition(movement);

                  if (position) {
                      setModelValue("latitude", position.latitude);
                      setModelValue("longitude", position.longitude);
                      setModelValue("altitude", position.height);
                      if (!self.viewModel.hasChosenPosition) {
                          setModelValue("hasChosenPosition", true);
                      }
                  }
              }
          }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

          if (ENABLE_SENSOR_POINT_DRAGGING) {
              // -------------- Handle viewshed center point dragging ------------
              onCesiumObjectDrag(self.viewer, "viewshedCenterPoint", (draggingMovement) => {
                  const positionCartographic = getPosition(
                      { position: draggingMovement.endPosition }
                  );

                  setModelValue("latitude", positionCartographic.latitude);
                  setModelValue("longitude", positionCartographic.longitude);
                  setModelValue("altitude", positionCartographic.height);
              });
          }
      }
      
      function handle360View (is360View) {
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
      
      function getModelMatrix (ellipsoid) {
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
      
      function updateSensor () {
        const ellipsoid = self.viewer.scene.globe.ellipsoid;
      
        self.viewer.scene.primitives.remove(self.viewModel.sensor);
        self.viewModel.sensor = addRectangularSensor(ellipsoid);
        self.viewer.scene.primitives.add(self.viewModel.sensor);
      }
      
      function updateModelMatrix() {
        const ellipsoid = self.viewer.scene.globe.ellipsoid;
        self.viewModel.sensor.modelMatrix = getModelMatrix(ellipsoid);
      }
      
      
      function addRectangularSensor (ellipsoid) {
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
        rectangularSensor.classificationType = classificationType
      
        return rectangularSensor;
      }
      
      
      function addSensorPawn(cartesian) {
        const SHOW_PAWN_ICON = false;
      
        const cartographic = self.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        Cesium.sampleTerrainMostDetailed(self.viewer.terrainProvider,[cartographic])
            .then(
              (updatedWithHeight)=>{
                self.viewModel.sensorMSLHeight = updatedWithHeight[0].height + self.viewModel.altitude;
              },
              () => {
                self.viewModel.sensorMSLHeight = self.viewModel.altitude;
              }
            );

        self.viewer.entities.remove(sensorPawn);
        if (Cesium.defined(cartesian)) {
          if(self.viewModel.chosenPerspective && SHOW_PAWN_ICON) {
            const customPresetPawn = self.viewModel.chosenPerspective.pawn;
      
            sensorPawn = self.viewer.entities.add({
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
              sensorPawn = self.viewer.entities.add({
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
        self.viewModel[key] = val;
      }
      
      function getCorrectHeightCartographicDegree(cartographic) {
        let correctHeight = +(cartographic.height - self.viewer.scene.globe.getHeight(cartographic)).toFixed(2);
        
        if(self.viewModel.isAltitudeAttachedToTerrain && self.viewModel.chosenPerspective) {
          correctHeight += self.viewModel.chosenPerspective.height;
        }
        setModelValue("modelHeightAtPos", correctHeight);
      
        return {
          latitude: toDegrees(cartographic.latitude),
          longitude: toDegrees(cartographic.longitude),
          height: correctHeight,
        };
      }
      
      function getPosition(movement) {
        const feature = self.viewer.scene.pick(movement.position);
        if (Cesium.defined(feature) && self.viewer.scene.pickPositionSupported) {
            const cartesian = self.viewer.scene.pickPosition(movement.position);
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      
            const cartographicDegrees = getCorrectHeightCartographicDegree(cartographic);
      
            if(!self.viewModel.isAltitudeAttachedToTerrain) {
              cartographicDegrees.height = self.viewModel.altitude;
            }
          
            // const height = (cartographic.height - scene.globe.getHeight(cartographic)).toFixed(2) + ' m';
          
            // annotations.add({
            //     position : cartesian,
            //     text : height,
            //     horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
            //     verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
            //     eyeOffset : new Cesium.Cartesian3(0.0, 0.0, -1.0)
            // });
      
            addSensorPawn(cartesian);
      
            return cartographicDegrees;
        }
      
      }

      function onCesiumObjectDrag(viewer, featureId, onDragging) {
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
      
      function toDegrees(num) {
        return num * (180 / Math.PI);
      };

      this.destroy = function () {
          // Cesium Destroy this instance
          self.viewModel.latitude = 0;
          self.viewModel.longitude = 0;
          self.viewModel.altitude = -1000;

          self.viewer.container.style.cursor = "initial";
          self.viewer.scene.primitives.remove(self.viewModel.sensor);
      }

      this.setIsLoading = function(isLoading) {
        setModelValue('tilesLoading', isLoading);
      }

      this.disablePick = function(viewshedPickingDisabled) {
        setModelValue('disablePick', viewshedPickingDisabled);
      }

      
    }

    if (typeof Cesium === "undefined") {
        throw new Error("[CesiumSdkViewshedMixin] Cesium is required.");
    }

    if(typeof Cesium.RectangularSensor === "undefined") {
      throw new Cesium.DeveloperError("[CesiumSdkViewshedMixin] Cesium ION SDK is required in order to use RectangularSensor.");
    }

    if (!Cesium.defined(viewer)) {
        throw new Cesium.DeveloperError("[CesiumSdkViewshedMixin] Viewer is required.");
    }

    const cesiumViewshedTool = new CesiumViewshedTool(viewer, options);

    // Modify the destroy function to use viewshed tool's as well.
    const viewerDestoryFunc = viewer.destroy;

    viewer.destroy = function () {
        viewerDestoryFunc.apply(viewer, arguments);
        cesiumViewshedTool.destroy();
    };

    // Add viewshed tool as a viewer property, might be useful.
    Object.defineProperties(viewer, {
        viewshedTool: {
            get: function () {
                return cesiumViewshedTool;
            }
        }
    });
}