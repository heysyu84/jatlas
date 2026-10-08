import type {OnsenGuide} from "@/lib/jatlas";

export default function OnsenDetails({guide,lang,hideAtmosphere=false}:{guide:OnsenGuide;lang:string;hideAtmosphere?:boolean}) {
 const ko=lang==="ko",text=ko?guide:guide.ja;
 const fields=[
  [ko?"온천수의 특징":"お湯の特徴",text.water],
  ...hideAtmosphere?[]:[[ko?"온천가의 분위기":"温泉街の雰囲気",text.atmosphere]],
  [ko?"당일 입욕":"日帰り入浴",text.dayVisit],
  [ko?"머무는 방법":"滞在のヒント",text.stay],
  [ko?"방문 전에":"訪問のポイント",text.tip]
 ];
 return <section className="detail-section onsen-guide" aria-label={ko?"온천지 정보":"温泉地の情報"}>
  <span className="eyebrow">THE ONSEN</span>
  <h3>{ko?"이곳의 온천을 고르는 이유":"この温泉を選ぶ理由"}</h3>
  <span className="onsen-type">{text.springType}</span>
  <dl>{fields.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
  <div className="onsen-sources"><span>{ko?"온천 공식 자료":"温泉の公式資料"} · {guide.checkedAt}</span>{guide.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{ko?source.name:source.ja||source.name}</a>)}</div>
 </section>;
}
