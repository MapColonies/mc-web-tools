const idsValidationRegex = new RegExp("^([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})(,[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})*$");
const positionValidationRegex = new RegExp("^(-?\\d*.?\\d+),(-?\\d*.?\\d+),(-?\\d*.?\\d+)$");
const showExtentValidationRegex = new RegExp("^(true|false)$");

export const validateIDsQuery = (idQueried: string): boolean => {
    return idsValidationRegex.test(idQueried);
};

export const validatePositionQuery = (positionQueried: string): boolean => {
    if (!positionValidationRegex.test(positionQueried)) {
        return false;
    }
    const position = positionQueried.split(',');
    if (+position[0] > 180 || +position[0] < -180) {
        return false;
    }
    if (+position[1] > 90 || +position[1] < -90) {
        return false;
    }
    if (+position[2] > 22 || +position[2] < 0) {
        return false;
    }
    return true;
};

export const validateShowExtent = (showExtentQueried: string): boolean => {
    return showExtentValidationRegex.test(showExtentQueried);
};