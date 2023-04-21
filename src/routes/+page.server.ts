import type { PageServerLoad} from './$types'
import pkg from 'papaparse';
const { parse } = pkg;
type InputRecord = { [name: string]: string };
type OutputRecord = { name: string; data: number[] };
function transformData(input: InputRecord[]): OutputRecord[] {
    const output: { [name: string]: OutputRecord } = {};
  
    input.forEach((record: InputRecord) => {
      Object.entries(record).forEach(([name, value]) => {
        if (!output[name]) {
          output[name] = { name, data: [] };
        }
        output[name].data.push(parseInt(value, 10));
      });
    });
  
    return Object.values(output);
}
export const load : PageServerLoad = async () => {

    

    let url="https://docs.google.com/spreadsheets/d/1CSkvPSnopGYe746E7_8j-0fUNfPYi5g0whyCz3lF-t8/export?format=csv&gid=0"
    //fetch url
    let response = await fetch(url)
    //convert to text
    let text = await response.text()
    // Parse the CSV text
    const parsedData = parse(text, { header: true }).data;
    return {
        status: 200, // HTTP status code
        body: {
          lines: transformData(parsedData as InputRecord[]),
        },
      };
}
