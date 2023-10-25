
function overrideMeasurementProperty(measurementConstructor, propertiesOverride) {
  const protoCpy = Object.create(measurementConstructor.prototype);
  Object.defineProperties(protoCpy, propertiesOverride);
  
  measurementConstructor.prototype = protoCpy;
}

overrideMeasurementProperty(Cesium.PolylineMeasurement, {
  instructions: {
        value: [
          "לחץ בכל נקודה כדי להתחיל לצייר קו",
          "לחץ כדי להוסיף עוד נקודות",
          "לחץ פעמיים בכל נקודה כדי להפסיק לצייר",
        ],
  },
  type: {
    value: " מדידת מרחק (פוליגון) "
  }
});

overrideMeasurementProperty(Cesium.DistanceMeasurement, {
  instructions: {
        value: [
          "לחץ בכל נקודה כדי להתחיל לצייר קו",
          "לחיצה נוספת כדי לקבע את הקו",
          "לניקוי ובחירת מיקום חדש לחישוב, בחר נקודה אחרת"
        ],
  },
  type: {
    value: "מדידת מרחק (שתי נקודות)"
  }
});

overrideMeasurementProperty(Cesium.HorizontalMeasurement, {
  instructions: {
        value: [
         "לחץ על ענן הנקודות או על הגלובוס כדי להגדיר את נקודת ההתחלה",
         "הזז את העכבר כדי לגרור את הקו",
         "לחץ על מקש Shift כדי להדק את כיוון הקו",
         "לחץ שוב כדי להגדיר את נקודת הסיום",
         "כדי לבצע מדידה חדשה, לחץ כדי לנקות את המדידה הקודמת"
        ],
  },
  type: {
    value: " מדידת מרחק אופקי "
  }
});

overrideMeasurementProperty(Cesium.VerticalMeasurement, {
  instructions: {
        value: [
          "לחץ על ענן הנקודות או על הגלובוס כדי להגדיר את נקודת ההתחלה",
          "הזז את העכבר כדי לגרור את הקו",
          "לחץ שוב כדי להגדיר את נקודת הסיום",
          "כדי לבצע מדידה חדשה, לחץ כדי לנקות את המדידה הקודמת"
        ],
  },
  type: {
    value: "מדידת מרחק אנכי"
  }
});

overrideMeasurementProperty(Cesium.HeightMeasurement, {
  instructions: {
        value: [
          "לחץ על ענן הנקודות כדי לקבל מרחק מנקודה זו לשטח",
        ],
  },
  type: {
    value: " מדידת גובה מפני השטח "
  }
});

overrideMeasurementProperty(Cesium.AreaMeasurement, {
  instructions: {
        value: [
          "לחץ כדי להתחיל לצייר פוליגון",
          "המשך ללחוץ כדי להוסיף עוד נקודות",
          "לחץ פעמיים כדי לסיים את הציור"
        ],
  },
  type: {
    value: " חישוב שטח "
  }
});

overrideMeasurementProperty(Cesium.PointMeasurement, {
  instructions: {
        value: [
          "הזז את העכבר כדי לראות את קו האורך, קו הרוחב והגובה של הנקודה"
        ],
  },
  type: {
    value: "קואורדינטות של נקודות"
  }
});