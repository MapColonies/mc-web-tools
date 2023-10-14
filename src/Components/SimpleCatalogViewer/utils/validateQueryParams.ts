
const idsValidationRegex = new RegExp("^([0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})(,[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12})*$");
const positionValidationRegex = new RegExp("^(-?\\d*.?\\d+),(-?\\d*.?\\d+),(-?\\d*.?\\d+)$");

export const validateIDs = (idQueried: string): boolean => {
    return idsValidationRegex.test(idQueried);
}

export const validatePosition = (positionQueried: string): boolean => {
    return positionValidationRegex.test(positionQueried);
}