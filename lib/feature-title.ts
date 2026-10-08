import type {Place} from "./jatlas";

// Editorial display names; the migrated records and their image paths stay intact.
const displayNames:Record<string,string>={
 "01-P0011":"CAPE KAMUI",
 "20-P0008":"KAMIKOCHI",
 "21-P0001":"TAKAYAMA OLD TOWN",
 "06-P0007":"GINZAN ONSEN",
 "09-P0002":"KEGON FALLS",
 "13-P0001":"SENSOJI",
 "17-P0001":"KENROKUEN",
 "26-P0001":"KIYOMIZUDERA",
 "35-P0004":"TSUNOSHIMA BRIDGE",
 "36-P0011":"IYA KAZURABASHI",
 "45-P0011":"TAKACHIHO GORGE",
 "47-P0012":"CAPE ZANPA",
 "11-P0001":"KAWAGOE OLD TOWN",
 "16-P0001":"TOYAMA CASTLE PARK",
 "18-P0001":"FUKUI CASTLE RUINS",
 "25-P0001":"HIKONE CASTLE",
 "28-P0001":"MERIKEN PARK",
 "30-P0001":"WAKAYAMA CASTLE",
 "37-P0001":"RITSURIN GARDEN",
 "38-P0001":"MATSUYAMA CASTLE",
 "39-P0001":"KOCHI CASTLE",
 "43-P0001":"KUMAMOTO CASTLE",
 "46-P0001":"YUNOHIRA OBSERVATORY",
 "47-P0001":"SHURI CASTLE PARK"
};

export function featureTitle(place:Place):string {
 if(displayNames[place.id])return displayNames[place.id];
 const filename=place.photo.src.split(/[?#]/)[0].split("/").at(-1)||"";
 const slug=filename.replace(/^\d{2}-P\d{4}-/,"").replace(/\.(?:webp|jpe?g|png)$/i,"");
 return /^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(slug)?slug.replace(/-/g," ").toUpperCase():place.name;
}

export function featureTitleLines(title:string):string[] {
 if(title.length<=13)return [title];
 const words=title.split(" ");
 if(words.length===1)return [title];
 let split=1,balance=Infinity;
 for(let i=1;i<words.length;i++){
  const difference=Math.abs(words.slice(0,i).join(" ").length-words.slice(i).join(" ").length);
  if(difference<balance){balance=difference;split=i;}
 }
 return [words.slice(0,split).join(" "),words.slice(split).join(" ")];
}
