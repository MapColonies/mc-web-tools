import { XMLParser } from 'fast-xml-parser';

const filterQueryByIDs = (ids: string[]): string => {
    let result = '';
    let isMultifilter = ids.length > 1;

    for (let i = 0;i<ids.length;i++) {
      result += `
      <ogc:PropertyIsEqualTo>
        <ogc:PropertyName>mc:id</ogc:PropertyName>
        <ogc:Literal>${ids[i]}</ogc:Literal>
      </ogc:PropertyIsEqualTo>
      `
    }

    if (isMultifilter) {
      result = `<ogc:Or>${result}</ogc:Or>`;
    }

    return result;
  };
  
  export const getRecordsQueryByID = (ids: string[], outputSchema: string)  => {
    return `
        <csw:GetRecords
        maxRecords="${ids.length}"
        outputFormat="application/xml"
        outputSchema="${outputSchema}"
        resultType="results"
        service="CSW"
        version="2.0.2"
        startPosition="1"
        xmlns:mc="${outputSchema}"
        xmlns:csw="http://www.opengis.net/cat/csw/2.0.2"
        xmlns:ogc="http://www.opengis.net/ogc">
            <csw:Query typeNames="csw:Record">
                <csw:ElementSetName>full</csw:ElementSetName>
                <csw:Constraint version="1.1.0">
                    <ogc:Filter>
                        ${filterQueryByIDs(ids)}
                    </ogc:Filter>
                </csw:Constraint>
            </csw:Query>
        </csw:GetRecords>`;
};

export const parseQueryResults = (xml: string, recordType: string): Record<string,unknown>[] => {
    const parser = new XMLParser({ignoreAttributes : false});
    let jObj = parser.parse(xml);
    const res = jObj['csw:GetRecordsResponse']['csw:SearchResults'][recordType];
    if(Array.isArray(res)) {
      return res;
    }
    return [res];
    
} 