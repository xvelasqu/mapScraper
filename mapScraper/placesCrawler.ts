import { HTMLSession } from 'requests-html';
import { unquote } from 'urllib.parse';

function search(query: string): any[] {
    let result: any[] = [];
    let PAGINATION: number = 0;

    while (true) {
        const session = new HTMLSession();
        const url = 'https://www.google.com/localservices/prolist?hl=en&ssta=1&q=' + query + '&oq=gimnasios%20utrera%20espa%C3%B1a&src=2&lci=' + PAGINATION;
        const r = session.get(url);

        r.html.render({ timeout: 20 });

        const title = r.html.find('.xYjf2e');
        const details = r.html.find('.I9iumb:nth-child(2)');
        const rating = r.html.find('.Ty81De');
        const ratingCount = r.html.find('.Ty81De');

        const buttons = r.html.find('.fQqZ2e');

        for (let i = 0; i < title.length; i++) {
            const obj: any = {
                title: title[i].text
            };

            try {
                obj["category"] = details[i].find('.hGz87c:nth-child(2)')[0].text;
            } catch {
                obj["category"] = details[i].find('.hGz87c:nth-child(1)')[0].text;
            }

            try {
                let addressurl = unquote(buttons[i].find("a[aria-label='Directions']")[0].attrs['href']);
                addressurl = addressurl.split("&daddr=");
                addressurl = addressurl[1].split("&ved=");
                addressurl = addressurl[0].replace("+", " ");
                obj["address"] = addressurl;
            } catch {
                obj["address"] = "";
            }

            try {
                obj["website"] = buttons[i].find("a[aria-label='Website']")[0].attrs['href'];
            } catch {
                None;
            }

            try {
                const phonebutton = buttons[i].find("a[aria-label='Call']")[0].attrs['data-phone-number'];
                obj["phoneNumber"] = phonebutton;
            } catch {
                None;
            }

            try {
                const ratingdata = ratingCount[i].text.replace("\n", "--");
                if ("(" in ratingdata) {
                    obj["rating"] = parseFloat(ratingdata.split("--")[0].replace(",", "."));
                } else {
                    obj["rating"] = 0;
                }
                if ("(" in ratingdata) {
                    obj["ratingCount"] = parseInt(ratingdata.split("--")[1].replace("(", "").replace(")", ""));
                } else {
                    obj["ratingCount"] = 0;
                }
            } catch {
                obj["ratingCount"] = 0;
            }

            if (obj["address"].length > 1) {
                result.push(JSON.stringify(obj));
            }
        }
        session.close();

        if (title.length < 20) {
            PAGINATION = 0;
            break;
        } else {
            PAGINATION += title.length;
        }
    }

    return result;
}
