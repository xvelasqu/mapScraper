import { search } from './mapScraper/placesCrawlerV2';

const query: string = "3D printing service in Estriégana Spain";
const results: any = search(query);

console.log(results);
