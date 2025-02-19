import puppeteer from "puppeteer";
import { PichauLinkCollection } from "../../../collections/StandardLinkCollection";
import { randomUUID } from "crypto";
import { TransferDataObjectFromDOM } from "../../../collections/domRecieverInterface";
import { WS_API_DEFAULT_PAGE_lOAD_TIME } from "../../../lib/env";

export async function PichauScrapStore(CoreUrl:string):Promise<TransferDataObjectFromDOM[]> {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1024 });

    const searchList = CoreUrl;

    await page.goto(searchList, { 
        waitUntil: "networkidle2",
        timeout:Number(WS_API_DEFAULT_PAGE_lOAD_TIME)
     });
    
    await page.waitForNetworkIdle({timeout:Number(WS_API_DEFAULT_PAGE_lOAD_TIME)/2})
    await page.waitForSelector(".MuiGrid-root.MuiGrid-container.MuiGrid-spacing-xs-3")
    const Ps:TransferDataObjectFromDOM[] = await page.evaluate(()=>{
        //Encontra elementos específicos 
        const DOMList = document.querySelector(".MuiGrid-root.MuiGrid-container.MuiGrid-spacing-xs-3") as HTMLDivElement
        const iDivList = DOMList.querySelectorAll(".MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-6.MuiGrid-grid-sm-6.MuiGrid-grid-md-4.MuiGrid-grid-lg-3.MuiGrid-grid-xl-2") as NodeListOf<HTMLDivElement>

        var prepList:TransferDataObjectFromDOM[] = [];

        for(let i=0;i<iDivList.length;i++){
            
            const element = iDivList[i];
            if(element){
                //seleciona os elementos HTML dentro do elemento principal 
                const aReference = element.querySelector("a") as HTMLAnchorElement;
                const imgReference = element.querySelector("img") as HTMLImageElement;
                const h2Reference = element.querySelector("h2");
                const SpanForprice = element.querySelector("span") as HTMLSpanElement;
                const hForTitle = aReference.querySelector("h2.MuiTypography-root.MuiTypography-h6") as HTMLHeadingElement
                var getPromoPriceDiv = element.querySelector("div.jss300")
                let value = getPromoPriceDiv?parseFloat(getPromoPriceDiv.innerHTML.replace(/[^0-9,]/g, '').replace(',', '.')):SpanForprice?parseFloat(SpanForprice.innerHTML.replace(/[^0-9,]/g, '').replace(',', '.')):0

                const spans = document.querySelectorAll("span") as NodeListOf<HTMLSpanElement>;
                var torent:string | null = null
                spans.forEach((span) => {
                    if(span.textContent){
                        if (span.textContent.includes("em até")) {
                            torent = span.textContent
                        }
                    }
                });
                const prepCon:TransferDataObjectFromDOM = {
                    Link:aReference.href,
                    Where:window.location.href.replace("https://www.pichau.com.br","").replace("/",""),
                    description:h2Reference?h2Reference.innerHTML:null,
                    image:imgReference?imgReference.src:null,
                    Price:value,
                    Title:hForTitle.innerHTML,
                    AtRent:torent?torent:null
                }
                prepList.push(prepCon)
            }
        }
        return prepList
    })

    // console.log({
    //     psList:Ps,
    // });

    await page.close();
    await browser.close();

    return Ps
}

// (async()=>{
//    await PichauScrapStore(PichauLinkCollection.subSitesList[0])
// })()