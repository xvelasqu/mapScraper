import { HTMLSession } from 'requests-html';
import { unquote } from 'urllib.parse';
import * as json from 'json';

interface Place {
    id: string;
    title: string;
    category: string;
    address: string;
    phoneNumber: string;
    completePhoneNumber: string;
    domain: string;
    url: string;
    coor: string;
    stars: string;
    reviews: string;
}

async function search(query: string): Promise<Place[]> {
    const result: Place[] = [];
    let PAGINATION = 0;

    while (true) {
        const session = new HTMLSession();
        const url = `https://www.google.com/localservices/prolist?hl=en&ssta=1&q=${query}&oq=${query}&src=2&lci=${PAGINATION}`;
        const r = await session.get(url);
        await r.html.render({ timeout: 10 });

        let data_script = r.html.find('#yDmH0d > script:nth-child(12)')[0].text.replace("AF_initDataCallback(", "").replace("'", "").replace("\n", "").slice(0, -2);
        data_script = data_script.replace("{key:", "{\"key\":").replace(", hash:", ", \"hash\":").replace(", data:", ", \"data\":").replace(", sideChannel:", ", \"sideChannel\":");
        data_script = data_script.replace("\"key\": ds:", "\"key\": \"ds: ").replace(", \"hash\":", "\",\"hash\":");
        const parsedData = json.parse(data_script);

        const placesData = parsedData.data[1][0];

        try {
            for (let i = 0; i < placesData.length; i++) {
                const obj: Place = {
                    id: placesData[i][21][0][1][4],
                    title: placesData[i][10][5][1],
                    category: placesData[i][21][9],
                    address: "",
                    phoneNumber: "",
                    completePhoneNumber: "",
                    domain: "",
                    url: "",
                    coor: "",
                    stars: "",
                    reviews: ""
                };

                try {
                    obj.phoneNumber = placesData[i][10][0][0][1][0][0];
                    obj.completePhoneNumber = placesData[i][10][0][0][1][1][0];
                } catch (e) {
                    // Handle error
                }

                try {
                    obj.domain = placesData[i][10][1][1];
                    obj.url = placesData[i][10][1][0];
                } catch (e) {
                    // Handle error
                }

                try {
                    obj.address = unquote(placesData[i][10][8][0][2]).split("&daddr=")[1].replace("+", " ");
                } catch (e) {
                    // Handle error
                }

                try {
                    obj.coor = `${placesData[i][19][0]},${placesData[i][19][1]}`;
                } catch (e) {
                    // Handle error
                }

                try {
                    obj.stars = placesData[i][21][3][0];
                    obj.reviews = placesData[i][21][3][2];
                } catch (e) {
                    // Handle error
                }

                result.push(obj);
            }
        } catch (e) {
            session.close();
            PAGINATION = 0;
            break;
        }

        if (placesData.length < 20) {
            session.close();
            PAGINATION = 0;
            break;
        } else {
            PAGINATION += placesData.length;
        }
    }

    return result;
}
